const { renderProjectCard } = require("../lib/renderProject");
const { THEME_NAMES } = require("../lib/themes");
const { errorCard } = require("../lib/helpers");

module.exports = async (req, res) => {
  const { name, tagline, tech, status, link, stat, theme, animate } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!name) {
    res.status(400).send(errorCard("missing ?name= parameter"));
    return;
  }
  if (theme && !THEME_NAMES.includes(theme)) {
    res.status(400).send(errorCard(`unknown theme "${theme}". try: ${THEME_NAMES.join(", ")}`));
    return;
  }

  const project = {
    name,
    tagline,
    status,
    link,
    stat,
    tech: tech ? tech.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };

  try {
    const svg = renderProjectCard(project, { theme, animate });
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).send(errorCard(err.message || "unknown error"));
  }
};
