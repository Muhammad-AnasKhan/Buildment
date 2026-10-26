import { describe, expect, it } from "vitest";
import { levelForXp, levelProgress, xpForLevel } from "../../../../src/shared/gamification/levels.js";
import { XP_AMOUNTS, XP_DAILY_CAPS, XP_SOURCES, quizPassedXp, xpKeys } from "../../../../src/shared/gamification/xp.js";

describe("levels", () => {
  it("starts at level 1 and follows 50·(n−1)²", () => {
    expect([1, 2, 3, 5, 10].map(xpForLevel)).toEqual([0, 50, 200, 800, 4050]);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(49)).toBe(1);
    expect(levelForXp(50)).toBe(2);
    expect(levelForXp(199)).toBe(2);
    expect(levelForXp(200)).toBe(3);
    expect(levelForXp(4050)).toBe(10);
  });

  it("treats negative or fractional XP safely", () => {
    expect(levelForXp(-20)).toBe(1);
    expect(levelForXp(50.9)).toBe(2);
  });

  it("reports progress toward the next level", () => {
    expect(levelProgress(120)).toEqual({ level: 2, totalXp: 120, intoLevel: 70, levelSpan: 150, toNext: 80, percent: 46 });
    expect(levelProgress(0)).toMatchObject({ level: 1, intoLevel: 0, toNext: 50, percent: 0 });
  });

  it("agrees with the thresholds for every level up to 100", () => {
    for (let level = 1; level <= 100; level += 1) {
      expect(levelForXp(xpForLevel(level))).toBe(level);
      if (level > 1) expect(levelForXp(xpForLevel(level) - 1)).toBe(level - 1);
    }
  });
});

describe("xp rules", () => {
  it("gives every source a positive whole amount", () => {
    for (const source of XP_SOURCES) {
      expect(Number.isInteger(XP_AMOUNTS[source]) && XP_AMOUNTS[source] > 0, source).toBe(true);
    }
  });

  it("pays less for later quiz tries, never nothing for a pass", () => {
    expect([1, 2, 3, 9].map(quizPassedXp)).toEqual([15, 10, 5, 5]);
  });

  it("caps the chapters that are easy to farm", () => {
    expect(XP_DAILY_CAPS.light_chapter_completed).toBe(5);
    expect(XP_AMOUNTS.light_chapter_completed).toBeLessThan(XP_AMOUNTS.chapter_completed);
  });

  it("keys each moment once", () => {
    expect(xpKeys.chapter("c1")).toBe("chapter:c1");
    expect(new Set([xpKeys.chapter("x"), xpKeys.quizPassed("x"), xpKeys.quizPerfect("x"), xpKeys.course("x"), xpKeys.answerApproved("x")]).size).toBe(5);
  });
});
