function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function errorCard(message) {
  return `<svg width="495" height="120" viewBox="0 0 495 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Error">
<title>Error</title>
<rect width="495" height="120" rx="14" fill="#1a1030"/>
<text x="24" y="50" font-size="14" fill="#f0997b" font-family="sans-serif">something went wrong</text>
<text x="24" y="72" font-size="12" fill="#8b87b8" font-family="sans-serif">${String(message).slice(0, 70)}</text>
</svg>`;
}

function textWidth(str, size = 12) {
  return str.length * size * 0.58;
}

function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(
      `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
    );
  }
  return pts.join(" ");
}

const ICONS = {
  commit: (c) =>
    `<circle r="4" fill="none" stroke="${c}" stroke-width="1.8"/><line x1="-9" y1="0" x2="-4" y2="0" stroke="${c}" stroke-width="1.8"/><line x1="4" y1="0" x2="9" y2="0" stroke="${c}" stroke-width="1.8"/>`,
  star: (c) =>
    `<path d="M0,-9 L2.6,-2.8 9,-2.8 3.8,1.2 5.9,8 0,4 -5.9,8 -3.8,1.2 -9,-2.8 -2.6,-2.8 Z" fill="${c}"/>`,
  flame: (c) =>
    `<path d="M0,-9C0,-4 -4.5,-3 -4.5,2C-4.5,6 -1.8,9 0,9C1.8,9 4.5,6 4.5,2C4.5,-1 2.2,-2.5 2.2,-6C2.2,-7.5 1,-8.5 0,-9Z" fill="${c}"/>`,
  flag: (c) =>
    `<line x1="-6" y1="-9" x2="-6" y2="9" stroke="${c}" stroke-width="1.8"/><path d="M-6,-9 L7,-6 L-6,-2 Z" fill="${c}"/>`,
  box: (c) =>
    `<path d="M0,-9 L8,-4.5 L8,4.5 L0,9 L-8,4.5 L-8,-4.5 Z" fill="none" stroke="${c}" stroke-width="1.8"/><line x1="0" y1="-9" x2="0" y2="9" stroke="${c}" stroke-width="1" opacity="0.5"/><line x1="-8" y1="-4.5" x2="0" y2="0" stroke="${c}" stroke-width="1" opacity="0.5"/><line x1="8" y1="-4.5" x2="0" y2="0" stroke="${c}" stroke-width="1" opacity="0.5"/>`,
  people: (c) =>
    `<circle cx="-3.5" cy="-3" r="3" fill="${c}"/><circle cx="3.5" cy="-3" r="3" fill="${c}" opacity="0.7"/><path d="M-9,8 C-9,3 -1,3 -1,8" fill="${c}"/><path d="M1,8 C1,3 9,3 9,8" fill="${c}" opacity="0.7"/>`,
  code: (c) =>
    `<path d="M-3,-7 L-9,0 L-3,7" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3,-7 L9,0 L3,7" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  lock: (c) =>
    `<rect x="-4.5" y="-1" width="9" height="7" rx="1.5" fill="${c}"/><path d="M-3,-1 L-3,-3.5 C-3,-6 3,-6 3,-3.5 L3,-1" fill="none" stroke="${c}" stroke-width="1.6"/>`,
};

module.exports = { esc, errorCard, textWidth, hexPoints, ICONS };
