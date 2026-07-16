const http = require("http");
const { URL } = require("url");

const routes = {
  "/api/stats": require("./api/stats"),
  "/api/streak": require("./api/streak"),
  "/api/project": require("./api/project"),
  "/api/profile": require("./api/profile"),
  "/api/achievements": require("./api/achievements"),
};

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  const handler = routes[parsed.pathname];

  // shim the bits of the Vercel request/response API our handlers use,
  // so the exact same api/*.js files run here and in production
  req.query = Object.fromEntries(parsed.searchParams);
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (body) => {
    res.end(body);
    return res;
  };

  if (!handler) {
    res.status(404).send("not found. try /api/stats, /api/streak, or /api/project");
    return;
  }

  try {
    await handler(req, res);
  } catch (err) {
    res.status(500).send(`server error: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`dev server running: http://localhost:${PORT}`);
  console.log(`  http://localhost:${PORT}/api/stats?username=naol-ayele&theme=nova`);
  console.log(`  http://localhost:${PORT}/api/streak?username=naol-ayele&theme=nova`);
  console.log(`  http://localhost:${PORT}/api/profile?username=naol-ayele&theme=nova`);
  console.log(`  http://localhost:${PORT}/api/achievements?username=naol-ayele&theme=nova`);
  console.log(`  http://localhost:${PORT}/api/project?name=Birrly&tagline=hello&tech=Flutter,Dart&theme=nova`);
  if (!process.env.GITHUB_TOKEN) {
    console.log("\nWARNING: GITHUB_TOKEN not set");
    console.log("  - /api/stats:     commits/PRs/streak show as 0");
    console.log("  - /api/streak:    returns error (requires GraphQL auth)");
    console.log("  - /api/profile:   same limitation as stats");
    console.log("  - /api/project:   unaffected (manual params)");
    console.log("  - /api/achievements: streak badges won't unlock");
    console.log("\n  Set via:  $env:GITHUB_TOKEN='ghp_...'  (PowerShell)");
    console.log("            set GITHUB_TOKEN=ghp_...       (cmd.exe)");
  } else {
    console.log("\nGITHUB_TOKEN is set — full data available for all endpoints.");
  }
});