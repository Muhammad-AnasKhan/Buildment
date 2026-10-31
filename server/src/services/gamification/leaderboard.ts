import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import {
  LEADERBOARD_NEIGHBOURS,
  type LeaderboardEntry,
  type LeaderboardView,
  type LeagueTier,
  type TopThreeFinishes,
} from "../../shared/api/gamification.js";
import { dateToDayKey, dayKeyToDate, shiftDayKey, weekStartKey } from "../../shared/lib/local-date.js";
import { gamificationFeatures } from "./flags.js";

// Weekly course leaderboards. Privacy first: only learners who opted in and show game elements are
// ever listed, and only to people on the same board: one course and one organization (direct
// learners share their own), with no size limit, so a board has exactly one #1. Each learner sees
// only their own neighbourhood, so a big board stays short. Scores are this week's XP in that
// course; weeks start Monday 00:00 UTC so everyone on a board shares the same deadline. Someone who
// drops, is cancelled or opts out disappears from every board at once, because eligibility is
// checked on every read.
//
// When a week ends, the board's top three are written to LeaderboardPlacement the first time anyone
// reads it (last week's winners on the board, top-three finishes on the profile). A finished week is
// never re-ranked; a winner who later opts out or drops keeps the place but is no longer named.

type Tx = Prisma.TransactionClient;
type BoardKey = { courseId: string; organizationId: string | null; weekKey: Date };
type ListableUser = {
  leaderboardOptIn: boolean;
  gamificationHidden: boolean;
  enrollments: Array<{ lifecycle: string; status: string }>;
};

const LIVE_LIFECYCLES = new Set(["ACTIVE", "COMPLETED"]);
const PODIUM_SIZE = 3;

/** The current board week (Monday, UTC) as a `@db.Date` value. */
export function currentLeaderboardWeek(now: Date = new Date()): Date {
  return dayKeyToDate(weekStartKey(dateToDayKey(now)));
}

/** "Ada Lovelace" → "Ada L."; never the email, never a full surname. */
export function leaderboardName(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Learner";
  const first = parts[0]!.slice(0, 24);
  const last = parts.length > 1 ? ` ${parts.at(-1)![0]!.toUpperCase()}.` : "";
  return `${first}${last}`;
}

/** Ties go to whoever reached the score first, then to whoever joined first. */
export function rankRows<T extends { xp: number; reachedAt: Date | null; joinedAt: Date }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      b.xp - a.xp ||
      (a.reachedAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.reachedAt?.getTime() ?? Number.MAX_SAFE_INTEGER) ||
      a.joinedAt.getTime() - b.joinedAt.getTime()
  );
}

/** Opted in, showing game elements and still actively enrolled in the board's course. */
function listable(user: ListableUser): boolean {
  return (
    user.leaderboardOptIn &&
    !user.gamificationHidden &&
    user.enrollments.some((row) => row.status !== "DROPPED" && LIVE_LIFECYCLES.has(row.lifecycle))
  );
}

function boardWhere(board: BoardKey) {
  return { courseId: board.courseId, organizationId: board.organizationId, weekKey: board.weekKey };
}

function boardLockKey(board: BoardKey) {
  return `leaderboard:${board.courseId}:${board.organizationId ?? "direct"}:${dateToDayKey(board.weekKey)}`;
}

async function organizationAllowsBoards(db: Tx | typeof prisma, organizationId: string | null, courseId: string) {
  if (!organizationId) return true;
  const allocation = await db.organizationCourse.findUnique({
    where: { organizationId_courseId: { organizationId, courseId } },
    select: { leaderboardEnabled: true },
  });
  return allocation?.leaderboardEnabled ?? true;
}

