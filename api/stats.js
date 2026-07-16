const { fetchStats } = require("../lib/github");
const { renderCard } = require("../lib/renderCard");
const { THEME_NAMES } = require("../lib/themes");
const { errorCard } = require("../lib/helpers");

module.exports = async (req, res) => {
  const { username, theme, animate } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!username) {
    res.status(400).send(errorCard("missing ?username= parameter"));
    return;
  }

  if (theme && !THEME_NAMES.includes(theme)) {
    res.status(400).send(errorCard(`unknown theme "${theme}". try: ${THEME_NAMES.join(", ")}`));
    return;
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const stats = await fetchStats(username, token);
    const svg = renderCard(stats, { theme, animate });
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).send(errorCard(err.message || "unknown error"));
  }
};
