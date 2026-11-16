/* =====================================================================
   PortraitScene — turns a real photograph into a Three.js particle portrait.

   Pipeline
   1. Draw the photo onto an offscreen <canvas> and read its pixels.
   2. Mask out the plain background (bright, low-contrast pixels) and
      fill each scanline so the shirt keeps its white pattern.
   3. Sample N pixels (denser on detailed areas like eyes / brows / beard),
      so the particle positions come straight from the photograph.
   4. Depth = luminance + a soft face bulge. Colour = luminance mapped onto
      a blue → orange → white ramp.
   5. A vertex shader assembles / dissolves the cloud from scroll progress
      and pushes particles away from the pointer.
   ===================================================================== */
import * as THREE from '../vendor/three.module.min.js';
import { PHOTO_FALLBACK } from './photo-fallback.js';

const clamp  = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix    = (a, b, t) => a + (b - a) * t;
const rand   = (a, b) => a + Math.random() * (b - a);

const PORTRAIT_H = 6.2;          // world-space height of the portrait
const CAM_Z = 8;

/* ---------------- image → pixels ---------------- */
function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}
function readPixels(img, maxW) {
  const w = maxW, h = Math.round(maxW * img.naturalHeight / img.naturalWidth);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, w, h);
  return { w, h, d: x.getImageData(0, 0, w, h).data };   // throws if the canvas is tainted
}
async function getPixels(url, maxW) {
  try { return readPixels(await loadImage(url), maxW); }
  catch (e) {
    // e.g. opened via file:// (tainted canvas) or image missing → embedded copy
    console.warn('[portrait] using embedded photo copy:', e && e.name);
    return readPixels(await loadImage(PHOTO_FALLBACK), maxW);
  }
}

/* ---------------- pixels → particle attributes ---------------- */
function buildParticles(px, count) {
  const { w, h, d } = px, n = w * h;
  const lum = new Float32Array(n), fg = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    lum[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    fg[i] = Math.min(r, g, b) < 232 ? 1 : 0;           // not "paper white"
  }
  // remove speckles
  const clean = new Uint8Array(n);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; if (!fg[i]) continue;
    let c = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) c += fg[i + dy * w + dx];
    clean[i] = c >= 5 ? 1 : 0;
  }
  // fill each scanline between its first and last foreground pixel (keeps bright shirt pattern)
  for (let y = 0; y < h; y++) {
    let a = -1, b = -1;
    for (let x = 0; x < w; x++) if (clean[y * w + x]) { if (a < 0) a = x; b = x; }
    if (a >= 0) for (let x = a; x <= b; x++) clean[y * w + x] = 1;
  }
  // sampling weights: more particles on detailed pixels
  const idx = [], cum = [];
  let total = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; if (!clean[i]) continue;
    const gx = lum[i + 1] - lum[i - 1], gy = lum[i + w] - lum[i - w];
    const g = Math.min(1, Math.hypot(gx, gy) * 3.2);
    total += 1 + 1.4 * g;
    idx.push(i); cum.push(total);
  }

  const pos = new Float32Array(count * 3), scatter = new Float32Array(count * 3);
  const col = new Float32Array(count * 3), seed = new Float32Array(count), size = new Float32Array(count);
  const B = [0.26, 0.46, 1.0], O = [1.0, 0.56, 0.22], W = [1, 1, 1];
  const fcx = 0.48, fcy = 0.37, frx = 0.36, fry = 0.34;       // face ellipse (relative)

  let k = 0;
  for (let p = 0; p < count; p++) {
    const r = (p + Math.random()) / count * total;
    while (cum[k] < r && k < cum.length - 1) k++;
    const i = idx[k], px_ = i % w, py_ = (i / w) | 0;
    const L = lum[i];
    const x = ((px_ + rand(-.5, .5)) - w / 2) / h * PORTRAIT_H;
    const y = (h / 2 - (py_ + rand(-.5, .5))) / h * PORTRAIT_H;
    const dx = (px_ / w - fcx) / frx, dy = (py_ / h - fcy) / fry;
    const bulge = Math.max(0, 1 - (dx * dx + dy * dy));
    const z = bulge * 0.95 + (L - 0.5) * 0.35 - Math.abs(x) * 0.05 + rand(-.035, .035);
    pos.set([x, y, z], p * 3);

    // blue (shadows) → orange (mid-tones) → white (highlights); brightness keeps the face readable
    const lc = Math.pow(clamp((L - 0.03) / 0.92), 0.6);          // lift mid-tones so the face reads clearly
    const t1 = smooth(0.12, 0.5, lc), t2 = smooth(0.5, 0.88, lc);
    let c = [0, 0, 0];
    for (let q = 0; q < 3; q++) c[q] = mix(mix(B[q], O[q], t1), W[q], t2);
    const yy = py_ / h;
    const bri = (0.34 + 0.66 * lc) * (yy > 0.62 ? 0.78 : 1) * (1 - smooth(0.82, 1, yy) * 0.92);   // calm the shirt, feather the bottom edge
    const sp = Math.random();                                  // a few pure accent sparks
    if (sp < 0.04) c = B; else if (sp < 0.07) c = O;
    col.set([c[0] * bri, c[1] * bri, c[2] * bri], p * 3);

    // where each particle starts: a wide, shallow cloud
    scatter.set([rand(-15, 15), rand(-9, 9), rand(-9, 4)], p * 3);
    seed[p] = Math.random();
    size[p] = rand(0.8, 1.45);
  }
  return { pos, scatter, col, seed, size };
}

