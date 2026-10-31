import { prisma } from "../../db/prisma.js";
import {
  LEADERBOARD_HUB_NEIGHBOURS,
  type LeaderboardCategory,
  type LeaderboardHubEntry,
  type LeaderboardHubView,
  type LeaderboardScope,
  type LeagueInfo,
  type LeagueOutcome,
  type LeagueTier,
} from "../../shared/api/gamification.js";
import { computeStreak } from "../../shared/lib/streak.js";
import { dateToDayKey, dayKeyToDate, localDayKey, shiftDayKey, weekStartKey } from "../../shared/lib/local-date.js";
import { gamificationFeatures } from "./flags.js";
import { currentLeaderboardWeek, loadLeaderboard, loadListableLearners, type ListableLearner } from "./leaderboard.js";
import { loadLeaguePlacement } from "./league.js";
import { leagueDemotionZone, leaguePromotionZone, nextLeagueTier, prevLeagueTier } from "../../shared/gamification/leagues.js";
import type { LeaderboardView } from "../../shared/api/gamification.js";

// The leaderboard hub: several boards behind one read. The weekly course board delegates to the
// established per-course service unchanged; the global boards rank opted-in learners across every
// course. Privacy rules are identical to the course board — only learners who opted in and show
// game elements are ever listed, names are first name and last initial, and a learner far from the
// top still sees their own neighbourhood and a personal best to beat.
//
// Boards:
//   weekly_xp / course  — the existing per-course weekly XP race.
//   weekly_xp / global  — the league board: ranked inside your own tier, top 10% promote and
//                         bottom 20% demote at the Monday reset.
//   all_time_xp / global — recognition only, ranked by cached total XP.
//   speed / global       — chapters completed this week, ties broken by lower average study time.
//   streak / global      — current active-day streak in the learner's own timezone.

export type HubInput = {
  category: LeaderboardCategory;
  scope: LeaderboardScope;
  courseId?: string | null;
  now?: Date;
};

type RankedRow = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  tier: LeagueTier;
  createdAt: Date;
  score: number;
  /** Lower ranks better (earlier reached-at, lower average time, older account). */
  tiebreak: number;
};

const STREAK_HISTORY_DAYS = 400;

function sortRows(rows: RankedRow[]): RankedRow[] {
  return [...rows].sort((a, b) => b.score - a.score || a.tiebreak - b.tiebreak || a.createdAt.getTime() - b.createdAt.getTime());
}

function toEntry(row: RankedRow, rank: number, viewerId: string): LeaderboardHubEntry {
  return { rank, name: row.name, score: row.score, isYou: row.userId === viewerId, tier: row.tier, avatarUrl: row.avatarUrl };
}

/** Podium (top three) plus the viewer's neighbourhood, merged and rank-ordered. */
function hubEntries(rows: RankedRow[], viewerId: string): LeaderboardHubEntry[] {
  const meIndex = Math.max(0, rows.findIndex((row) => row.userId === viewerId));
  const picked = new Map<string, RankedRow>();
  for (const row of rows.slice(0, 3)) picked.set(row.userId, row);
  for (const row of rows.slice(Math.max(0, meIndex - LEADERBOARD_HUB_NEIGHBOURS), meIndex + LEADERBOARD_HUB_NEIGHBOURS + 1)) {
    picked.set(row.userId, row);
  }
  return [...picked.values()]
    .sort((a, b) => rows.indexOf(a) - rows.indexOf(b))
    .map((row) => toEntry(row, rows.indexOf(row) + 1, viewerId));
}

function xpReset(weekStart: string) {
  return `${shiftDayKey(weekStart, 7)}T00:00:00.000Z`;
}

/** The viewer's best finished week of global XP, for the "beat your best" bar. */
async function bestWeeklyXp(userId: string, weekKey: Date): Promise<number> {
  const past = await prisma.xpEntry.groupBy({
    by: ["weekKey"],
    where: { userId, weekKey: { lt: weekKey } },
    _sum: { amount: true },
  });
  return Math.max(0, ...past.map((row) => row._sum.amount ?? 0));
}

