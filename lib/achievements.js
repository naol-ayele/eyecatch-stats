// Each achievement is computed from real stats — nothing hardcoded, nothing manually
// granted. GitHub's own Achievements (Pull Shark, Galaxy Brain, etc.) aren't available
// through any public API, so these are original badges based on activity thresholds.

const ACHIEVEMENTS = [
  {
    id: "century-club",
    label: "Century Club",
    detail: "100+ commits this year",
    icon: "commit",
    check: (s) => s.totalCommits >= 100,
  },
  {
    id: "star-magnet",
    label: "Star Magnet",
    detail: "50+ stars earned",
    icon: "star",
    check: (s) => s.totalStars >= 50,
  },
  {
    id: "on-fire",
    label: "On Fire",
    detail: "14+ day streak",
    icon: "flame",
    check: (s) => s.currentStreak >= 14,
  },
  {
    id: "marathoner",
    label: "Marathoner",
    detail: "30+ day longest streak",
    icon: "flag",
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: "builder",
    label: "Builder",
    detail: "20+ public repos",
    icon: "box",
    check: (s) => s.publicRepos >= 20,
  },
  {
    id: "rising-voice",
    label: "Rising Voice",
    detail: "25+ followers",
    icon: "people",
    check: (s) => s.followers >= 25,
  },
  {
    id: "polyglot",
    label: "Polyglot",
    detail: "3+ languages across repos",
    icon: "code",
    check: (s) => s.topLanguages.length >= 3,
  },
];

function computeAchievements(stats) {
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: a.check(stats),
  }));
}

module.exports = { ACHIEVEMENTS, computeAchievements };
