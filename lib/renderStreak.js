const { THEMES } = require("./themes");
const { esc } = require("./helpers");


// Buckets a day's contribution count into one of 4 intensity levels for the heatmap.
function intensityLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

function renderStreakCard(stats, options = {}) {
  const theme = THEMES[options.theme] || THEMES.nova;
  const animate = options.animate !== "false";
  const days = options.days ? Number(options.days) : 91; // ~13 weeks
  const cell = 10;
  const gap = 2.5;

  const recentDays = stats.calendar.slice(-days);
  // pad the front so the grid always divides evenly into 7-day columns
  const pad = (7 - (recentDays.length % 7)) % 7;
  const padded = Array(pad).fill(null).concat(recentDays);
  const cols = padded.length / 7;

  const gridWidth = cols * (cell + gap) - gap;
  const gridX = 495 - 24 - gridWidth;
  const gridY = 40;

  const totalContributions = recentDays.reduce((a, d) => a + (d ? d.contributionCount : 0), 0);

  let cellsSvg = "";
  padded.forEach((day, i) => {
    const col = Math.floor(i / 7);
    const row = i % 7;
    const x = gridX + col * (cell + gap);
    const y = gridY + row * (cell + gap);
    if (!day) return;
    const level = intensityLevel(day.contributionCount);
    const color = theme.cell[level];
    const isRecent = i >= padded.length - stats.currentStreak && stats.currentStreak > 0 && level > 0;
    cellsSvg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell}" height="${cell}" rx="2.5" fill="${color}"${isRecent && animate ? ' class="cellGlow"' : ""}><title>${esc(day.date)}: ${day.contributionCount} contributions</title></rect>`;
  });

  const height = gridY + 7 * (cell + gap) + 30;

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
