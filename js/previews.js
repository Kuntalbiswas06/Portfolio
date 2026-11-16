/* Animated placeholder previews for projects that have no screenshot yet.
   Drop a real screenshot into PROJECTS[i].image (config.js) and it replaces these. */

const seeded = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;

const frame = (inner) => `
<svg class="art" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="640" height="400" fill="#090a0f"/>
  <rect x="0" y="0" width="640" height="34" fill="#0e1018"/>
  <circle cx="20" cy="17" r="4.5" fill="#ff7a2f"/><circle cx="36" cy="17" r="4.5" fill="#2a2f45"/><circle cx="52" cy="17" r="4.5" fill="#2a2f45"/>
  <rect x="200" y="9" width="240" height="16" rx="8" fill="#151826"/>
  ${inner}
</svg>`;

function maandrishti() {
  const r = seeded(11); let q = '';
  const N = 11, c = 15, ox = 396, oy = 112;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const corner = (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
    if (corner || r() > 0.52) q += `<rect class="${corner ? '' : 'flick'}" style="animation-delay:${(r() * 1.6).toFixed(2)}s" x="${ox + x * c}" y="${oy + y * c}" width="${c - 3}" height="${c - 3}" rx="2" fill="${corner ? '#f4f2ee' : '#3d5afe'}"/>`;
  }
  return frame(`
    <rect x="40" y="62" width="300" height="296" rx="10" fill="#10121b" stroke="#232739"/>
    <rect x="62" y="86" width="120" height="10" rx="5" fill="#f4f2ee" opacity=".85"/>
    <rect x="62" y="108" width="200" height="6" rx="3" fill="#2a2f45"/>
    <rect x="62" y="124" width="170" height="6" rx="3" fill="#2a2f45"/>
    <rect x="62" y="156" width="256" height="1" fill="#232739"/>
    ${[0, 1, 2, 3].map(i => `<rect x="62" y="${176 + i * 30}" width="${90 + (i * 37) % 70}" height="7" rx="3.5" fill="#2a2f45"/><rect x="250" y="${176 + i * 30}" width="48" height="7" rx="3.5" fill="#ff7a2f" opacity=".75"/>`).join('')}
    <circle class="seal" cx="270" cy="322" r="22" fill="none" stroke="#ff7a2f" stroke-width="2"/>
    <circle cx="270" cy="322" r="12" fill="none" stroke="#ff7a2f" stroke-width="1" opacity=".5"/>
    ${q}
    <rect class="scan" x="388" y="108" width="176" height="3" fill="#ff7a2f"/>
  `);
}

function swasthyasetu() {
  const ecg = 'M0 0 L60 0 L72 -8 L84 0 L110 0 L122 -52 L136 46 L148 -16 L160 0 L230 0 L242 -8 L254 0 L290 0 L302 -52 L316 46 L328 -16 L340 0 L420 0';
  return frame(`
    <rect x="40" y="62" width="170" height="296" rx="10" fill="#10121b" stroke="#232739"/>
    ${[0, 1, 2, 3, 4].map(i => `<rect x="58" y="${84 + i * 46}" width="134" height="34" rx="8" fill="${i === 1 ? '#1b2250' : '#151826'}"/><circle cx="76" cy="${101 + i * 46}" r="8" fill="${i === 1 ? '#3d5afe' : '#2a2f45'}"/><rect x="94" y="${97 + i * 46}" width="70" height="6" rx="3" fill="#2a2f45"/>`).join('')}
    <rect x="230" y="62" width="370" height="150" rx="10" fill="#10121b" stroke="#232739"/>
    <g transform="translate(250 140)"><path class="ecg" d="${ecg}" fill="none" stroke="#ff7a2f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1000"/></g>
    <rect x="250" y="80" width="90" height="8" rx="4" fill="#f4f2ee" opacity=".8"/>
    <g font-family="monospace" font-size="10" fill="#3d5afe"><text x="520" y="90">OFFLINE</text></g>
    <circle class="pulse" cx="508" cy="87" r="4" fill="#3d5afe"/>
    ${[0, 1, 2].map(i => `<rect x="${230 + i * 126}" y="228" width="118" height="130" rx="10" fill="#10121b" stroke="#232739"/><rect x="${246 + i * 126}" y="246" width="50" height="6" rx="3" fill="#2a2f45"/><rect class="bar" style="animation-delay:${i * .15}s;transform-origin:${246 + i * 126}px 340px" x="${246 + i * 126}" y="${280 - i * 14}" width="86" height="${60 + i * 14}" rx="6" fill="${i === 1 ? '#3d5afe' : '#232739'}"/>`).join('')}
  `);
}

