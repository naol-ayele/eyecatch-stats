const { THEMES } = require("./themes");
const { esc } = require("./helpers");

function renderProfileCard(stats, options = {}) {
  const theme = THEMES[options.theme] || THEMES.nova;
  const animate = options.animate !== "false";
  const width = 495;
  const height = 220;
  const avatarR = 40;
  const avatarCx = width / 2;
  const avatarCy = 66;

  const statRow = [
    { label: "repos", value: stats.publicRepos },
    { label: "stars", value: stats.totalStars },
    { label: "followers", value: stats.followers },
    { label: "following", value: stats.following },
  ];
  const colW = width / statRow.length;
  const statsSvg = statRow
    .map((s, i) => {
      const cx = colW * i + colW / 2;
      return `
<text x="${cx.toFixed(1)}" y="188" font-size="18" font-weight="600" fill="${theme.value}" text-anchor="middle" font-family="sans-serif">${Number(s.value).toLocaleString()}</text>
<text x="${cx.toFixed(1)}" y="204" font-size="10.5" fill="${theme.sub}" text-anchor="middle" font-family="sans-serif">${esc(s.label)}</text>`;
    })
    .join("");

  const dividers = statRow
    .slice(1)
    .map((_, i) => `<line x1="${(colW * (i + 1)).toFixed(1)}" y1="176" x2="${(colW * (i + 1)).toFixed(1)}" y2="210" stroke="${theme.sub}" stroke-opacity="0.2"/>`)
    .join("");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(stats.displayName)}'s profile">
<title>${esc(stats.displayName)}'s profile</title>
${animate ? `<style>
@keyframes ringSpin { from{stroke-dashoffset:251} to{stroke-dashoffset:0} }
@keyframes twinkle { 0%,100%{opacity:.2} 50%{opacity:.8} }
.ringSpin{animation:ringSpin 2s ease-out forwards}
.twinkle{animation:twinkle 3s ease-in-out infinite}
</style>` : ""}
<defs>
<linearGradient id="pcBgGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.bg[0]}"/>
<stop offset="55%" stop-color="${theme.bg[1]}"/>
<stop offset="100%" stop-color="${theme.bg[2]}"/>
</linearGradient>
<linearGradient id="pcRingGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.grad[0]}"/>
<stop offset="100%" stop-color="${theme.grad[1]}"/>
</linearGradient>
<clipPath id="avatarClip"><circle cx="${avatarCx}" cy="${avatarCy}" r="${avatarR - 3}"/></clipPath>
</defs>
<rect x="0" y="0" width="${width}" height="${height}" rx="14" fill="url(#pcBgGrad)"/>

${[[70, 22], [430, 30], [50, 100], [445, 95], [250, 15], [120, 45], [380, 55]]
  .map(([x, y], i) => `<circle class="twinkle" style="animation-delay:-${(i * 0.4).toFixed(1)}s" cx="${x}" cy="${y}" r="1.4" fill="${theme.title}"/>`)
  .join("")}

<circle cx="${avatarCx}" cy="${avatarCy}" r="${avatarR}" fill="none" stroke="url(#pcRingGrad)" stroke-width="3" stroke-dasharray="251" ${animate ? 'class="ringSpin"' : ""}/>
${stats.avatarUrl
  ? `<image href="${esc(stats.avatarUrl)}" x="${avatarCx - avatarR + 3}" y="${avatarCy - avatarR + 3}" width="${(avatarR - 3) * 2}" height="${(avatarR - 3) * 2}" clip-path="url(#avatarClip)"/>`
  : `<circle cx="${avatarCx}" cy="${avatarCy}" r="${avatarR - 3}" fill="${theme.grad[0]}" opacity="0.3"/>`}

<text x="${avatarCx}" y="128" font-size="17" font-weight="600" fill="${theme.title}" text-anchor="middle" font-family="sans-serif">${esc(stats.displayName)}</text>
<text x="${avatarCx}" y="146" font-size="12" fill="${theme.sub}" text-anchor="middle" font-family="sans-serif">@${esc(stats.username)}</text>
${stats.bio ? `<text x="${avatarCx}" y="164" font-size="11.5" fill="${theme.sub}" text-anchor="middle" font-family="sans-serif">${esc(stats.bio.slice(0, options.bioLength || 70))}</text>` : ""}

<line x1="0" y1="176" x2="${width}" y2="176" stroke="${theme.sub}" stroke-opacity="0.15"/>
${dividers}
${statsSvg}
</svg>`;
}

module.exports = { renderProfileCard };
