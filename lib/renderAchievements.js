const { THEMES } = require("./themes");
const { esc, hexPoints, ICONS } = require("./helpers");

function renderAchievements(achievements, displayName, options = {}) {
  const theme = THEMES[options.theme] || THEMES.nova;
  const animate = options.animate !== "false";
  const width = 495;
  const cols = achievements.length;
  const slotW = (width - 48) / cols;
  const cy = 92;
  const r = 30;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const badges = achievements
    .map((a, i) => {
      const cx = 24 + slotW * i + slotW / 2;
      const color = a.unlocked ? theme.accent : theme.locked;
      const iconColor = a.unlocked ? "#12121f" : theme.lockedIcon;
      const iconFn = a.unlocked ? ICONS[a.icon] : ICONS.lock;
      const glow = a.unlocked && animate ? ' class="badgeGlow"' : "";
      const fillColor = a.unlocked ? "url(#hexGrad)" : theme.locked;

      return `
<g transform="translate(${cx.toFixed(1)},${cy})"${glow}>
<polygon points="${hexPoints(0, 0, r)}" fill="${fillColor}" stroke="${a.unlocked ? theme.accent2 : "none"}" stroke-width="${a.unlocked ? 1.5 : 0}"/>
<g>${iconFn(iconColor)}</g>
</g>
<text x="${cx.toFixed(1)}" y="${cy + r + 18}" font-size="10.5" fill="${a.unlocked ? theme.title : theme.sub}" text-anchor="middle" font-family="sans-serif" font-weight="${a.unlocked ? 500 : 400}">${esc(a.label)}</text>`;
    })
    .join("");

  const height = cy + r + 34;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(displayName)}'s achievements">
<title>${esc(displayName)}'s achievements: ${unlockedCount} of ${achievements.length} unlocked</title>
${animate ? `<style>
@keyframes badgePulse { 0%,100%{filter:drop-shadow(0 0 2px currentColor)} 50%{filter:drop-shadow(0 0 6px currentColor)} }
.badgeGlow{animation:badgePulse 2.6s ease-in-out infinite; color:${theme.accent}}
</style>` : ""}
<defs>
<linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.bg[0]}"/>
<stop offset="55%" stop-color="${theme.bg[1]}"/>
<stop offset="100%" stop-color="${theme.bg[2]}"/>
</linearGradient>
<linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${theme.accent}"/>
<stop offset="100%" stop-color="${theme.accent2}"/>
</linearGradient>
</defs>
<rect x="0" y="0" width="${width}" height="${height}" rx="14" fill="url(#bgGrad)"/>
<text x="24" y="28" font-size="14" font-weight="500" fill="${theme.title}" font-family="sans-serif">achievements</text>
<text x="${width - 24}" y="28" font-size="11" fill="${theme.sub}" text-anchor="end" font-family="sans-serif">${unlockedCount}/${achievements.length} unlocked</text>
${badges}
</svg>`;
}

module.exports = { renderAchievements };
