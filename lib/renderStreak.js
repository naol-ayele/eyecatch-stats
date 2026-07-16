const { THEMES } = require("./themes");
const { esc } = require("./helpers");

function intensityLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

function renderStreakCard(stats, options = {}) {
  const theme = THEMES[options.theme] || THEMES.nova;
  const animate = options.animate !== "false";
  const days = options.days ? Number(options.days) : 91;

  const recentDays = stats.calendar.slice(-days);
  const pad = (7 - (recentDays.length % 7)) % 7;
  const padded = Array(pad).fill(null).concat(recentDays);
  const cols = padded.length / 7;

  const totalContributions = recentDays.reduce((a, d) => a + (d ? d.contributionCount : 0), 0);

  // Isometric 3D block dimensions
  const halfW = 8;
  const halfH = 4;
  const depth = 6;
  const stepX = 9.5;
  const stepY = 4.75;

  // Position grid to the right of stats, with minimal dead space
  const statsEnd = 240;
  const gridRight = 495 - 24;
  const gridCenter = statsEnd + (gridRight - statsEnd) / 2;
  // xOffset is the isometric origin — the top vertex of the (0,0) cell's top face
  const xOffset = gridCenter;
  const yOffset = 35;

  let cellsSvg = "";
  // Back-to-front (col, row) ordering for correct 3D occlusion
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row;
      const day = padded[idx];
      if (!day) continue;

      const isoX = xOffset + col * stepX - row * stepX;
      const isoY = yOffset + col * stepY + row * stepY;

      const level = intensityLevel(day.contributionCount);
      const color = theme.cell[level];
      const isRecent = idx >= padded.length - stats.currentStreak && stats.currentStreak > 0 && level > 0;

      if (level === 0) {
        cellsSvg += `<rect x="${(isoX - halfW).toFixed(1)}" y="${(isoY + halfH).toFixed(1)}" width="${(halfW * 2).toFixed(1)}" height="${halfH}" rx="1.5" fill="${color}"><title>${esc(day.date)}: ${day.contributionCount} contributions</title></rect>`;
        continue;
      }

      // 3D block: 3 faces (top, left, right) for isometric projection
      const topPts = `${isoX.toFixed(1)},${isoY.toFixed(1)} ${(isoX + halfW).toFixed(1)},${(isoY + halfH).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH).toFixed(1)} ${(isoX - halfW).toFixed(1)},${(isoY + halfH).toFixed(1)}`;
      const leftPts = `${(isoX - halfW).toFixed(1)},${(isoY + halfH).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH + depth).toFixed(1)} ${(isoX - halfW).toFixed(1)},${(isoY + halfH + depth).toFixed(1)}`;
      const rightPts = `${isoX.toFixed(1)},${(isoY + 2 * halfH).toFixed(1)} ${(isoX + halfW).toFixed(1)},${(isoY + halfH).toFixed(1)} ${(isoX + halfW).toFixed(1)},${(isoY + halfH + depth).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH + depth).toFixed(1)}`;

      cellsSvg += `
      <g${isRecent && animate ? ' class="cellGlow"' : ""}>
        <polygon points="${topPts}" fill="${color}"/>
        <polygon points="${leftPts}" fill="${color}"/><polygon points="${leftPts}" fill="#000" opacity="0.12"/>
        <polygon points="${rightPts}" fill="${color}"/><polygon points="${rightPts}" fill="#000" opacity="0.28"/>
        <title>${esc(day.date)}: ${day.contributionCount} contributions</title>
      </g>`;
    }
  }

  const maxY = yOffset + cols * stepY + 7 * stepY + depth + 15;
  const height = Math.max(140, maxY);

  return `<svg width="495" height="${height.toFixed(0)}" viewBox="0 0 495 ${height.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(stats.displayName)}'s contribution streak">
<title>${esc(stats.displayName)}'s contribution streak</title>
${animate ? `<style>
@keyframes flamePulse { 0%,100%{opacity:.6; transform:scale(1)} 50%{opacity:1; transform:scale(1.08)} }
@keyframes cellFade { from{opacity:.3} to{opacity:1} }
.flame{animation:flamePulse 1.8s ease-in-out infinite; transform-origin:center}
.cellGlow{animation:cellFade 1.6s ease-out}
</style>` : ""}
<defs>
<linearGradient id="sbgGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.bg[0]}"/>
<stop offset="55%" stop-color="${theme.bg[1]}"/>
<stop offset="100%" stop-color="${theme.bg[2]}"/>
</linearGradient>
<filter id="flameGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect x="0" y="0" width="495" height="${height.toFixed(0)}" rx="14" fill="url(#sbgGrad)"/>
<text x="24" y="30" font-size="15" font-weight="500" fill="${theme.title}" font-family="sans-serif">${esc(stats.displayName)}&#8217;s streak</text>

<g transform="translate(24,52)" ${animate ? 'class="flame"' : ""} filter="url(#flameGlow)">
<path d="M9 0C9 5 4 6 4 12C4 16.5 6.5 19 10 19C13.5 19 16 16.5 16 12C16 9 14 7.5 14 7.5C14 10 12.5 11 11 11C9.5 11 9 9.5 9 8C9 5.5 11 4.5 11 2C11 1 10.3 0.3 9 0Z" fill="${theme.flame[0]}"/>
<path d="M10 6C10 8 8.5 8.5 8.5 11.5C8.5 13.8 9.5 15 11 15C12.5 15 13.5 13.8 13.5 11.5C13.5 10 12.7 9.2 12.7 9.2C12.7 10.3 12 11 11.2 11C10.5 11 10 10.3 10 9.5C10 8 11 7.5 11 6C11 5.2 10.6 4.8 10 6Z" fill="${theme.flame[1]}"/>
</g>
<text x="46" y="60" font-size="20" font-weight="500" fill="${theme.value}" font-family="sans-serif">${stats.currentStreak}</text>
<text x="46" y="76" font-size="10" fill="${theme.sub}" font-family="sans-serif">day streak</text>

<text x="130" y="60" font-size="20" font-weight="500" fill="${theme.value}" font-family="sans-serif">${stats.longestStreak}</text>
<text x="130" y="76" font-size="10" fill="${theme.sub}" font-family="sans-serif">longest streak</text>

<text x="230" y="60" font-size="20" font-weight="500" fill="${theme.value}" font-family="sans-serif">${totalContributions}</text>
<text x="230" y="76" font-size="10" fill="${theme.sub}" font-family="sans-serif">last ${days} days</text>

${cellsSvg}
</svg>`;
}

module.exports = { renderStreakCard };
