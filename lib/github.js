const GITHUB_REST = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";

async function restFetch(path, token) {
  const res = await fetch(`${GITHUB_REST}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub REST error ${res.status} for ${path}`);
  }
  return res.json();
}

async function graphqlFetch(query, variables, token) {
  if (!token) return null; // streak/commit data needs a token, degrade gracefully
  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL error ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
  }
  return json.data || null;
}

// Fetches language bytes for a batch of repos, returns { [language]: totalBytes }.
async function fetchLangBytes(owner, repoNames, token) {
  const bytes = {};
  const batchSize = 10;
  for (let i = 0; i < repoNames.length; i += batchSize) {
    const batch = repoNames.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((name) => restFetch(`/repos/${owner}/${name}/languages`, token))
    );
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        for (const [lang, count] of Object.entries(result.value)) {
          bytes[lang] = (bytes[lang] || 0) + count;
        }
      }
    }
  }
  return bytes;
}

// Sums stars + builds a language breakdown from a user's owned repos.
// With a token: accurate byte-count breakdown (batched, up to ~30 repos).
// Without a token: weighted by repo count (single REST call, no extra requests).
async function fetchRepoStats(username, token) {
  let repos = [];
  let page = 1;
  while (true) {
    const pageData = await restFetch(
      `/users/${username}/repos?per_page=100&type=owner&sort=updated&page=${page}`,
      token
    );
    if (pageData.length === 0) break;
    repos = repos.concat(pageData);
    page++;
  }

  let totalStars = 0;
  let totalForks = 0;
  const ownedRepos = repos.filter((r) => !r.fork);

  for (const repo of ownedRepos) {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
  }

  let topLanguages;
  if (token) {
    const topRepos = ownedRepos.slice(0, 30);
    const repoList = topRepos.map((r) => r.name);
    const owner = topRepos[0]?.owner?.login || username;
    const langBytes = await fetchLangBytes(owner, repoList, token);
    const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0) || 1;
    topLanguages = Object.entries(langBytes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, bytes]) => ({
        name,
        percent: Math.round((bytes / totalBytes) * 1000) / 10,
      }));
  } else {
    const langCounts = {};
    for (const repo of ownedRepos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    }
    const totalLangSamples = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        percent: Math.round((count / totalLangSamples) * 1000) / 10,
      }));
  }

  return { totalStars, totalForks, topLanguages, repoCount: repos.length };
}

const CONTRIB_QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

function computeStreaks(days) {
  let longest = 0;
  let current = 0;
  let running = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  // current streak = consecutive days ending today or yesterday (forgiving "haven't committed yet today")
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      // Found the last contribution day. Only count it if it's today or yesterday.
      const distFromEnd = days.length - 1 - i;
      if (distFromEnd <= 1) {
        current = 1;
        // Count contiguous contributions going backward
        for (let j = i - 1; j >= 0; j--) {
          if (days[j].contributionCount > 0) {
            current++;
          } else {
            break;
          }
        }
      }
      break;
    }
  }

  return { longestStreak: longest, currentStreak: current };
}

// Rough 0-100 "grade" score, same spirit as the rank calc in github-readme-stats:
// commits + stars + prs + issues + followers, log-scaled and weighted, clamped.
function computeGrade({ commits, stars, prs, issues, followers }) {
  const score =
    Math.log2(commits + 1) * 3.2 +
    Math.log2(stars + 1) * 4.5 +
    Math.log2(prs + 1) * 3 +
    Math.log2(issues + 1) * 2 +
    Math.log2(followers + 1) * 2.5;

  const percent = Math.min(100, Math.round((score / 55) * 100));
  return percent;
}

async function fetchRepoData(repoFullName, token) {
  const [repoData, langData] = await Promise.all([
    restFetch(`/repos/${repoFullName}`, token),
    restFetch(`/repos/${repoFullName}/languages`, token),
  ]);

  const tech = Object.keys(langData || {}).slice(0, 6);
  const tagline = repoData.description || "";

  return {
    name: repoData.name,
    tagline,
    tech,
    link: repoData.html_url,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
  };
}

async function fetchStats(username, token) {
  const [user, repoStats] = await Promise.all([
    restFetch(`/users/${username}`, token),
    fetchRepoStats(username, token),
  ]);

  let totalCommits = 0;
  let totalPRs = 0;
  let totalIssues = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let calendar = [];

  const gqlData = await graphqlFetch(CONTRIB_QUERY, { login: username }, token);
  if (gqlData && gqlData.user) {
    const cc = gqlData.user.contributionsCollection;
    totalCommits = cc.totalCommitContributions;
    totalPRs = cc.totalPullRequestContributions;
    totalIssues = cc.totalIssueContributions;
    calendar = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
    const streaks = computeStreaks(calendar);
    currentStreak = streaks.currentStreak;
    longestStreak = streaks.longestStreak;
  }

  const grade = computeGrade({
    commits: totalCommits,
    stars: repoStats.totalStars,
    prs: totalPRs,
    issues: totalIssues,
    followers: user.followers || 0,
  });

  return {
    username: user.login,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio || "",
    followers: user.followers || 0,
    following: user.following || 0,
    publicRepos: user.public_repos || 0,
    totalStars: repoStats.totalStars,
    totalCommits,
    totalPRs,
    totalIssues,
    currentStreak,
    longestStreak,
    calendar, // [{date, contributionCount}], last ~365 days, oldest first
    topLanguages: repoStats.topLanguages,
    grade,
    hasToken: !!token,
  };
}

module.exports = { fetchStats, fetchRepoData };
