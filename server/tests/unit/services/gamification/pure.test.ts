import { describe, expect, it } from "vitest";
import { currentLeaderboardWeek, leaderboardName, rankRows } from "../../../../src/services/gamification/leaderboard.js";
import { moduleStage } from "../../../../src/services/learner/dashboard-model.js";

describe("leaderboard helpers", () => {
  it("shows first name and last initial only", () => {
    expect(leaderboardName("Ada Lovelace")).toBe("Ada L.");
    expect(leaderboardName("  ada   king lovelace ")).toBe("ada L.");
    expect(leaderboardName("Plato")).toBe("Plato");
    expect(leaderboardName(null)).toBe("Learner");
    expect(leaderboardName("   ")).toBe("Learner");
  });

  it("ranks by XP, then by who reached it first, then by who joined first", () => {
    const at = (iso: string) => new Date(iso);
    const ranked = rankRows([
      { id: "late", xp: 40, reachedAt: at("2026-10-20T12:00:00Z"), joinedAt: at("2026-10-19T00:00:00Z") },
      { id: "zero-new", xp: 0, reachedAt: null, joinedAt: at("2026-10-21T00:00:00Z") },
      { id: "top", xp: 90, reachedAt: at("2026-10-22T00:00:00Z"), joinedAt: at("2026-10-19T00:00:00Z") },
      { id: "early", xp: 40, reachedAt: at("2026-10-20T08:00:00Z"), joinedAt: at("2026-10-20T00:00:00Z") },
      { id: "zero-old", xp: 0, reachedAt: null, joinedAt: at("2026-10-19T06:00:00Z") },
    ]);
    expect(ranked.map((row) => row.id)).toEqual(["top", "early", "late", "zero-old", "zero-new"]);
  });

  it("starts the board week on Monday 00:00 UTC", () => {
    expect(currentLeaderboardWeek(new Date("2026-10-25T23:59:00Z")).toISOString()).toBe("2026-10-19T00:00:00.000Z");
    expect(currentLeaderboardWeek(new Date("2026-10-26T00:00:00Z")).toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });
});

describe("moduleStage", () => {
  const modules = [
    { title: "Intro", chapters: [{ id: "a" }, { id: "b" }] },
    { title: "Empty", chapters: [] },
    { title: "Core", chapters: [{ id: "c" }] },
    { title: "Project", chapters: [{ id: "d" }] },
  ];

  it("counts only modules with chapters", () => {
    expect(moduleStage(modules, "c")).toEqual({ current: 2, total: 3, title: "Core" });
    expect(moduleStage(modules, "a")).toEqual({ current: 1, total: 3, title: "Intro" });
  });

  it("shows the last stage when nothing is left", () => {
    expect(moduleStage(modules, null)).toEqual({ current: 3, total: 3, title: "Project" });
  });

  it("is null for a course without chapters", () => {
    expect(moduleStage([{ title: "Empty", chapters: [] }], null)).toBeNull();
  });
});
