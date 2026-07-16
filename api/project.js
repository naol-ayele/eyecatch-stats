const { fetchRepoData } = require("../lib/github");
const { renderProjectCard } = require("../lib/renderProject");
const { THEME_NAMES } = require("../lib/themes");
const { errorCard } = require("../lib/helpers");

module.exports = async (req, res) => {
  const { name, tagline, tech, status, link, stat, repo, theme, animate } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!name && !repo) {
    res.status(400).send(errorCard("missing ?name= or ?repo= parameter"));
    return;
  }
  if (theme && !THEME_NAMES.includes(theme)) {
    res.status(400).send(errorCard(`unknown theme "${theme}". try: ${THEME_NAMES.join(", ")}`));
    return;
  }

  let project = {};

  if (repo) {
    const token = process.env.GITHUB_TOKEN;
    const repoData = await fetchRepoData(repo, token);
    project = {
      name: name || repoData.name,
      tagline: tagline || repoData.tagline,
      tech: tech
        ? tech.split(",").map((t) => t.trim()).filter(Boolean)
        : repoData.tech,
      link: link || repoData.link,
      status: status || "",
      stat:
        stat ||
        (repoData.stars > 0
          ? `\u2B50 ${repoData.stars} stars  ·  ${repoData.forks} forks`
          : ""),
    };
  } else {
    project = {
      name,
      tagline: tagline || "",
      status: status || "",
      link: link || "",
      stat: stat || "",
      tech: tech ? tech.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
  }

  try {
    const svg = renderProjectCard(project, { theme, animate });
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).send(errorCard(err.message || "unknown error"));
  }
};
