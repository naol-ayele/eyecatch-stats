const { THEMES } = require("./themes");
const { esc } = require("./helpers");

function renderCard(stats, options = {}) {
  const theme = THEMES[options.theme] || THEMES.nova;
  const animate = options.animate !== "false";
  const width = 495;
  const height = 195;

  const ringCircumference = 2 * Math.PI * 52;
  const gradePercent = Math.max(0, Math.min(100, stats.grade));
  const dashOffset = ringCircumference * (1 - gradePercent / 100);

  const langBarSegments = (() => {
    let x = 24;
    const barWidth = 447;
    const total = stats.topLanguages.reduce((a, l) => a + l.percent, 0) || 1;
    return stats.topLanguages
      .map((lang, i) => {
        const w = (lang.percent / total) * barWidth;
        const color = theme.lang[i % theme.lang.length];
        const seg = `<rect x="${x.toFixed(1)}" y="185" width="${w.toFixed(1)}" height="5" fill="${color}"/>`;
        x += w;
        return seg;
      })
      .join("");
  })();

  const langLegend = stats.topLanguages
    .map((l) => `${esc(l.name)} ${l.percent}%`)
    .join("   ");

  const rows = [
    { label: "total commits", value: stats.totalCommits.toLocaleString() },
    { label: "stars earned", value: stats.totalStars.toLocaleString() },
    { label: "pull requests", value: stats.totalPRs.toLocaleString() },
    { label: "current streak", value: `${stats.currentStreak} days` },
  ];

  const rowsSvg = rows
    .map((row, i) => {
      const y = 80 + i * 26;
      const dotColor = theme.dots[i % theme.dots.length];
      const delay = (i * 0.6).toFixed(1);
      return `
    <circle ${animate ? `class="glow" style="animation-delay:-${delay}s"` : ""} cx="30" cy="${y}" r="4" fill="${dotColor}"/>
    <text x="42" y="${y + 4}" font-size="13" fill="${theme.label}">${esc(row.label)}</text>
    <text x="220" y="${y + 4}" font-size="13" fill="${theme.value}" text-anchor="end" font-weight="500">${esc(row.value)}</text>`;
    })
    .join("");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(stats.displayName)}'s GitHub stats">
<title>${esc(stats.displayName)}'s GitHub stats</title>
${animate ? `<style>
@keyframes glowPulse { 0%,100%{opacity:.55} 50%{opacity:1} }
@keyframes ringDraw { from{stroke-dashoffset:${ringCircumference.toFixed(1)}} to{stroke-dashoffset:${dashOffset.toFixed(1)}} }
@keyframes floatBlob { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8px,-6px)} }
.glow{animation:glowPulse 2.6s ease-in-out infinite}
.ring{animation:ringDraw 1.6s cubic-bezier(.3,.9,.4,1) forwards}
.blob{animation:floatBlob 6s ease-in-out infinite}
</style>` : ""}
<defs>
<linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.bg[0]}"/>
<stop offset="55%" stop-color="${theme.bg[1]}"/>
<stop offset="100%" stop-color="${theme.bg[2]}"/>
</linearGradient>
<linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.grad[0]}"/>
<stop offset="100%" stop-color="${theme.grad[1]}"/>
</linearGradient>
<radialGradient id="blobGrad"><stop offset="0%" stop-color="${theme.grad[0]}" stop-opacity="0.35"/><stop offset="100%" stop-color="${theme.grad[0]}" stop-opacity="0"/></radialGradient>
<filter id="softGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect x="0" y="0" width="${width}" height="${height}" rx="14" fill="url(#bgGrad)"/>
<circle ${animate ? 'class="blob"' : ""} cx="90" cy="40" r="60" fill="url(#blobGrad)"/>
<circle ${animate ? 'class="blob" style="animation-delay:-3s"' : ""} cx="430" cy="160" r="70" fill="url(#blobGrad)"/>
<text x="24" y="34" font-size="16" font-weight="500" fill="${theme.title}" font-family="sans-serif">${esc(stats.displayName)}&#8217;s github stats</text>
<text x="24" y="52" font-size="11" fill="${theme.sub}" font-family="sans-serif">@${esc(stats.username)}${stats.hasToken ? "" : "  ·  add GITHUB_TOKEN for full commit/streak data"}</text>
<g font-family="sans-serif">${rowsSvg}
</g>
<g transform="translate(360,95)" filter="url(#softGlow)">
<circle r="52" fill="none" stroke="#2a2645" stroke-width="10"/>
<circle ${animate ? 'class="ring"' : ""} r="52" fill="none" stroke="url(#ringGrad)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${ringCircumference.toFixed(1)}" stroke-dashoffset="${animate ? ringCircumference.toFixed(1) : dashOffset.toFixed(1)}" transform="rotate(-90)"/>
<text text-anchor="middle" y="-4" font-size="22" font-weight="500" fill="${theme.value}" font-family="sans-serif">${gradePercent}%</text>
<text text-anchor="middle" y="16" font-size="10" fill="${theme.sub}" font-family="sans-serif">grade</text>
</g>
<text x="24" y="180" font-size="10" fill="${theme.sub}" font-family="sans-serif">${esc(langLegend) || "no public repo languages found"}</text>
<rect x="24" y="185" width="447" height="5" rx="2.5" fill="#2a2645"/>
${langBarSegments}
</svg>`;
}

module.exports = { renderCard };
