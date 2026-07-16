import { describe, it, expect } from "vitest";
import { computeAchievements } from "../lib/achievements.js";

function makeStats(overrides = {}) {
  return {
    totalCommits: 0,
    totalStars: 0,
    currentStreak: 0,
    longestStreak: 0,
    publicRepos: 0,
    followers: 0,
    topLanguages: [],
    ...overrides,
  };
}

describe("computeAchievements", () => {
  it("returns 7 achievements", () => {
    const result = computeAchievements(makeStats());
    expect(result).toHaveLength(7);
  });

  it("all achievements have required fields", () => {
    const result = computeAchievements(makeStats());
    result.forEach((a) => {
      expect(a).toHaveProperty("id");
      expect(a).toHaveProperty("label");
      expect(a).toHaveProperty("icon");
      expect(a).toHaveProperty("unlocked");
    });
  });

  it("century club unlocks at 100+ commits", () => {
    const locked = computeAchievements(makeStats({ totalCommits: 99 }));
    expect(locked.find((a) => a.id === "century-club").unlocked).toBe(false);

    const unlocked = computeAchievements(makeStats({ totalCommits: 100 }));
    expect(unlocked.find((a) => a.id === "century-club").unlocked).toBe(true);
  });

  it("star magnet unlocks at 50+ stars", () => {
    expect(
      computeAchievements(makeStats({ totalStars: 49 })).find((a) => a.id === "star-magnet").unlocked
    ).toBe(false);
    expect(
      computeAchievements(makeStats({ totalStars: 50 })).find((a) => a.id === "star-magnet").unlocked
    ).toBe(true);
  });

  it("on fire unlocks at 14+ day current streak", () => {
    expect(
      computeAchievements(makeStats({ currentStreak: 13 })).find((a) => a.id === "on-fire").unlocked
    ).toBe(false);
    expect(
      computeAchievements(makeStats({ currentStreak: 14 })).find((a) => a.id === "on-fire").unlocked
    ).toBe(true);
  });

  it("marathoner unlocks at 30+ day longest streak", () => {
    expect(
      computeAchievements(makeStats({ longestStreak: 29 })).find((a) => a.id === "marathoner").unlocked
    ).toBe(false);
    expect(
      computeAchievements(makeStats({ longestStreak: 30 })).find((a) => a.id === "marathoner").unlocked
    ).toBe(true);
  });

  it("builder unlocks at 20+ public repos", () => {
    expect(
      computeAchievements(makeStats({ publicRepos: 19 })).find((a) => a.id === "builder").unlocked
    ).toBe(false);
    expect(
      computeAchievements(makeStats({ publicRepos: 20 })).find((a) => a.id === "builder").unlocked
    ).toBe(true);
  });

  it("rising voice unlocks at 25+ followers", () => {
    expect(
      computeAchievements(makeStats({ followers: 24 })).find((a) => a.id === "rising-voice").unlocked
    ).toBe(false);
    expect(
      computeAchievements(makeStats({ followers: 25 })).find((a) => a.id === "rising-voice").unlocked
    ).toBe(true);
  });

  it("polyglot unlocks with 3+ languages", () => {
    expect(
      computeAchievements(makeStats({ topLanguages: [{ name: "JS" }, { name: "TS" }] })).find(
        (a) => a.id === "polyglot"
      ).unlocked
    ).toBe(false);
    expect(
      computeAchievements(
        makeStats({ topLanguages: [{ name: "JS" }, { name: "TS" }, { name: "Rust" }] })
      ).find((a) => a.id === "polyglot").unlocked
    ).toBe(true);
  });
});