function adaptCourseView(view: LeaderboardView, category: LeaderboardCategory, scope: LeaderboardScope): LeaderboardHubView {
  if (view.status === "disabled") return { status: "disabled", category, scope };
  if (view.status === "opt_in_required") {
    return { status: "opt_in_required", category, scope, courseId: view.courseId, courseTitle: view.courseTitle };
  }
  if (view.status === "unavailable") {
    return { status: "unavailable", reason: view.reason, category, scope, courseId: view.courseId, courseTitle: view.courseTitle };
  }
  return {
    status: "ready",
    category,
    scope,
    courseId: view.courseId,
    courseTitle: view.courseTitle,
    metricLabel: "XP",
    weekStart: view.weekStart,
    resetsAt: view.resetsAt,
    groupSize: view.groupSize,
    you: { rank: view.you.rank, score: view.you.xp, bestScore: view.you.bestWeekXp },
    entries: view.entries.map((entry) => ({ rank: entry.rank, name: entry.name, score: entry.xp, isYou: entry.isYou })),
    lastWeek: view.lastWeek
      ? { weekStart: view.lastWeek.weekStart, winners: view.lastWeek.winners.map((winner) => ({ rank: winner.rank, name: winner.name, score: winner.xp, isYou: winner.isYou })) }
      : null,
    league: null,
  };
}

async function globalWeeklyXp(viewerId: string, now: Date): Promise<LeaderboardHubView> {
  const weekKey = currentLeaderboardWeek(now);
  const weekStart = dateToDayKey(weekKey);
  const lastWeekKey = dayKeyToDate(shiftDayKey(weekStart, -7));
  const [learners, weekly, lastWeekPlacements] = await Promise.all([
    loadListableLearners(),
    prisma.xpEntry.groupBy({ by: ["userId"], where: { weekKey }, _sum: { amount: true }, _max: { createdAt: true } }),
    prisma.leaguePlacement.findMany({
      where: { weekKey: lastWeekKey, rank: { lte: 3 } },
      orderBy: { rank: "asc" },
      select: { userId: true, tier: true, rank: true, xp: true },
    }),
  ]);
  const xpByUser = new Map(weekly.map((row) => [row.userId, { xp: row._sum.amount ?? 0, reachedAt: row._max.createdAt }]));
  const rows = sortRows(
    learners.map((learner) => {
      const score = xpByUser.get(learner.userId);
      return {
        userId: learner.userId,
        name: learner.name,
        avatarUrl: learner.avatarUrl,
        tier: learner.leagueTier,
        createdAt: learner.createdAt,
        score: score?.xp ?? 0,
        tiebreak: score?.reachedAt?.getTime() ?? Number.MAX_SAFE_INTEGER,
      };
    })
  );

  const viewer = rows.find((row) => row.userId === viewerId);
  const tier = viewer?.tier ?? "BRONZE";
  const tierRows = rows.filter((row) => row.tier === tier);
  const meIndex = Math.max(0, tierRows.findIndex((row) => row.userId === viewerId));
  const rank = tierRows.length > 0 && viewer ? meIndex + 1 : 0;

  const [lastWeekPlacement, bestScore] = await Promise.all([
    loadLeaguePlacement(viewerId, lastWeekKey),
    bestWeeklyXp(viewerId, weekKey),
  ]);

  const league: LeagueInfo = {
    tier,
    nextTier: nextLeagueTier(tier),
    prevTier: prevLeagueTier(tier),
    rank,
    groupSize: tierRows.length,
    promotionZone: leaguePromotionZone(tierRows.length),
    demotionZone: leagueDemotionZone(tierRows.length),
    lastWeek: lastWeekPlacement ? { outcome: lastWeekPlacement.outcome as LeagueOutcome, fromTier: lastWeekPlacement.tier } : null,
  };

  // Last week's top three in the viewer's current tier. Only learners still listable are named —
  // someone who opted out or dropped after the week closed keeps the place but is not shown.
  const learnerByUser = new Map(learners.map((learner) => [learner.userId, learner]));
  const lastWeekWinners = lastWeekPlacements
    .filter((placement) => placement.tier === tier)
    .map((placement) => ({ placement, learner: learnerByUser.get(placement.userId) }))
    .filter((item): item is { placement: (typeof lastWeekPlacements)[number]; learner: ListableLearner } => Boolean(item.learner) && item.placement.xp > 0)
    .slice(0, 3)
    .map((item) => ({
      rank: item.placement.rank,
      name: item.learner.name,
      score: item.placement.xp,
      isYou: item.learner.userId === viewerId,
      tier: item.learner.leagueTier,
      avatarUrl: item.learner.avatarUrl,
    }));

  return {
    status: "ready",
    category: "weekly_xp",
    scope: "global",
    courseId: null,
    courseTitle: null,
    metricLabel: "XP",
    weekStart,
    resetsAt: xpReset(weekStart),
    groupSize: tierRows.length,
    you: { rank, score: viewer?.score ?? 0, bestScore },
    entries: hubEntries(tierRows, viewerId),
    lastWeek: lastWeekWinners.length > 0 ? { weekStart: dateToDayKey(lastWeekKey), winners: lastWeekWinners } : null,
    league,
  };
}