/* ---------------- shaders ---------------- */
const PORTRAIT_VERT = /* glsl */`
attribute vec3 aScatter; attribute vec3 aColor; attribute float aSeed; attribute float aSize;
uniform float uAssemble, uDissolve, uTime, uPx, uAlpha, uScale;
uniform vec3 uMouse; uniform float uMouseR;
varying vec3 vColor; varying float vA;
float eo(float t){ return 1.-pow(1.-t,3.); }
void main(){
  float a = smoothstep(aSeed*.5, .5+aSeed*.5, uAssemble);       // staggered assemble
  float e = eo(a);
  vec3 p = mix(aScatter, position, e);
  float tr = sin(a*3.14159);                                    // swirl while travelling
  p += vec3(cos(aSeed*40.+uTime*.6), sin(aSeed*31.+uTime*.5), cos(aSeed*23.+uTime*.4))*tr*1.4;
  p += vec3(sin(uTime*.8+aSeed*60.), cos(uTime*.7+aSeed*45.), sin(uTime*.6+aSeed*30.))*(.014*a + .35*(1.-a));

  float d = smoothstep(aSeed*.55, .45+aSeed*.55, uDissolve);    // staggered dissolve
  vec3 dir = normalize(vec3(position.x*.5+(aSeed-.5)*3., position.y*.4+(fract(aSeed*7.)-.2)*3., 1.2+aSeed*2.));
  p += dir*d*(2.5+aSeed*9.);

  vec4 wp = modelMatrix*vec4(p,1.);
  vec2 dm = wp.xy-uMouse.xy; float dist = length(dm);
  float f = smoothstep(uMouseR, 0., dist);                      // pointer repulsion
  wp.xy += normalize(dm+1e-4)*f*f*.32*a*(1.-d);
  wp.z  += f*.5*a;

  vec4 mv = viewMatrix*wp;
  gl_Position = projectionMatrix*mv;
  gl_PointSize = max(1.35, aSize*(0.9+.7*f)*uPx*uScale/(-mv.z));
  vColor = aColor;
  vA = uAlpha*(1.-smoothstep(.5,1.,d))*mix(.4,1.,a);
}`;
const PORTRAIT_FRAG = /* glsl */`
varying vec3 vColor; varying float vA;
void main(){
  vec2 c = gl_PointCoord-.5; float r2 = dot(c,c)*4.;
  if(r2>1.) discard;
  float core = 1.-smoothstep(.15,1.,r2), glow = exp(-r2*3.);
  gl_FragColor = vec4(vColor*(core*.85+glow*.3)*vA, 1.);
}`;
const DUST_VERT = /* glsl */`
attribute float aSeed; attribute vec3 aColor;
uniform float uTime, uScroll, uPx; uniform vec2 uMouse;
varying vec3 vColor;
void main(){
  vec3 p = position;
  p.x += sin(uTime*.12+aSeed*30.)*.8 + uMouse.x*(.4+aSeed);
  p.y += cos(uTime*.1+aSeed*20.)*.6 + uScroll*(.6+aSeed*1.6) + uMouse.y*(.3+aSeed);
  p.y = mod(p.y+9., 18.)-9.;
  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_Position = projectionMatrix*mv;
  gl_PointSize = max(1., (.6+aSeed*1.2)*uPx/(-mv.z));
  vColor = aColor*(.25+aSeed*.5);
}`;
const DUST_FRAG = /* glsl */`
varying vec3 vColor;
void main(){ vec2 c=gl_PointCoord-.5; if(dot(c,c)>.25) discard; gl_FragColor=vec4(vColor,1.); }`;

