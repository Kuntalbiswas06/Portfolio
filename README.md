# Kuntal Biswas — Cinematic Portfolio

A cinematic, interactive developer portfolio featuring a real-photo particle portrait powered by Three.js, smooth scrolling, and immersive scroll animations.

Built with vanilla JavaScript, HTML, CSS, Three.js, GSAP, ScrollTrigger, and Lenis.

## Features

- Interactive 3D particle portrait generated from a real photograph.
- Three.js-powered WebGL particle animation.
- GSAP and ScrollTrigger scroll-based animations.
- Lenis smooth scrolling.
- Responsive design for desktop, tablet, and mobile.
- Custom cursor and interactive UI effects.
- Optimized rendering and particle budgets.
- Reduced-motion accessibility support.
- Fallback photograph for unsupported WebGL devices.
- Self-hosted libraries, fonts, and assets.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Three.js
- GSAP
- GSAP ScrollTrigger
- Lenis

## Run Locally

```bash
git clone https://github.com/Kuntalbiswas06/Portfolio.git

cd Portfolio

npm run dev
```

Open `http://localhost:5173` in your browser.

Alternatively:

```bash
python3 -m http.server 5173
```

## Performance & Accessibility

- Adaptive particle density based on device capabilities.
- Device pixel ratio capped for better performance.
- Animation rendering pauses when the browser tab is hidden.
- Portrait rendering is optimized based on scroll position.
- Respects `prefers-reduced-motion`.
- Provides a fallback for devices without WebGL support.

## Author

**Kuntal Biswas**

- GitHub: https://github.com/Kuntalbiswas06
- Portfolio: Add your deployed portfolio URL here.
- LinkedIn: Add your LinkedIn profile URL here.

---

If you like this project, consider giving it a star!