function reliefroute() {
  const r = seeded(7); let dots = '';
  for (let i = 0; i < 70; i++) dots += `<circle cx="${40 + r() * 560}" cy="${58 + r() * 310}" r="${r() < .1 ? 2.6 : 1.4}" fill="#2a2f45"/>`;
  return frame(`
    <rect x="30" y="52" width="580" height="326" rx="10" fill="#0c0e15" stroke="#232739"/>
    ${dots}
    <path d="M110 300 C 190 200, 250 290, 330 210 S 470 150, 540 110" fill="none" stroke="#232739" stroke-width="3"/>
    <path class="route" d="M110 300 C 190 200, 250 290, 330 210 S 470 150, 540 110" fill="none" stroke="#ff7a2f" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 12"/>
    <circle cx="110" cy="300" r="9" fill="#3d5afe"/><circle class="ping" cx="110" cy="300" r="9" fill="none" stroke="#3d5afe"/>
    <circle cx="330" cy="210" r="6" fill="#f4f2ee"/>
    <circle cx="540" cy="110" r="9" fill="#ff7a2f"/><circle class="ping" style="animation-delay:.8s" cx="540" cy="110" r="9" fill="none" stroke="#ff7a2f"/>
    <rect x="52" y="70" width="150" height="54" rx="8" fill="#10121b" stroke="#232739"/>
    <rect x="66" y="84" width="70" height="6" rx="3" fill="#f4f2ee" opacity=".8"/><rect x="66" y="100" width="110" height="6" rx="3" fill="#2a2f45"/>
  `);
}

function experiments() {
  const lines = [[40, 90, '#3d5afe'], [70, 180, '#2a2f45'], [70, 130, '#2a2f45'], [40, 60, '#ff7a2f'], [70, 210, '#2a2f45'], [70, 100, '#2a2f45'], [70, 160, '#2a2f45'], [40, 40, '#3d5afe']];
  return frame(`
    <rect x="40" y="62" width="400" height="296" rx="10" fill="#10121b" stroke="#232739"/>
    ${lines.map((l, i) => `<rect class="type" style="animation-delay:${i * .12}s;transform-origin:${60 + l[0]}px 0" x="${60 + l[0]}" y="${88 + i * 30}" width="${l[1]}" height="8" rx="4" fill="${l[2]}"/>`).join('')}
    <rect class="caret" x="${60 + 40 + 44}" y="${88 + 8 * 30 - 4}" width="8" height="16" fill="#f4f2ee"/>
    <g stroke="#2a2f45" stroke-width="2" fill="none" stroke-linecap="round"><rect x="478" y="96" width="122" height="122" rx="14" stroke-dasharray="6 8"/><path class="plus" d="M539 136v42M518 157h42" stroke="#ff7a2f"/></g>
    <rect x="478" y="240" width="122" height="8" rx="4" fill="#2a2f45"/><rect x="478" y="260" width="84" height="8" rx="4" fill="#2a2f45"/>
  `);
}

export function previewArt(id) {
  switch (id) {
    case 'maandrishti':  return maandrishti();
    case 'swasthyasetu': return swasthyasetu();
    case 'reliefroute':  return reliefroute();
    default:             return experiments();
  }
}