/* ===================================================================== */
export class PortraitScene {
  constructor(canvas, { photoUrl, reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.photoUrl = photoUrl;
    this.reduced = reducedMotion;
    this.state = { assemble: 0, dissolve: 0, shift: 0, scroll: 0 };
    this.mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    this.mouseWorld = new THREE.Vector3(999, 999, 0);
    this.raf = 0; this.running = false; this.disposed = false;
    this.heroVisible = true;
    this._onResize = () => this.layout();
    this._onVis = () => { if (!document.hidden && this.running) this._loopStart(); };
  }

  static supported() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch { return false; }
  }

  /** particle budget by device class */
  static budget() {
    const w = innerWidth, cores = navigator.hardwareConcurrency || 4;
    let n = w >= 1100 ? 28000 : w >= 700 ? 16000 : 9000;
    if (cores <= 4) n = Math.round(n * 0.75);
    return n;
  }

  async init(onProgress = () => {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x050506, 1);
    this.pr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.5 : 2);
    this.renderer.setPixelRatio(this.pr);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, CAM_Z);
    this.group = new THREE.Group();
    this.scene.add(this.group);

    onProgress(.1);
    const count = PortraitScene.budget();
    const px = await getPixels(this.photoUrl, innerWidth < 700 ? 240 : 360);
    onProgress(.55);
    const P = buildParticles(px, count);
    onProgress(.85);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P.pos, 3));
    geo.setAttribute('aScatter', new THREE.BufferAttribute(P.scatter, 3));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(P.col, 3));
    geo.setAttribute('aSeed',    new THREE.BufferAttribute(P.seed, 1));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(P.size, 1));
    this.uniforms = {
      uAssemble: { value: 0 }, uDissolve: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 },
      uAlpha: { value: 1 }, uScale: { value: 1 }, uMouse: { value: this.mouseWorld }, uMouseR: { value: 1.2 },
    };
    this.portraitMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader: PORTRAIT_VERT, fragmentShader: PORTRAIT_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(geo, this.portraitMat);
    this.points.frustumCulled = false;
    this.group.add(this.points);

    // ambient dust (always on, very cheap)
    const nd = innerWidth < 700 ? 260 : 650;
    const dp = new Float32Array(nd * 3), dc = new Float32Array(nd * 3), ds = new Float32Array(nd);
    for (let i = 0; i < nd; i++) {
      dp.set([rand(-16, 16), rand(-9, 9), rand(-14, 2)], i * 3);
      const r = Math.random();
      dc.set(r < .6 ? [1, 1, 1] : r < .82 ? [.26, .46, 1] : [1, .56, .22], i * 3);
      ds[i] = Math.random();
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    dg.setAttribute('aColor', new THREE.BufferAttribute(dc, 3));
    dg.setAttribute('aSeed', new THREE.BufferAttribute(ds, 1));
    this.dustU = { uTime: { value: 0 }, uScroll: { value: 0 }, uPx: { value: 1 }, uMouse: { value: new THREE.Vector2() } };
    this.dust = new THREE.Points(dg, new THREE.ShaderMaterial({
      uniforms: this.dustU, vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);

    this.canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.onLost && this.onLost(); });
    addEventListener('resize', this._onResize);
    document.addEventListener('visibilitychange', this._onVis);
    this.layout();
    onProgress(1);
  }

  layout() {
    if (!this.renderer) return;
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    this.viewH = 2 * Math.tan(fov / 2) * CAM_Z;
    this.viewW = this.viewH * this.camera.aspect;
    const mobile = w < 768 || this.camera.aspect < 0.9;
    const targetH = mobile ? this.viewH * 0.5 : this.viewH * 0.8;
    this.baseScale = targetH / PORTRAIT_H;
    this.finalX = mobile ? 0 : this.viewW * 0.2;
    this.finalY = mobile ? this.viewH * 0.17 : 0;
    const buf = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const px = buf.y / (2 * Math.tan(fov / 2)) * 0.026;
    this.uniforms.uPx.value = px;
    this.dustU.uPx.value = buf.y / (2 * Math.tan(fov / 2)) * 0.03;
    this.uniforms.uMouseR.value = this.viewH * 0.075;
    this.render(performance.now() / 1000);
  }

  setState(s) { Object.assign(this.state, s); if (!this.running) this.render(performance.now() / 1000); }
  setMouse(nx, ny) { this.mouse.x = nx; this.mouse.y = ny; }
  setHeroVisible(v) { this.heroVisible = v; if (!this.running && this.renderer) this.render(performance.now() / 1000); }

  start() {
    if (this.reduced || this.running) { this.render(performance.now() / 1000); return; }
    this.running = true; this._loopStart();
  }
  _loopStart() {
    cancelAnimationFrame(this.raf);
    this.clockT = performance.now();
    const tick = (now) => {
      if (this.disposed || !this.running) return;
      this.raf = requestAnimationFrame(tick);
      this.render(now / 1000);
    };
    this.raf = requestAnimationFrame(tick);
  }

  render(t) {
    if (this.disposed) return;
    const s = this.state, m = this.mouse, u = this.uniforms;
    m.sx += (m.x - m.sx) * 0.06; m.sy += (m.y - m.sy) * 0.06;

    u.uTime.value = t; this.dustU.uTime.value = t;
    u.uAssemble.value = s.assemble;
    u.uDissolve.value = s.dissolve;
    u.uAlpha.value = 1 - smooth(0.9, 1, s.dissolve);
    this.dustU.uScroll.value = s.scroll;
    this.dustU.uMouse.value.set(m.sx, m.sy);

    // camera: gentle dolly + pointer parallax
    const dolly = CAM_Z + (1 - s.assemble) * 1.6 - s.dissolve * 1.2;
    this.camera.position.set(m.sx * 0.55, -m.sy * 0.35, dolly);
    this.camera.lookAt(0, 0, 0);

    // group transform (shift to the right once the name appears)
    const sh = s.shift * s.shift * (3 - 2 * s.shift);
    const sc = this.baseScale * mix(0.92, 1, s.assemble);
    this.group.scale.setScalar(sc);
    this.group.position.set(this.finalX * sh, this.finalY * sh, 0);
    this.group.rotation.set(-m.sy * 0.08 + Math.sin(t * 0.25) * 0.015, m.sx * 0.28 + Math.sin(t * 0.2) * 0.03 - (1 - s.assemble) * 0.5, 0);
    u.uScale.value = sc;

    this.points.visible = this.heroVisible && s.dissolve < 0.995;

    // pointer → world position on the z=0 plane
    this.camera.updateMatrixWorld();
    const v = this._v || (this._v = new THREE.Vector3());
    v.set(m.sx, -m.sy, 0.5).unproject(this.camera);           // NDC y is up, pointer y is down
    const dir = v.sub(this.camera.position).normalize();
    const k = -this.camera.position.z / dir.z;
    this.mouseWorld.copy(this.camera.position).addScaledVector(dir, k);
    if (this.reduced) this.mouseWorld.set(999, 999, 0);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true; this.running = false;
    cancelAnimationFrame(this.raf);
    removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVis);
    this.scene && this.scene.traverse(o => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); });
    this.renderer && this.renderer.dispose();
  }
}