async function globalAllTimeXp(viewerId: string): Promise<LeaderboardHubView> {
  const learners = await loadListableLearners();
  const rows = sortRows(
    learners.map((learner) => ({
      userId: learner.userId,
      name: learner.name,
      avatarUrl: learner.avatarUrl,
      tier: learner.leagueTier,
      createdAt: learner.createdAt,
      score: learner.xpTotal,
      tiebreak: learner.createdAt.getTime(),
    }))
  );
  const viewer = rows.find((row) => row.userId === viewerId);
  return {
    status: "ready",
    category: "all_time_xp",
    scope: "global",
    courseId: null,
    courseTitle: null,
    metricLabel: "XP",
    weekStart: null,
    resetsAt: null,
    groupSize: rows.length,
    you: { rank: viewer ? rows.indexOf(viewer) + 1 : 0, score: viewer?.score ?? 0, bestScore: null },
    entries: hubEntries(rows, viewerId),
    lastWeek: null,
    league: null,
  };
}

async function globalSpeed(viewerId: string, now: Date): Promise<LeaderboardHubView> {
  const weekKey = currentLeaderboardWeek(now);
  const weekStart = dateToDayKey(weekKey);
  const weekStartDate = dayKeyToDate(weekStart);
  const learners = await loadListableLearners();
  const ownerByEnrollment = new Map<string, ListableLearner>();
  for (const learner of learners) {
    for (const enrollmentId of learner.enrollmentIds) ownerByEnrollment.set(enrollmentId, learner);
  }
  const completions = await prisma.chapterProgress.findMany({
    where: { enrollmentId: { in: [...ownerByEnrollment.keys()] }, status: "COMPLETED", completedAt: { gte: weekStartDate } },
    select: { enrollmentId: true, timeSpentSeconds: true, completedAt: true },
  });
  const byUser = new Map<string, { count: number; totalSeconds: number; lastCompletedAt: Date | null }>();
  for (const completion of completions) {
    const learner = ownerByEnrollment.get(completion.enrollmentId);
    if (!learner) continue;
    const row = byUser.get(learner.userId) ?? { count: 0, totalSeconds: 0, lastCompletedAt: null };
    row.count += 1;
    row.totalSeconds += completion.timeSpentSeconds;
    if (!row.lastCompletedAt || completion.completedAt!.getTime() > row.lastCompletedAt.getTime()) row.lastCompletedAt = completion.completedAt;
    byUser.set(learner.userId, row);
  }
  const rows = sortRows(
    learners.map((learner) => {
      const stat = byUser.get(learner.userId);
      const count = stat?.count ?? 0;
      return {
        userId: learner.userId,
        name: learner.name,
        avatarUrl: learner.avatarUrl,
        tier: learner.leagueTier,
        createdAt: learner.createdAt,
        score: count,
        tiebreak: count > 0 && stat ? stat.totalSeconds / count : Number.MAX_SAFE_INTEGER,
      };
    })
  );

  const viewer = rows.find((row) => row.userId === viewerId);
  const viewerBest = await bestWeeklyChapters(viewerId);
  return {
    status: "ready",
    category: "speed",
    scope: "global",
    courseId: null,
    courseTitle: null,
    metricLabel: "chapters",
    weekStart,
    resetsAt: xpReset(weekStart),
    groupSize: rows.length,
    you: { rank: viewer ? rows.indexOf(viewer) + 1 : 0, score: viewer?.score ?? 0, bestScore: viewerBest },
    entries: hubEntries(rows, viewerId),
    lastWeek: null,
    league: null,
  };
}

/** The viewer's best finished week of chapter completions, for the "beat your best" bar. */
async function bestWeeklyChapters(userId: string): Promise<number> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { not: "DROPPED" }, lifecycle: { in: ["ACTIVE", "COMPLETED"] } },
    select: { id: true },
  });
  if (enrollments.length === 0) return 0;
  const completions = await prisma.chapterProgress.findMany({
    where: { enrollmentId: { in: enrollments.map((enrollment) => enrollment.id) }, status: "COMPLETED", completedAt: { not: null } },
    select: { completedAt: true },
  });
  const byWeek = new Map<string, number>();
  const currentWeek = weekStartKey(dateToDayKey(new Date()));
  for (const completion of completions) {
    const week = weekStartKey(dateToDayKey(completion.completedAt!));
    if (week >= currentWeek) continue;
    byWeek.set(week, (byWeek.get(week) ?? 0) + 1);
  }
  return Math.max(0, ...byWeek.values());
}

