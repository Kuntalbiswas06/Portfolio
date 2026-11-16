/* =====================================================================
   main.js — page orchestration
   Lenis (smooth scroll) ↔ GSAP ScrollTrigger ↔ Three.js particle portrait
   ===================================================================== */
import { SITE, LINKS, ROLES, SKILLS, LEVELS, PROJECTS, JOURNEY, IDENTITY, GITHUB_USER, GITHUB_CACHE_MINUTES } from './config.js';
import { PortraitScene } from './portrait.js';
import { previewArt } from './previews.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, Lenis = window.Lenis;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
const root = document.documentElement;

document.body.classList.add('is-loading');
$('#year').textContent = new Date().getFullYear();

/* ---------------------------------------------------------------
   1. Smooth scroll (Lenis) wired into GSAP's ticker
   --------------------------------------------------------------- */
let lenis = null;
if (!reduced && Lenis) {
  lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();                                        // locked until the loader finishes
}
function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.7, easing: t => 1 - Math.pow(1 - t, 4) });
  else {
    const y = typeof target === 'number' ? target : (target === 'top' ? 0 : $(target).getBoundingClientRect().top + scrollY);
    scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }
}

/* ---------------------------------------------------------------
   2. Build data-driven sections
   --------------------------------------------------------------- */
const iconSrc = n => `public/icons/${n}.svg`;

