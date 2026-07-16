const { THEMES } = require("./themes");
const { esc } = require("./helpers");

const CUBE_COLORS = [
  ["#202a35", "#161d25", "#10161d"],
  ["#0d3a5c", "#082741", "#061d30"],
  ["#13549e", "#0d3c72", "#092e58"],
  ["#2f8fe0", "#1e64a8", "#164e82"],
  ["#7fd0ff", "#4aa8e8", "#2f7fc2"],
];

const ACCENT = "#2f8fe0";

function intensityLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function renderStreakCard(stats, options = {}) {
  const theme = THEMES[options.theme] || THEMES.nova;
  const animate = options.animate !== "false";
  const days = options.days ? Number(options.days) : 91;

  const recentDays = stats.calendar.slice(-days);
  const pad = (7 - (recentDays.length % 7)) % 7;
  const padded = Array(pad).fill(null).concat(recentDays);
  const cols = padded.length / 7;

  const totalContributions = recentDays.reduce((a, d) => a + (d ? d.contributionCount : 0), 0);
  const year = new Date(recentDays[recentDays.length - 1]?.date).getFullYear();

  // Flat grid with isometric 3D cubes
  const halfW = 6, halfH = 3, depth = 5;
  const stepX = 18, stepY = 16;

  // Layout positions
  const labelRight = 54;
  const gridX = 130;
  const gridY = 58;

  // Month labels: show when month changes between columns
  const monthLabels = [];
  let lastMonth = -1;
  for (let col = 0; col < cols; col++) {
    const day = padded[col * 7];
    if (!day) continue;
    const m = new Date(day.date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ col, label: MONTHS[m] });
      lastMonth = m;
    }
  }

  // Day-of-week labels
  const dayLabels = [
    { row: 1, label: "Mon" },
    { row: 3, label: "Wed" },
    { row: 5, label: "Fri" },
  ];

  // Find today index (last non-null entry)
  let todayIdx = -1;
  for (let i = padded.length - 1; i >= 0; i--) {
    if (padded[i]) { todayIdx = i; break; }
  }

  let cellsSvg = "";
  let cellIndex = 0;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row;
      const day = padded[idx];
      if (!day) continue;

      const isoX = gridX + col * stepX;
      const isoY = gridY + row * stepY;
      const level = intensityLevel(day.contributionCount);
      const [topColor, leftColor, rightColor] = CUBE_COLORS[level];
      const isToday = idx === todayIdx;

      const t = `${isoX.toFixed(1)},${isoY.toFixed(1)} ${(isoX + halfW).toFixed(1)},${(isoY + halfH).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH).toFixed(1)} ${(isoX - halfW).toFixed(1)},${(isoY + halfH).toFixed(1)}`;
      const l = `${(isoX - halfW).toFixed(1)},${(isoY + halfH).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH + depth).toFixed(1)} ${(isoX - halfW).toFixed(1)},${(isoY + halfH + depth).toFixed(1)}`;
      const r = `${isoX.toFixed(1)},${(isoY + 2 * halfH).toFixed(1)} ${(isoX + halfW).toFixed(1)},${(isoY + halfH).toFixed(1)} ${(isoX + halfW).toFixed(1)},${(isoY + halfH + depth).toFixed(1)} ${isoX.toFixed(1)},${(isoY + 2 * halfH + depth).toFixed(1)}`;

      let body = `<polygon points="${t}" fill="${topColor}"/><polygon points="${l}" fill="${leftColor}"/><polygon points="${r}" fill="${rightColor}"/>`;
      if (level === 4) {
        body = `<g filter="url(#glow)">${body}</g>`;
      }
      if (isToday) {
        body += `<polygon points="${t}" fill="none" stroke="#a8e6ff" stroke-width="1.5"/>`;
      }

      const delay = (cellIndex++ * 0.006).toFixed(3);
      cellsSvg += `
    <g${animate ? ` style="animation-delay:${delay}s" class="cf"` : ""}>
      ${body}
      <title>${esc(day.date)}: ${day.contributionCount} contributions</title>
    </g>`;
    }
  }

  const monthSvg = monthLabels
    .map((m) => `<text x="${(gridX + m.col * stepX).toFixed(1)}" y="${(gridY - 10).toFixed(1)}" font-size="9" fill="${theme.sub}" font-family="sans-serif">${esc(m.label)}</text>`)
    .join("");

  const daySvg = dayLabels
    .map((d) => `<text x="${labelRight.toFixed(1)}" y="${(gridY + d.row * stepY + halfH + 1).toFixed(1)}" font-size="9" fill="${theme.sub}" text-anchor="end" font-family="sans-serif">${esc(d.label)}</text>`)
    .join("");

  const bottomY = gridY + 7 * stepY + 2 * halfH + depth + 22;
  const height = Math.max(150, bottomY + 30);

  return `<svg width="495" height="${height.toFixed(0)}" viewBox="0 0 495 ${height.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(stats.displayName)}'s contribution graph">
<title>${esc(stats.displayName)}'s contribution graph</title>
${animate ? `<style>
@keyframes cf{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
.cf{animation:cf .35s ease-out both}
</style>` : ""}
<defs>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur stdDeviation="2.5" result="blur"/>
<feMerge>
<feMergeNode in="blur"/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.bg[0]}"/>
<stop offset="55%" stop-color="${theme.bg[1]}"/>
<stop offset="100%" stop-color="${theme.bg[2]}"/>
</linearGradient>
</defs>
<rect width="495" height="${height.toFixed(0)}" rx="14" fill="url(#bg)"/>

<text x="24" y="32" font-size="20" font-weight="600" fill="${theme.title}" font-family="sans-serif">${totalContributions.toLocaleString()} contributions in ${year}</text>

${monthSvg}
${daySvg}
${cellsSvg}

<text x="24" y="${bottomY.toFixed(0)}" font-size="11" font-family="sans-serif">
  <tspan fill="${ACCENT}" font-weight="600">+${totalContributions.toLocaleString()}</tspan>
  <tspan fill="${theme.sub}"> contributions</tspan>
</text>
<text x="195" y="${bottomY.toFixed(0)}" font-size="11" font-family="sans-serif">
  <tspan fill="${ACCENT}" font-weight="600">${stats.currentStreak}</tspan>
  <tspan fill="${theme.sub}"> day streak</tspan>
</text>

<g transform="translate(471,${(bottomY - 6).toFixed(0)})">
  <path d="M0,-5 L1.2,-1.8 L4.5,-1.8 L2,0.5 L3.2,4 L0,1.8 L-3.2,4 L-2,0.5 L-4.5,-1.8 L-1.2,-1.8 Z" fill="${ACCENT}" opacity="0.7"/>
</g>
</svg>`;
}

module.exports = { renderStreakCard };