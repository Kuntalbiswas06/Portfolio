# Kuntal Biswas — Cinematic Portfolio

Static site: **Three.js** particle portrait (built from your real photo) + **GSAP ScrollTrigger** + **Lenis**.
All libraries, fonts and tech logos are vendored in the repo, so it works with no CDN and no build step.

## Run it
```bash
cd portfolio
npm run dev            # → http://localhost:5173   (uses `npx serve`)
# or, without Node:
python3 -m http.server 5173
```
> Open it through a local server (not by double-clicking `index.html`): browsers block ES modules on `file://`.

## "Build" / deploy
There is no compile step. Upload the folder as-is to Netlify, Vercel, GitHub Pages or Cloudflare Pages
(publish directory = project root, no build command).

## Edit your content — `js/config.js`
| What | Where |
|---|---|
| GitHub / LinkedIn / email / résumé | `LINKS` (items flagged `placeholder: true` show a **REPLACE ME** tag until you set the real URL and flip it to `false`) |
| Typing roles | `ROLES` |
| Skills + honest level (`using` / `exploring`) | `SKILLS` |
| Projects: screenshot, stack, GitHub, live demo | `PROJECTS` (`image`, `stack`, `github`, `live`) |
| Journey timeline | `JOURNEY` |

* Résumé: put your PDF at `public/Kuntal_Biswas_Resume.pdf`, then set `placeholder: false` on `LINKS.resume`.
* Project screenshots: drop images in `public/images/` and set e.g. `image: 'public/images/maandrishti.png'`.
* Your photo: `public/images/profile.jpg` (a plain/light background works best — it is removed automatically).
  A tiny embedded copy lives in `js/photo-fallback.js` as a safety net; regenerate it if you change the photo.

## Structure
```
index.html            markup
css/style.css         design tokens, layout, responsive, reduced-motion
js/config.js          ALL editable content
js/portrait.js        image → particles engine (canvas sampling, shaders, mouse, scroll states)
js/previews.js        animated placeholder project previews
js/main.js            Lenis + GSAP timeline, sections, cursor, nav
vendor/               three, gsap, ScrollTrigger, lenis (pinned versions)
public/               images, icons (devicon, MIT), self-hosted fonts
```

## Performance & accessibility notes
* Particle budget: ~28k desktop / ~16k tablet / ~9k mobile (reduced a further 25% on ≤4-core CPUs); DPR capped.
* Single `requestAnimationFrame` loop for WebGL; GSAP ticker drives Lenis; render paused when the tab is hidden; portrait skipped once you scroll past the hero.
* `prefers-reduced-motion`: no smooth scroll, no scroll choreography, portrait shown fully assembled.
* No WebGL / context lost: the original photograph is shown instead.
* Cursor, spotlight and magnetic effects only run for fine pointers (not touch).