/** Puts the learner on this week's board for the course and their organization, opening it if needed. */
async function ensureMembership(tx: Tx, input: { userId: string; courseId: string; organizationId: string | null; weekKey: Date }) {
  const key = { userId: input.userId, courseId: input.courseId, weekKey: input.weekKey };
  const existing = await tx.leaderboardMember.findUnique({ where: { userId_courseId_weekKey: key }, select: { groupId: true } });
  if (existing) return;

  // One joiner at a time per board-week, so two learners joining at once cannot open two boards
  // (organizationId is nullable, so a unique index could not stop that for direct learners).
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${boardLockKey(input)}))`;
  const raced = await tx.leaderboardMember.findUnique({ where: { userId_courseId_weekKey: key }, select: { groupId: true } });
  if (raced) return;

  const board = await tx.leaderboardGroup.findFirst({
    where: boardWhere(input),
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const groupId = board?.id ?? (await tx.leaderboardGroup.create({ data: boardWhere(input), select: { id: true } })).id;
  await tx.leaderboardMember.create({ data: { groupId, ...key } });
}

/**
 * Everyone who may be listed on a board, ranked by that week's XP in the course. `alwaysInclude`
 * keeps the viewer on their own board. Reads the whole board rather than one group row, so learners
 * seated in separate groups while boards were capped at 30 people still land on one ranking.
 */
async function boardStandings(board: BoardKey, alwaysInclude?: string) {
  const members = await prisma.leaderboardMember.findMany({
    where: { courseId: board.courseId, weekKey: board.weekKey, group: { organizationId: board.organizationId } },
    select: {
      userId: true,
      joinedAt: true,
      user: {
        select: {
          name: true,
          leaderboardOptIn: true,
          gamificationHidden: true,
          enrollments: { where: { courseId: board.courseId }, select: { lifecycle: true, status: true } },
        },
      },
    },
  });
  const eligible = members.filter((member) => member.userId === alwaysInclude || listable(member.user));

  const weekly = await prisma.xpEntry.groupBy({
    by: ["userId"],
    where: { courseId: board.courseId, weekKey: board.weekKey, userId: { in: eligible.map((member) => member.userId) } },
    _sum: { amount: true },
    _max: { createdAt: true },
  });
  const scores = new Map(weekly.map((row) => [row.userId, row]));

  return rankRows(
    eligible.map((member) => ({
      userId: member.userId,
      name: leaderboardName(member.user.name),
      xp: Math.max(0, scores.get(member.userId)?._sum.amount ?? 0),
      reachedAt: scores.get(member.userId)?._max.createdAt ?? null,
      joinedAt: member.joinedAt,
    }))
  );
}

/** Writes a finished week's top three (people who scored) once, however many requests ask at once. */
async function settleBoard(board: BoardKey): Promise<void> {
  const open = await prisma.leaderboardGroup.count({ where: { ...boardWhere(board), settledAt: null } });
  if (open === 0) return;

  const podium = (await boardStandings(board)).filter((row) => row.xp > 0).slice(0, PODIUM_SIZE);
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${boardLockKey(board)}))`;
    const claimed = await tx.leaderboardGroup.updateMany({
      where: { ...boardWhere(board), settledAt: null },
      data: { settledAt: new Date() },
    });
    if (claimed.count === 0) return; // another request settled it first
    await tx.leaderboardPlacement.createMany({
      data: podium.map((row, index) => ({ ...boardWhere(board), userId: row.userId, rank: index + 1, xp: row.xp })),
      skipDuplicates: true,
    });
  });
}

/** Last week's winners on a board, settling it first. Winners who can no longer be listed are left out. */
async function lastWeekWinners(board: BoardKey, viewerId: string): Promise<{ weekStart: string; winners: LeaderboardEntry[] } | null> {
  await settleBoard(board);
  const placements = await prisma.leaderboardPlacement.findMany({
    where: boardWhere(board),
    orderBy: { rank: "asc" },
    select: {
      userId: true,
      rank: true,
      xp: true,
      user: {
        select: {
          name: true,
          leaderboardOptIn: true,
          gamificationHidden: true,
          enrollments: { where: { courseId: board.courseId }, select: { lifecycle: true, status: true } },
        },
      },
    },
  });
  const winners = placements
    .filter((row) => row.userId === viewerId || listable(row.user))
    .map((row) => ({ rank: row.rank, name: leaderboardName(row.user.name), xp: row.xp, isYou: row.userId === viewerId }));
  return winners.length > 0 ? { weekStart: dateToDayKey(board.weekKey), winners } : null;
}

/** Called when XP lands in a course: an opted-in learner joins that week's board without visiting it. */
export async function joinLeaderboardForAward(
  tx: Tx,
  input: { userId: string; courseId: string; organizationId: string | null; weekKey: Date }
): Promise<void> {
  if (!gamificationFeatures().leaderboards) return;
  const user = await tx.user.findUnique({ where: { id: input.userId }, select: { leaderboardOptIn: true, gamificationHidden: true } });
  if (!user?.leaderboardOptIn || user.gamificationHidden) return;
  if (!(await organizationAllowsBoards(tx, input.organizationId, input.courseId))) return;
  await ensureMembership(tx, input);
}

/** Opting out (or hiding game elements) takes the learner off every board this week straight away. */
export async function leaveCurrentBoards(tx: Tx, userId: string, now: Date = new Date()): Promise<void> {
  await tx.leaderboardMember.deleteMany({ where: { userId, weekKey: currentLeaderboardWeek(now) } });
}

/**
 * The learner's top-three finishes, settling any finished board they were on first (usually none,
 * at most one per course after a quiet stretch). Null when there are none.
 */
