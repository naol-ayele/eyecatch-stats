import { describe, it, expect } from "vitest";
import { fetchStats } from "../lib/github.js";

function makeDay(count) {
  return { date: "2024-01-01", contributionCount: count };
}

function computeStreaks(days) {
  let longest = 0;
  let running = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      const distFromEnd = days.length - 1 - i;
      if (distFromEnd <= 1) {
        current = 1;
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

describe("computeStreaks", () => {
  it("handles all zeros", () => {
    const days = [0, 0, 0, 0, 0].map(makeDay);
    expect(computeStreaks(days)).toEqual({ longestStreak: 0, currentStreak: 0 });
  });

  it("handles all ones", () => {
    const days = [1, 1, 1, 1, 1].map(makeDay);
    expect(computeStreaks(days)).toEqual({ longestStreak: 5, currentStreak: 5 });
  });

  it("finds longest streak in the middle", () => {
    const days = [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0].map(makeDay);
    expect(computeStreaks(days)).toEqual({ longestStreak: 4, currentStreak: 2 });
  });

  it("current streak ends at trailing run", () => {
    const days = [0, 1, 0, 1, 1, 1].map(makeDay);
    expect(computeStreaks(days).currentStreak).toBe(3);
  });

  it("current streak skips trailing zeros", () => {
    const days = [1, 1, 1, 0, 0].map(makeDay);
    expect(computeStreaks(days).currentStreak).toBe(0);
  });

  it("current streak returns 0 when last contribution is 2+ days ago", () => {
    const days = [1, 1, 0, 1, 1, 1, 0, 0].map(makeDay);
    expect(computeStreaks(days).currentStreak).toBe(0);
  });

  it("current streak counts from yesterday when today is zero", () => {
    const days = [1, 1, 0, 1, 1, 1, 1, 0].map(makeDay);
    expect(computeStreaks(days).currentStreak).toBe(4);
  });

  it("longest streak is correct when multiple runs", () => {
    const days = [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0].map(makeDay);
    expect(computeStreaks(days).longestStreak).toBe(4);
  });
});

describe("fetchStats", () => {
  it("exports a function", () => {
    expect(typeof fetchStats).toBe("function");
  });
});
