const { fetchStats } = require("../lib/github");
const { renderStreakCard } = require("../lib/renderStreak");
const { THEME_NAMES } = require("../lib/themes");
const { errorCard } = require("../lib/helpers");

module.exports = async (req, res) => {
  const { username, theme, animate, days } = req.query;

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

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    res.status(200).send(errorCard("streak card needs a GITHUB_TOKEN env var set (contribution calendar requires GraphQL auth)"));
    return;
  }

  try {
    const stats = await fetchStats(username, token);
    const svg = renderStreakCard(stats, { theme, animate, days });
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).send(errorCard(err.message || "unknown error"));
  }
};
