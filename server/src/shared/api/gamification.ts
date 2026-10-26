import type { LevelProgress } from "../gamification/levels.js";

// Wire contract for XP, levels, streak freezes and leaderboards (/api/v1/learner/gamification and
// /api/v1/learner/leaderboard). Each feature has its own server flag; a switched-off feature comes
// back as null (or status "disabled"), so clients never show half a feature.

export type { LevelProgress };

export type GamificationFeatures = {
  xp: boolean;
  streakFreezes: boolean;
  /** Levels and module stages. Needs XP. */
  levels: boolean;
  /** Needs XP. */
  leaderboards: boolean;
};

export type StreakFreezeSummary = {
  available: number;
  max: number;
  /** Learner-local days a freeze covered in the last two weeks, newest first. */
  recentlyCoveredDays: string[];
};

export type GamificationSummary = {
  features: GamificationFeatures;
  /** The learner chose "hide game elements"; clients show none of the parts below. */
  hidden: boolean;
  leaderboardOptIn: boolean;
  xp: { total: number; thisWeek: number } | null;
  level: LevelProgress | null;
  freezes: StreakFreezeSummary | null;
  /** Finished weekly boards the learner ended in the top three; null when leaderboards are off or there are none. */
  topThree: TopThreeFinishes | null;
};

export type TopThreeFinishes = {
  count: number;
  /** The most recent finish. */
  latest: { rank: number; courseTitle: string; weekStart: string };
};

export type GamificationPreferencesInput = {
  hidden?: boolean;
  leaderboardOptIn?: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  /** First name and last initial; "You" is the client's job. */
  name: string;
  xp: number;
  isYou: boolean;
};

export type LeaderboardView =
  | { status: "disabled" }
  | { status: "opt_in_required"; courseId: string; courseTitle: string }
  | { status: "unavailable"; reason: "organization_disabled" | "not_active"; courseId: string; courseTitle: string }
  | {
      status: "ready";
      courseId: string;
      courseTitle: string;
      /** Monday (UTC) of the current week; boards reset every Monday 00:00 UTC. */
      weekStart: string;
      resetsAt: string;
      groupSize: number;
      you: { rank: number; xp: number; bestWeekXp: number };
      /** The learner and up to three people either side of them. */
      entries: LeaderboardEntry[];
      /** Last week's top three on this board (only people who scored), or null when there were none. */
      lastWeek: { weekStart: string; winners: LeaderboardEntry[] } | null;
    };

export const LEADERBOARD_NEIGHBOURS = 3;