/* --- skills --- */
const catsEl = $('#cats'), chipsEl = $('#chips'), blurbEl = $('#stageBlurb');
let activeCat = -1, tilting = [];
SKILLS.forEach((s, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button class="cat" role="tab" data-i="${i}"><span class="n">0${i + 1}</span><span class="t">${s.title}</span><span class="c">${s.items.length}</span></button>`;
  catsEl.appendChild(li);
});
function chipHTML(it, i) {
  const icon = it.icon
    ? `<img class="ic ${it.invert ? 'inv' : ''}" src="${iconSrc(it.icon)}" alt="" width="52" height="52" loading="lazy">`
    : `<span class="mn">${it.mono || it.name.slice(0, 2)}</span>`;
  return `<li class="chip" data-level="${it.level}" style="--d:${(i * -0.9).toFixed(1)}s" tabindex="0">${icon}<span class="nm">${it.name}<span class="lv">${LEVELS[it.level] || it.level}</span></span></li>`;
}
function selectCat(i, instant = false) {
  if (i === activeCat) return;
  activeCat = i;
  $$('.cat', catsEl).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
  const s = SKILLS[i];
  const render = () => {
    blurbEl.textContent = `0${i + 1} — ${s.blurb}`;
    chipsEl.innerHTML = s.items.map(chipHTML).join('');
    bindTilt();
    if (!reduced) gsap.fromTo($$('.chip', chipsEl), { autoAlpha: 0, y: 44, rotateX: -40, transformPerspective: 800 },
      { autoAlpha: 1, y: 0, rotateX: 0, duration: .9, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
  };
  if (instant || reduced || !chipsEl.children.length) render();
  else gsap.to($$('.chip', chipsEl), { autoAlpha: 0, y: -20, duration: .22, stagger: .02, onComplete: render });
}
function bindTilt() {
  if (!finePointer || reduced) return;
  $$('.chip', chipsEl).forEach(chip => {
    chip.addEventListener('pointermove', e => {
      const r = chip.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(chip, { rotateY: x * 26, rotateX: -y * 26, transformPerspective: 700, duration: .35, ease: 'power2.out', overwrite: 'auto' });
    });
    chip.addEventListener('pointerleave', () => gsap.to(chip, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.6)', overwrite: 'auto' }));
  });
}
catsEl.addEventListener('click', e => { const b = e.target.closest('.cat'); if (b) selectCat(+b.dataset.i); });
if (finePointer) catsEl.addEventListener('pointerover', e => { const b = e.target.closest('.cat'); if (b) selectCat(+b.dataset.i); });
selectCat(0, true);

/* --- marquee --- */
const allTech = SKILLS.flatMap(s => s.items);
function marqueeHTML(items) {
  const one = items.map(it => `<span class="m-item">${it.icon ? `<img class="${it.invert ? 'inv' : ''}" src="${iconSrc(it.icon)}" alt="" loading="lazy">` : ''}${it.name}<i class="sep"></i></span>`).join('');
  return one + one;
}
$('#mRow1').innerHTML = marqueeHTML(allTech);
$('#mRow2').innerHTML = marqueeHTML([...allTech].reverse());
const marqueeTweens = [];
if (!reduced) {
  marqueeTweens.push(gsap.to('#mRow1', { xPercent: -50, duration: 60, ease: 'none', repeat: -1 }));
  marqueeTweens.push(gsap.fromTo('#mRow2', { xPercent: -50 }, { xPercent: 0, duration: 70, ease: 'none', repeat: -1 }));
  if (lenis) lenis.on('scroll', ({ velocity }) => {
    const ts = 1 + Math.min(Math.abs(velocity) * 0.35, 6);
    marqueeTweens.forEach(t => gsap.to(t, { timeScale: ts, duration: .3, overwrite: true }));
    clearTimeout(lenis._mq);
    lenis._mq = setTimeout(() => marqueeTweens.forEach(t => gsap.to(t, { timeScale: 1, duration: 1.2, overwrite: true })), 120);
  });
}

/* --- projects --- */
const projectsEl = $('#projects');
projectsEl.innerHTML = PROJECTS.map(p => {
  const stack = p.stack && p.stack.length
    ? p.stack.map(t => `<li>${t}</li>`).join('')
    : `<li class="ph" title="Add your tech stack in js/config.js">+ add tech stack</li>`;
  const links = [
    p.github ? `<a class="pill solid" href="${p.github}" target="_blank" rel="noopener" data-magnetic>GitHub <span>↗</span></a>` : '',
    p.live ? `<a class="pill" href="${p.live}" target="_blank" rel="noopener" data-magnetic>Live demo <span>↗</span></a>` : '',
    (!p.github && !p.live) ? `<span class="pill off">Repository — coming soon</span>` : '',
  ].join('');
  const media = p.image ? `<img src="${p.image}" alt="${p.name} screenshot" loading="lazy">` : previewArt(p.id);
  const href = p.live || p.github;
  const tag = href ? 'a' : 'div';
  const attrs = href ? `href="${href}" target="_blank" rel="noopener"` : '';
  return `
  <article class="project" data-project>
    <div class="p-info">
      <p class="p-kind mono"><b>${p.n}</b><span>${p.kind}</span></p>
      <h3 class="p-title" data-split>${p.name}</h3>
      <p class="p-desc">${p.desc}</p>
      <ul class="stack">${stack}</ul>
      <div class="p-links">${links}</div>
    </div>
    <${tag} class="preview" ${attrs} data-cursor="${href ? 'Open' : 'Preview'}" aria-label="${p.name} preview">
      <div class="pv">${media}</div>
      ${p.image ? '' : '<span class="tag mono">Placeholder preview</span>'}
    </${tag}>
  </article>`;
}).join('');

/* --- timeline --- */
const tlEl = $('#timeline');
JOURNEY.forEach((j, i) => {
  const li = document.createElement('li');
  li.className = 'tl-item';
  li.innerHTML = `<div class="tl-body"><span class="tl-n mono">Stage 0${i + 1}</span><h3 class="tl-t">${j.t}${j.now ? '<span class="tl-now">NOW</span>' : ''}</h3><p class="tl-d">${j.d}</p></div><i class="tl-dot"></i>`;
  tlEl.appendChild(li);
});

/* --- contact links --- */
const toast = $('#toast'); let toastT;
function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 3800); }
$('#links').innerHTML = Object.values(LINKS).map((l, i) => `
  <li><a class="lk" href="${l.url}" ${l.download ? 'download' : ''} ${/^https?:/.test(l.url) ? 'target="_blank" rel="noopener"' : ''} data-cursor="${l.label === 'Email' ? 'Write' : 'Open'}" ${l.placeholder ? 'data-placeholder' : ''}>
    <span class="k">0${i + 1}</span><span class="l">${l.label}</span>
    ${l.placeholder ? '<span class="rep">REPLACE ME</span>' : ''}
    <span class="h">${l.handle}</span><span class="a">↗</span>
  </a></li>`).join('');
$('#links').addEventListener('click', e => {
  const a = e.target.closest('[data-placeholder]');
  if (a) { e.preventDefault(); showToast('Placeholder — set your real link in js/config.js (LINKS).'); }
});

/* ---------------------------------------------------------------
   3. Hero typing animation
   --------------------------------------------------------------- */
(function typer() {
  const el = $('#typed');
  if (reduced) { el.textContent = ROLES[0]; $('.caret').style.display = 'none'; return; }
  let w = 0, c = 0, del = false;
  const tick = () => {
    const word = ROLES[w];
    c += del ? -1 : 1;
    el.textContent = word.slice(0, c);
    let d = del ? 30 : 70;
    if (!del && c === word.length) { del = true; d = 1600; }
    else if (del && c === 0) { del = false; w = (w + 1) % ROLES.length; d = 380; }
    setTimeout(tick, d);
  };
  tick();
})();

/* ---------------------------------------------------------------
   4. Particle portrait + hero scroll timeline
   --------------------------------------------------------------- */
const portraitState = { assemble: 0, dissolve: 0, shift: 0 };
let portrait = null;

async function bootPortrait() {
  const pctEl = $('#loaderPct');
  const loaderVal = { v: 0 };
  const setPct = v => gsap.to(loaderVal, { v: v * 100, duration: .5, onUpdate: () => pctEl.textContent = Math.round(loaderVal.v) });

  if (!PortraitScene.supported()) { root.classList.add('no-webgl'); return null; }
  try {
    const p = new PortraitScene($('#gl'), { photoUrl: SITE.photo, reducedMotion: reduced });
    p.onLost = () => { root.classList.add('no-webgl'); p.dispose(); portrait = null; };
    await p.init(setPct);
    return p;
  } catch (err) {
    console.error('[portfolio] WebGL portrait failed — using the static photograph.', err);
    root.classList.add('no-webgl');
    return null;
  }
}

function buildHeroTimeline() {
  const push = () => portrait && portrait.setState(portraitState);
  const pct = $('#assemblePct');
  const noGL = root.classList.contains('no-webgl');

  // the fixed canvas only needs to draw the portrait while the hero is on screen
  ScrollTrigger.create({
    trigger: '#hero', start: 'top bottom', end: 'bottom top',
    onToggle: self => portrait && portrait.setHeroVisible(self.isActive),
  });

  if (reduced) {                                      // static final composition, no scroll choreography
    Object.assign(portraitState, { assemble: 1, shift: 1, dissolve: 0 });
    push();
    $('#assembleLabel').style.display = 'none'; $('#heroCue').style.display = 'none';
    return;
  }

  if (noGL) {                                         // static photograph fallback: text in on load, out on scroll
    $('#assembleLabel').style.display = 'none';
    gsap.fromTo('[data-h=line]', { yPercent: 118 }, { yPercent: 0, duration: 1.2, stagger: .1, ease: 'power4.out', delay: .6 });
    gsap.fromTo('[data-h=fade]', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1, stagger: .1, ease: 'power3.out', delay: 1 });
    gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: .6 } })
      .to('#heroText', { autoAlpha: 0, duration: .15 }, .78).to('.hero-fallback', { autoAlpha: 0, duration: .15 }, .8)
      .to({}, { duration: 0 }, 1);
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });
  tl.to(portraitState, { assemble: 1, duration: .4, ease: 'power2.inOut',
      onUpdate() { push(); pct.textContent = Math.round(portraitState.assemble * 100) + '%'; } }, 0)
    .to('#heroCue', { autoAlpha: 0, duration: .05 }, .03)
    .to('#assembleLabel', { autoAlpha: 0, duration: .08 }, .31)
    .to('.hero-meta', { autoAlpha: 0, duration: .06 }, .36)
    .to(portraitState, { shift: 1, duration: .22, ease: 'power2.inOut', onUpdate: push }, .3)
    .fromTo('[data-h=line]', { yPercent: 118 }, { yPercent: 0, duration: .15, stagger: .035, ease: 'power3.out' }, .4)
    .fromTo('[data-h=fade]', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .12, stagger: .03, ease: 'power2.out' }, .46)
    .to(portraitState, { dissolve: 1, duration: .22, ease: 'power1.in', onUpdate: push }, .78)
    .to('#heroText', { autoAlpha: 0, duration: .12, ease: 'power1.in' }, .78);

  // background dust drifts with scroll
  const onScroll = () => portrait && portrait.setState({ scroll: scrollY / innerHeight * 0.35 });
  lenis ? lenis.on('scroll', onScroll) : addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------------------------------------------------------
   5. Scroll-triggered reveals, parallax, timeline
   --------------------------------------------------------------- */
function splitWords(el) {
  const out = [];
  (function walk(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = tok;
          w.appendChild(i); frag.appendChild(w); out.push(i);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  })(el);
  return out;
}

function buildScrollAnimations() {
  $$('[data-split]').forEach(el => {
    const words = splitWords(el);
    if (reduced) return;
    gsap.from(words, { yPercent: 118, duration: 1.1, stagger: .022, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  $$('.sec-head').forEach(h => ScrollTrigger.create({ trigger: h, start: 'top 90%', once: true, onEnter: () => h.classList.add('in') }));

  if (reduced) {
    $$('.tl-item').forEach(i => i.classList.add('on'));
    $('#tlFill').style.transform = 'scaleY(1)';
    return;
  }

  // photo: mask reveal + parallax
  gsap.to('#phMask', { clipPath: 'inset(0 0 0% 0)', duration: 1.6, ease: 'power4.inOut',
    scrollTrigger: { trigger: '#phMask', start: 'top 82%', once: true } });
  gsap.fromTo('[data-parallax]', { yPercent: -7 }, { yPercent: 7, ease: 'none',
    scrollTrigger: { trigger: '#phMask', start: 'top bottom', end: 'bottom top', scrub: true } });

  // about copy
  gsap.from('.facts > div', { y: 40, autoAlpha: 0, duration: 1, stagger: .1, ease: 'power3.out',
    scrollTrigger: { trigger: '.facts', start: 'top 88%', once: true } });

  // skills stage
  gsap.from('.cats .cat', { x: -30, autoAlpha: 0, duration: .9, stagger: .08, ease: 'power3.out',
    scrollTrigger: { trigger: '.cats', start: 'top 85%', once: true } });

  // projects: clip reveal + parallax of inner media + text offset
  $$('.project').forEach(p => {
    const pv = $('.preview', p), media = $('.pv', p), info = $('.p-info', p);
    gsap.fromTo(pv, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'power4.inOut',
      scrollTrigger: { trigger: p, start: 'top 78%', once: true } });
    gsap.fromTo(media, { yPercent: -5 }, { yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(info, { y: 60 }, { y: -40, ease: 'none',
      scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($$('.p-kind,.p-desc,.stack,.p-links', p), { y: 30, autoAlpha: 0, duration: 1, stagger: .09, ease: 'power3.out',
      scrollTrigger: { trigger: p, start: 'top 75%', once: true } });
  });

  // timeline
  gsap.to('#tlFill', { scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: .6 } });
  $$('.tl-item').forEach(it => ScrollTrigger.create({
    trigger: it, start: 'top 62%',
    onEnter: () => it.classList.add('on'), onLeaveBack: () => it.classList.remove('on'),
  }));

  // contact links
  gsap.from('.lk', { y: 50, autoAlpha: 0, duration: 1, stagger: .1, ease: 'power3.out',
    scrollTrigger: { trigger: '#links', start: 'top 85%', once: true } });
}

/* ---------------------------------------------------------------
   6. Interaction layer: cursor, spotlight, magnetic, tilt, nav
   --------------------------------------------------------------- */
function buildInteractions() {
  const spot = $('.spot');
  const cur = $('.cursor'), dot = $('.c-dot'), ring = $('.c-ring'), label = $('.c-label');
  const m = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };

  addEventListener('pointermove', e => {
    m.x = e.clientX; m.y = e.clientY;
    spot.style.setProperty('--mx', m.x + 'px'); spot.style.setProperty('--my', m.y + 'px');
    portrait && portrait.setMouse(m.x / innerWidth * 2 - 1, m.y / innerHeight * 2 - 1);
  }, { passive: true });

  if (finePointer && !reduced) {
    document.body.classList.add('has-cursor');
    gsap.ticker.add(() => {
      m.rx += (m.x - m.rx) * .18; m.ry += (m.y - m.ry) * .18;
      dot.style.transform = `translate(${m.x}px,${m.y}px)`;
      ring.style.transform = `translate(${m.rx}px,${m.ry}px)`;
    });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cur.classList.add('hot'); }
      else cur.classList.remove('hot');
      cur.classList.toggle('link', !t && !!e.target.closest('a,button,.cat,.chip'));
    });
    addEventListener('pointerdown', () => cur.classList.add('down'));
    addEventListener('pointerup', () => cur.classList.remove('down'));
    document.documentElement.addEventListener('mouseleave', () => cur.style.opacity = 0);
    document.documentElement.addEventListener('mouseenter', () => cur.style.opacity = 1);
  } else spot.style.display = 'none';

  // magnetic elements
  if (finePointer && !reduced) {
    $$('[data-magnetic], .nav-cta, .nav-logo, .burger').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' }), my = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * .35); my((e.clientY - (r.top + r.height / 2)) * .35);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });

    // project preview 3-D tilt
    $$('.preview').forEach(pv => {
      pv.addEventListener('pointermove', e => {
        const r = pv.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(pv, { rotateY: x * 9, rotateX: -y * 9, transformPerspective: 1100, duration: .5, ease: 'power2.out', overwrite: 'auto' });
      });
      pv.addEventListener('pointerleave', () => gsap.to(pv, { rotateX: 0, rotateY: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' }));
    });
  }

  /* navigation */
  const menu = $('#menu'), burger = $('#burger');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    lenis && (open ? lenis.stop() : lenis.start());
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  $$('[data-nav]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const wasOpen = menu.classList.contains('open');
    setMenu(false);
    const go = () => scrollToTarget(href === '#hero' ? 0 : href);
    wasOpen ? setTimeout(go, 60) : go();
  }));

  // active section + counter
  const names = $$('[data-section]');
  names.forEach((s, i) => ScrollTrigger.create({
    trigger: s, start: 'top 55%', end: 'bottom 55%',
    onToggle: self => {
      if (!self.isActive) return;
      if (!s.id || !$('.nav-links a[href="#' + s.id + '"]')) return;
            $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + s.id));
    },
  }));

  // progress bar + hide nav when scrolling down
  const bar = $('.progress i'), nav = $('#nav'); let last = 0;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
    nav.classList.toggle('hide', y > last && y > innerHeight * .6 && !menu.classList.contains('open'));
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

/* ---------------------------------------------------------------
   7. Boot
   --------------------------------------------------------------- */
async function boot() {
  portrait = await bootPortrait();
  buildHeroTimeline();
  buildScrollAnimations();
  buildInteractions();
  portrait && portrait.start();

  const finish = () => {
    $('#loaderPct').textContent = '100';
    $('#loader').classList.add('done');
    document.body.classList.remove('is-loading');
    lenis && lenis.start();
    ScrollTrigger.refresh();
    if (!reduced) gsap.from('#nav', { yPercent: -100, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: .3 });
  };
  setTimeout(finish, 450);
  (document.fonts && document.fonts.ready || Promise.resolve()).then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
}

boot().catch(err => {
  // never leave the visitor stuck behind the loader
  console.error(err);
  root.classList.add('no-webgl');
  $('#loader').classList.add('done');
  document.body.classList.remove('is-loading');
});
setTimeout(() => { $('#loader').classList.add('done'); document.body.classList.remove('is-loading'); lenis && lenis.start(); }, 9000);

/* tidy up on navigation away (avoids leaking GL resources in SPAs / bfcache) */
addEventListener('pagehide', () => portrait && portrait.dispose());


/* ---------------------------------------------------------------
   8. Identity selector
   --------------------------------------------------------------- */
(function identity() {
  const tabs = $('#idTabs'), text = $('#idText'), tags = $('#idTags'), stage = $('#idStage');
  tabs.innerHTML = IDENTITY.map((d, i) => `<button class="id-tab" role="tab" id="idt${i}" data-i="${i}"><span class="mono">0${i + 1}</span><span class="t">${d.title}</span></button>`).join('');
  const show = (i, instant) => {
    const d = IDENTITY[i];
    $$('.id-tab', tabs).forEach((b, k) => b.setAttribute('aria-selected', k === i));
    const nodes = d.icons.length ? d.icons.map(n => ({ img: n })) : d.tags.map(t => ({ txt: t }));
    const paint = () => {
      text.textContent = d.text;
      tags.innerHTML = d.tags.map(t => `<li>${t}</li>`).join('');
      stage.innerHTML = nodes.map((n, k) => {
        const a = (k / nodes.length) * Math.PI * 2 - Math.PI / 2, r = 38;
        const pos = `left:${50 + Math.cos(a) * r}%;top:${50 + Math.sin(a) * r}%`;
        return n.img ? `<span class="id-node" style="${pos}"><img src="${iconSrc(n.img)}" alt="" width="40" height="40"></span>`
                     : `<span class="id-node txt" style="${pos}">${n.txt}</span>`;
      }).join('');
      if (!reduced) gsap.from($$('.id-node', stage), { autoAlpha: 0, scale: .6, duration: .8, stagger: .07, ease: 'power3.out' });
    };
    if (instant || reduced) paint();
    else gsap.to([text, tags, stage], { autoAlpha: 0, y: 12, duration: .2, onComplete: () => { paint(); gsap.to([text, tags, stage], { autoAlpha: 1, y: 0, duration: .5 }); } });
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('.id-tab'); if (b) show(+b.dataset.i); });
  show(0, true);
})();

/* ---------------------------------------------------------------
   9. GitHub: real public data, cached, with graceful fallback
   --------------------------------------------------------------- */
(async function github() {
  const body = $('#ghBody'), KEY = 'gh-cache-' + GITHUB_USER;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fallback = () => { body.innerHTML = `<p class="gh-note">Live GitHub data isn’t available right now. <a class="pill solid" href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">View profile on GitHub</a></p>`; };
  let data = null;
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (c && Date.now() - c.t < GITHUB_CACHE_MINUTES * 60000) data = c.d;
  } catch {}
  if (!data) {
    try {
      const [u, r] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USER}`), fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)]);
      if (!u.ok || !r.ok) throw new Error('GitHub API ' + u.status + '/' + r.status);
      data = { user: await u.json(), repos: await r.json() };
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: data })); } catch {}
    } catch (err) { console.warn('[github]', err); return fallback(); }
  }
  const repos = data.repos.filter(r => !r.fork);
  const langs = {}; repos.forEach(r => r.language && (langs[r.language] = (langs[r.language] || 0) + 1));
  const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
  const colors = ['#3d5afe', '#ff7a2f', '#f4f2ee', '#7c8cff', '#ffb27d', '#8a8a8f'];
  const entries = Object.entries(langs).sort((a, b) => b[1] - a[1]);
  const top = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6);
  body.innerHTML = `
    <div class="gh-top">
      <div class="gh-stat"><b>${data.user.public_repos}</b><span>public repositories</span></div>
      <a class="pill solid" href="${esc(data.user.html_url)}" target="_blank" rel="noopener" data-magnetic>Open GitHub profile <span>↗</span></a>
    </div>
    ${entries.length ? `<div><div class="gh-langs" role="img" aria-label="Language distribution by repository">${entries.map(([l, n], i) => `<i style="width:${n / total * 100}%;background:${colors[i % colors.length]}"></i>`).join('')}</div>
      <div class="gh-legend">${entries.map(([l, n], i) => `<span>${esc(l)} · ${n}</span>`).join('')}</div></div>` : ''}
    <div class="gh-repos">${top.map(r => `<a class="gh-repo" href="${esc(r.html_url)}" target="_blank" rel="noopener"><h3>${esc(r.name)}</h3><p>${esc(r.description || 'No description yet.')}</p><small>${esc(r.language || '—')} · ★ ${r.stargazers_count} · updated ${new Date(r.pushed_at).toLocaleDateString()}</small></a>`).join('')}</div>`;
  ScrollTrigger.refresh();
})();

/* resume button: flag if the PDF has not been added yet */
fetch('public/Kuntal_Biswas_Resume.pdf', { method: 'HEAD' }).then(r => { if (!r.ok) throw 0; }).catch(() => {
  const b = $('#navResume'); b.setAttribute('data-placeholder', '');
  b.addEventListener('click', e => { e.preventDefault(); showToast('Add your PDF at public/Kuntal_Biswas_Resume.pdf'); });
});
