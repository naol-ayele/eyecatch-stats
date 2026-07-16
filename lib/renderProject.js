const { THEMES } = require("./themes");
const { esc, textWidth } = require("./helpers");

function renderProjectCard(project, options = {}) {
  const theme = THEMES[options.theme] || THEMES.nova;
  const animate = options.animate !== "false";
  const width = 495;

  const techList = (project.tech || []).slice(0, 6);
  let px = 24;
  let py = 118;
  const pillsSvg = [];
  const pillGap = 8;
  const pillPad = 12;
  const pillHeight = 24;

  techList.forEach((tech) => {
    const w = textWidth(tech) + pillPad * 2;
    if (px + w > width - 24) {
      px = 24;
      py += pillHeight + 8;
    }
    pillsSvg.push(
      `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${w.toFixed(1)}" height="${pillHeight}" rx="12" fill="${theme.pill}"/>` +
      `<text x="${(px + w / 2).toFixed(1)}" y="${(py + 16).toFixed(1)}" font-size="12" fill="${theme.pillText}" text-anchor="middle" font-family="sans-serif">${esc(tech)}</text>`
    );
    px += w + pillGap;
  });

  const height = py + pillHeight + 24;

  const statusW = Math.min(textWidth(project.status || "", 11) + 24, width - 48);
  const statusX = width - 24 - statusW;

  return `<svg width="${width}" height="${height.toFixed(0)}" viewBox="0 0 ${width} ${height.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(project.name)} project spotlight">
<title>${esc(project.name)} project spotlight</title>
${animate ? `<style>
@keyframes barGlow { 0%,100%{opacity:.7} 50%{opacity:1} }
@keyframes arrowNudge { 0%,100%{transform:translateX(0)} 50%{transform:translateX(3px)} }
.barGlow{animation:barGlow 2.4s ease-in-out infinite}
.arrowNudge{animation:arrowNudge 1.6s ease-in-out infinite}
</style>` : ""}
<defs>
<linearGradient id="pbgGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.bg[0]}"/>
<stop offset="55%" stop-color="${theme.bg[1]}"/>
<stop offset="100%" stop-color="${theme.bg[2]}"/>
</linearGradient>
<linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${theme.grad[0]}"/>
<stop offset="100%" stop-color="${theme.grad[1]}"/>
</linearGradient>
</defs>
<rect x="0" y="0" width="${width}" height="${height.toFixed(0)}" rx="14" fill="url(#pbgGrad)"/>
<rect x="0" y="0" width="5" height="${height.toFixed(0)}" rx="2.5" fill="url(#barGrad)" ${animate ? 'class="barGlow"' : ""}/>

${project.status ? `<rect x="${statusX.toFixed(1)}" y="24" width="${statusW.toFixed(1)}" height="22" rx="11" fill="${theme.statusBg}"/>
<text x="${(statusX + statusW / 2).toFixed(1)}" y="39" font-size="11" fill="${theme.statusText}" text-anchor="middle" font-family="sans-serif">${esc(project.status)}</text>` : ""}

<text x="24" y="42" font-size="20" font-weight="500" fill="${theme.title}" font-family="sans-serif">${esc(project.name)}</text>
<text x="24" y="66" font-size="13" fill="${theme.sub}" font-family="sans-serif">${esc(project.tagline || "")}</text>

${project.stat ? `<text x="24" y="94" font-size="13" fill="${theme.title}" font-family="sans-serif" font-weight="500">${esc(project.stat)}</text>` : ""}

${pillsSvg.join("\n")}

${project.link ? `<text x="${(width - 24).toFixed(1)}" y="${(height - 18).toFixed(0)}" font-size="11" fill="${theme.sub}" text-anchor="end" font-family="sans-serif" ${animate ? 'class="arrowNudge"' : ""}>${esc(project.link)} &#8594;</text>` : ""}
</svg>`;
}

module.exports = { renderProjectCard };