export async function loadTopThreeFinishes(userId: string, now: Date = new Date()): Promise<TopThreeFinishes | null> {
  const unsettled = await prisma.leaderboardMember.findMany({
    where: { userId, weekKey: { lt: currentLeaderboardWeek(now) }, group: { settledAt: null } },
    select: { courseId: true, weekKey: true, group: { select: { organizationId: true } } },
  });
  for (const row of unsettled) {
    await settleBoard({ courseId: row.courseId, organizationId: row.group.organizationId, weekKey: row.weekKey });
  }

  const [count, latest] = await Promise.all([
    prisma.leaderboardPlacement.count({ where: { userId } }),
    prisma.leaderboardPlacement.findFirst({
      where: { userId },
      orderBy: [{ weekKey: "desc" }, { rank: "asc" }],
      select: { rank: true, weekKey: true, course: { select: { title: true } } },
    }),
  ]);
  if (!latest) return null;
  return { count, latest: { rank: latest.rank, courseTitle: latest.course.title, weekStart: dateToDayKey(latest.weekKey) } };
}

export async function loadLeaderboard(userId: string, courseId: string, now: Date = new Date()): Promise<LeaderboardView> {
  if (!gamificationFeatures().leaderboards) return { status: "disabled" };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leaderboardOptIn: true, gamificationHidden: true },
  });
  if (!user || user.gamificationHidden) return { status: "disabled" };

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { lifecycle: true, status: true, organizationId: true, course: { select: { title: true } } },
  });
  if (!enrollment) throw new NotFoundError("You are not enrolled in this course.");
  const course = { courseId, courseTitle: enrollment.course.title };

  if (enrollment.status === "DROPPED" || !LIVE_LIFECYCLES.has(enrollment.lifecycle)) {
    return { status: "unavailable", reason: "not_active", ...course };
  }
  if (!(await organizationAllowsBoards(prisma, enrollment.organizationId, courseId))) {
    return { status: "unavailable", reason: "organization_disabled", ...course };
  }
  if (!user.leaderboardOptIn) return { status: "opt_in_required", ...course };

  const weekKey = currentLeaderboardWeek(now);
  const board = { courseId, organizationId: enrollment.organizationId, weekKey };
  const weekStart = dateToDayKey(weekKey);
  const lastWeek = { ...board, weekKey: dayKeyToDate(shiftDayKey(weekStart, -7)) };
  await prisma.$transaction((tx) => ensureMembership(tx, { userId, ...board }));

  const [ranked, pastWeeks, winners] = await Promise.all([
    boardStandings(board, userId),
    prisma.xpEntry.groupBy({
      by: ["weekKey"],
      where: { userId, courseId, weekKey: { lt: weekKey } },
      _sum: { amount: true },
    }),
    lastWeekWinners(lastWeek, userId),
  ]);

  const meIndex = Math.max(0, ranked.findIndex((row) => row.userId === userId));
  const entries: LeaderboardEntry[] = ranked
    .map((row, index) => ({ rank: index + 1, name: row.name, xp: row.xp, isYou: row.userId === userId }))
    .slice(Math.max(0, meIndex - LEADERBOARD_NEIGHBOURS), meIndex + LEADERBOARD_NEIGHBOURS + 1);

  return {
    status: "ready",
    ...course,
    weekStart,
    resetsAt: `${shiftDayKey(weekStart, 7)}T00:00:00.000Z`,
    groupSize: ranked.length,
    you: {
      rank: meIndex + 1,
      xp: ranked[meIndex]?.xp ?? 0,
      bestWeekXp: Math.max(0, ...pastWeeks.map((row) => row._sum.amount ?? 0)),
    },
    entries,
    lastWeek: winners,
  };
}

/** A learner the hub boards may list: opted in, showing game elements, with a live enrollment. */
export type ListableLearner = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  leagueTier: LeagueTier;
  createdAt: Date;
  xpTotal: number;
  timezone: string | null;
  streakFreezes: number;
  enrollmentIds: string[];
};

/**
 * Every learner eligible for the global hub boards, with the fields the category builders need.
 * Filters exactly like the per-course board's `listable`: opted in, showing game elements, at
 * least one live enrollment. No role filter — the course board has never had one, and mentors
 * previewing courses opt in through the same preference.
 */
export async function loadListableLearners(db: Tx | typeof prisma = prisma): Promise<ListableLearner[]> {
  const users = await db.user.findMany({
    where: { leaderboardOptIn: true, gamificationHidden: false },
    select: {
      id: true,
      name: true,
      image: true,
      leagueTier: true,
      createdAt: true,
      xpTotal: true,
      streakFreezes: true,
      profile: { select: { timezone: true } },
      enrollments: {
        where: { status: { not: "DROPPED" }, lifecycle: { in: ["ACTIVE", "COMPLETED"] } },
        select: { id: true },
      },
    },
  });
  return users
    .filter((user) => user.enrollments.length > 0)
    .map((user) => ({
      userId: user.id,
      name: leaderboardName(user.name),
      avatarUrl: user.image,
      leagueTier: user.leagueTier,
      createdAt: user.createdAt,
      xpTotal: user.xpTotal,
      timezone: user.profile?.timezone ?? null,
      streakFreezes: user.streakFreezes,
      enrollmentIds: user.enrollments.map((enrollment) => enrollment.id),
    }));
}
