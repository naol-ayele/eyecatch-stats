# eyecatch-stats

An animated, glowing GitHub stats card for your profile README — same idea as
[github-readme-stats](https://github.com/anuraghazra/github-readme-stats), but with a
gradient card, a drawn-in contribution ring, and three themes instead of a plain badge.

## 0. Test it locally, before deploying anything

No Vercel account needed for this part.

```bash
cd eyecatch-stats
export GITHUB_TOKEN=your_token_here   # optional but recommended, see step 1
node dev-server.js
```

Then open in your browser:

```
http://localhost:3000/api/stats?username=YOUR_GITHUB_USERNAME&theme=nova
http://localhost:3000/api/streak?username=YOUR_GITHUB_USERNAME&theme=nova
http://localhost:3000/api/project?name=Test&tagline=hello&tech=Flutter,Dart&theme=nova
```

`dev-server.js` is a ~30-line zero-dependency wrapper — it runs the *exact same*
`api/*.js` files that get deployed to Vercel, just over Node's built-in `http`
module instead of Vercel's serverless runtime. If something's broken, it's broken
here too, so this is a true test, not an approximation.

What to check before deploying:
- Open each URL directly in the browser — a broken SVG shows as a broken image icon,
  a working one renders the card immediately.
- View source / inspect the response — look for an "error card" (dark card with an
  orange error message) instead of your real stats; that means something failed
  server-side and the message will tell you what.
- Without `GITHUB_TOKEN` set: `/api/stats` still renders but commits/PRs/streak show
  as 0, and `/api/streak` returns an error card outright — both expected, not bugs.
- Try a bad theme (`&theme=nope`) and a missing username (`?theme=nova`) — you should
  get a clean error card, not a crash.

If you don't want to install anything locally and would rather test on Vercel's
infra directly, `vercel dev` (see step 2) does the same thing but through the
official Vercel CLI — useful mainly if you want to test Vercel-specific behavior
like the `vercel.json` config or edge caching, which `dev-server.js` doesn't simulate.

## 1. Deploy (2 minutes)

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import that repo, click Deploy.
   No config needed — Vercel auto-detects the `/api` folder as serverless functions.
3. (Recommended) In Vercel → Project → Settings → Environment Variables, add:
   - `GITHUB_TOKEN` — a GitHub personal access token (classic, no scopes needed for
     public data) — create one at https://github.com/settings/tokens
   - Without a token, the card still renders with stars/languages/followers, but
     commits/PRs/streak will show as 0 since those need the GraphQL API.
4. Redeploy after adding the env var (Vercel doesn't hot-reload env changes).

## 2. Use it

Your endpoint will be:

```
https://YOUR-PROJECT.vercel.app/api/stats?username=YOUR_GITHUB_USERNAME
```

Drop it straight into your profile README (the repo named exactly your username):

```md
![My GitHub stats](https://YOUR-PROJECT.vercel.app/api/stats?username=YOUR_GITHUB_USERNAME&theme=nova)
```

## 3. Day-to-day streak card

A second endpoint shows a mini contribution heatmap (last 91 days by default) plus
current streak, longest streak, and total contributions — with a glowing flame icon
next to your current streak:

```
https://YOUR-PROJECT.vercel.app/api/streak?username=YOUR_GITHUB_USERNAME&theme=nova
```

```md
![My streak](https://YOUR-PROJECT.vercel.app/api/streak?username=YOUR_GITHUB_USERNAME&theme=nova)
```

This one **requires** `GITHUB_TOKEN` to be set — the contribution calendar isn't
available from the unauthenticated REST API. Extra param: `days` (default `91`,
try `182` or `365` for a longer heatmap — the card grows taller automatically).

## 4. Project spotlight card

A third endpoint spotlights one project — title, tagline, tech pills, status badge.
You can either pass details manually (`?name=...`) or auto-fetch from a GitHub repo
(`?repo=owner/name`). Manual params override fetched data, so you can mix and match.

**Auto-fetch from a repo:**
```
https://YOUR-PROJECT.vercel.app/api/project?repo=naol-ayele/birrly&theme=nova
```

```md
[![Birrly](https://YOUR-PROJECT.vercel.app/api/project?repo=naol-ayele/birrly&theme=nova)](https://github.com/naol-ayele/birrly)
```

**Manual (full control):**
```
https://YOUR-PROJECT.vercel.app/api/project?name=Birrly&tagline=Offline-first+finance+app+with+Ethiopian+Calendar+support&status=in+development&tech=Flutter,Provider,SQLite,Supabase&link=github.com/you/birrly&theme=nova
```

```md
![Birrly](https://YOUR-PROJECT.vercel.app/api/project?name=Birrly&tagline=Offline-first+finance+app+with+Ethiopian+Calendar+support&status=in+development&tech=Flutter,Provider,SQLite,Supabase&link=github.com/you/birrly&theme=nova)
```

| Param | Notes |
|---|---|
| `repo` | `owner/name` — auto-fetches name, description, languages, stars, forks from GitHub API. Manual params override. If stars > 0 and no `stat` given, auto-generates "★ N stars · M forks" |
| `name` | required if `repo` not given |
| `tagline` | one line, keep it short — long taglines wrap the card taller |
| `status` | small badge top-right, e.g. `active`, `in+development`, `archived` |
| `stat` | one bold line for a standout metric, e.g. `Realtime+sync+%C2%B7+SMS+auto-detection`. Auto-generated when using `?repo=` with stars > 0 |
| `tech` | comma-separated, no spaces around commas needed |
| `link` | plain text, not a real hyperlink (SVG `<img>` embeds can't be clickable — wrap it in a markdown link, see below) |
| `theme` / `animate` | same as the other cards |

Since an `<img>`-embedded SVG can't be clicked through to your repo, wrap it in a
markdown link so the whole card is clickable:

```md
[![Birrly](https://YOUR-PROJECT.vercel.app/api/project?name=Birrly&...)](https://github.com/you/birrly)
```

## 5. Profile header card

Banner-style card with a spinning ring around your avatar, name, bio, and a
repos/stars/followers/following row — the "top of profile" piece.

```
https://YOUR-PROJECT.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&theme=nova
```

```md
![My profile](https://YOUR-PROJECT.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&theme=nova)
```

Pulls your real avatar, name, bio, and stats from the GitHub API automatically —
no config needed, unlike the project card.

## 6. Achievement badges

Seven hexagon badges that unlock based on real computed stats. **Not** GitHub's
actual Achievements system (Pull Shark, Galaxy Brain, etc.) — those aren't exposed
through any public API, so these are original thresholds instead:

| Badge | Unlocks at |
|---|---|
| Century Club | 100+ commits this year |
| Star Magnet | 50+ stars earned |
| On Fire | 14+ day current streak |
| Marathoner | 30+ day longest streak |
| Builder | 20+ public repos |
| Rising Voice | 25+ followers |
| Polyglot | 3+ languages across repos |

```
https://YOUR-PROJECT.vercel.app/api/achievements?username=YOUR_GITHUB_USERNAME&theme=nova
```

```md
![My achievements](https://YOUR-PROJECT.vercel.app/api/achievements?username=YOUR_GITHUB_USERNAME&theme=nova)
```

Locked badges render dim with a lock icon; unlocked ones glow and pulse. The
commit-count and streak badges need `GITHUB_TOKEN` to be accurate — without it
they just won't unlock, even if you'd qualify.

## 7. Options

| Param | Values | Default |
|---|---|---|
| `username` | any GitHub username | required |
| `theme` | `nova`, `sunset`, `matrix` | `nova` |
| `animate` | `true`, `false` | `true` |

Example with a different theme, animations off (some renderers/PDF exports don't
support SVG `<style>` animation — turn it off if your card looks static/broken there):

```
/api/stats?username=torvalds&theme=matrix&animate=false
```

## How it works

- `api/stats.js` — the serverless endpoint, handles query params + caching headers
- `lib/github.js` — pulls stars/languages from the REST API (1 call), and
  commits/PRs/streak from the GraphQL API if `GITHUB_TOKEN` is set
- `lib/renderCard.js` — builds the SVG string: gradient background, glowing stat
  dots, an animated ring that draws in to your "grade" score, and a gradient
  language bar

The "grade" is a rough 0-100 score from log-scaled commits, stars, PRs, issues,
and followers — same spirit as the rank calculation in the original
github-readme-stats, not an official GitHub metric.

## Notes / limitations

- Language breakdown uses **byte count** when `GITHUB_TOKEN` is set (fetches top 30
  repos' languages in batches of 10 for accuracy). Falls back to **repo count** when
  no token is available (single REST call, no extra requests).
- Current streak counts a trailing run of contribution-days ending today or
  yesterday; longest streak scans the full contribution calendar (last ~12 months).
- GitHub caches embedded images aggressively — if you update your stats and the
  card doesn't refresh, add a random query param (`&v=2`) to bust the cache.

## Local dev

```bash
npm i -g vercel
vercel dev
# then hit http://localhost:3000/api/stats?username=YOUR_USERNAME
```