async function globalStreak(viewerId: string, now: Date): Promise<LeaderboardHubView> {
  const learners = await loadListableLearners();
  const cutoff = dayKeyToDate(shiftDayKey(dateToDayKey(now), -STREAK_HISTORY_DAYS));
  const enrollmentIds = learners.flatMap((learner) => learner.enrollmentIds);
  const userIds = learners.map((learner) => learner.userId);
  const [activity, frozen] = await Promise.all([
    enrollmentIds.length === 0
      ? []
      : prisma.dailyActivity.findMany({
          where: { enrollmentId: { in: enrollmentIds }, date: { gte: cutoff }, activeSeconds: { gt: 0 } },
          select: { enrollmentId: true, date: true },
        }),
    userIds.length === 0 ? [] : prisma.streakFreezeDay.findMany({ where: { userId: { in: userIds } }, select: { userId: true, date: true } }),
  ]);

  const ownerByEnrollment = new Map<string, ListableLearner>();
  for (const learner of learners) {
    for (const enrollmentId of learner.enrollmentIds) ownerByEnrollment.set(enrollmentId, learner);
  }
  const activeByUser = new Map<string, Set<string>>();
  for (const day of activity) {
    const learner = ownerByEnrollment.get(day.enrollmentId);
    if (!learner) continue;
    const days = activeByUser.get(learner.userId) ?? new Set<string>();
    days.add(dateToDayKey(day.date));
    activeByUser.set(learner.userId, days);
  }
  const frozenByUser = new Map<string, string[]>();
  for (const day of frozen) {
    const days = frozenByUser.get(day.userId) ?? [];
    days.push(dateToDayKey(day.date));
    frozenByUser.set(day.userId, days);
  }

  const rows = sortRows(
    learners.map((learner) => {
      const today = localDayKey(now, learner.timezone);
      const { count } = computeStreak(activeByUser.get(learner.userId) ?? [], today, {
        frozenDays: frozenByUser.get(learner.userId) ?? [],
        freezesAvailable: learner.streakFreezes,
      });
      return {
        userId: learner.userId,
        name: learner.name,
        avatarUrl: learner.avatarUrl,
        tier: learner.leagueTier,
        createdAt: learner.createdAt,
        score: count,
        tiebreak: learner.createdAt.getTime(),
      };
    })
  );

  const viewer = rows.find((row) => row.userId === viewerId);
  return {
    status: "ready",
    category: "streak",
    scope: "global",
    courseId: null,
    courseTitle: null,
    metricLabel: "day streak",
    weekStart: null,
    resetsAt: null,
    groupSize: rows.length,
    you: { rank: viewer ? rows.indexOf(viewer) + 1 : 0, score: viewer?.score ?? 0, bestScore: viewer ? await longestStreak(viewerId) : null },
    entries: hubEntries(rows, viewerId),
    lastWeek: null,
    league: null,
  };
}

/** The viewer's longest ever run of active days (ignoring freezes — the pure record). */
async function longestStreak(userId: string): Promise<number> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { not: "DROPPED" }, lifecycle: { in: ["ACTIVE", "COMPLETED"] } },
    select: { id: true },
  });
  if (enrollments.length === 0) return 0;
  const days = await prisma.dailyActivity.findMany({
    where: { enrollmentId: { in: enrollments.map((enrollment) => enrollment.id) }, activeSeconds: { gt: 0 } },
    select: { date: true },
  });
  const keys = [...new Set(days.map((day) => dateToDayKey(day.date)))].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of keys) {
    run = previous !== null && shiftDayKey(previous, 1) === key ? run + 1 : 1;
    if (run > best) best = run;
    previous = key;
  }
  return best;
}

export async function loadLeaderboardHub(userId: string, input: HubInput): Promise<LeaderboardHubView> {
  const now = input.now ?? new Date();
  const category = input.category;
  const scope = input.scope;
  if (!gamificationFeatures().leaderboards) return { status: "disabled", category, scope };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leaderboardOptIn: true, gamificationHidden: true },
  });
  if (!user || user.gamificationHidden) return { status: "disabled", category, scope };

  if (scope === "course") {
    if (!input.courseId) {
      return { status: "unavailable", reason: "not_active", category, scope, courseId: null, courseTitle: null };
    }
    return adaptCourseView(await loadLeaderboard(userId, input.courseId, now), category, scope);
  }

  if (!user.leaderboardOptIn) {
    return { status: "opt_in_required", category, scope, courseId: null, courseTitle: null };
  }
  const liveEnrollments = await prisma.enrollment.count({
    where: { userId, status: { not: "DROPPED" }, lifecycle: { in: ["ACTIVE", "COMPLETED"] } },
  });
  if (liveEnrollments === 0) {
    return { status: "unavailable", reason: "not_active", category, scope, courseId: null, courseTitle: null };
  }

  switch (category) {
    case "weekly_xp":
      return globalWeeklyXp(userId, now);
    case "all_time_xp":
      return globalAllTimeXp(userId);
    case "speed":
      return globalSpeed(userId, now);
    case "streak":
      return globalStreak(userId, now);
  }
}
