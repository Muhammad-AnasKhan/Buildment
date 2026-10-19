import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import type {
  AppActivityDayRow,
  AppActivityOverview,
  AppActivityUsersView,
} from "../../shared/api/activity.js";
import { utcDateOnly } from "../progress/heartbeat.js";

// Admin reports over overall app activity. App time comes from AppActivityDay; study time is read
// from the existing per-enrollment DailyActivity rows and summed per user — it is reported next to
// app time, never added to it (study time is already inside app time).

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

function reportWindow(days: number, now: Date) {
  const to = utcDateOnly(now);
  const from = new Date(to.getTime() - (days - 1) * DAY_MS);
  const keys = Array.from({ length: days }, (_, i) => dayKey(new Date(from.getTime() + i * DAY_MS)));
  return { from, to, keys, range: { gte: from, lte: to } };
}

/**
 * Users who have not been active anywhere in the app since `cutoff`, including those never seen
 * since tracking started. The query a future inactivity reminder would start from.
 */
export function appInactiveSinceWhere(cutoff: Date): Prisma.UserWhereInput {
  return { OR: [{ appActivity: null }, { appActivity: { lastActiveAt: { lt: cutoff } } }] };
}

export async function loadAppActivityOverview(days: number, now: Date = new Date()): Promise<AppActivityOverview> {
  const { from, to, keys, range } = reportWindow(days, now);

  const [appByDay, studyByDay, byUser] = await Promise.all([
    prisma.appActivityDay.groupBy({
      by: ["date"],
      where: { date: range },
      _sum: { activeSeconds: true },
      _count: { _all: true },
    }),
    prisma.dailyActivity.groupBy({
      by: ["date"],
      where: { date: range },
      _sum: { activeSeconds: true },
    }),
    prisma.appActivityDay.groupBy({
      by: ["userId"],
      where: { date: range },
      _count: { _all: true },
    }),
  ]);

  const app = new Map(appByDay.map((row) => [dayKey(row.date), row]));
  const study = new Map(studyByDay.map((row) => [dayKey(row.date), row._sum.activeSeconds ?? 0]));
  const daily = keys.map((date) => ({
    date,
    activeUsers: app.get(date)?._count._all ?? 0,
    appSeconds: app.get(date)?._sum.activeSeconds ?? 0,
    studySeconds: study.get(date) ?? 0,
  }));

  const activeDaysHistogram = Array.from({ length: days }, () => 0);
  for (const row of byUser) activeDaysHistogram[row._count._all - 1] += 1;

  return {
    days,
    from: dayKey(from),
    to: dayKey(to),
    totals: {
      activeUsers: byUser.length,
      appSeconds: daily.reduce((sum, day) => sum + day.appSeconds, 0),
      studySeconds: daily.reduce((sum, day) => sum + day.studySeconds, 0),
    },
    daily,
    activeDaysHistogram,
  };
}

export async function listAppActivityUsers(
  input: { days: number; limit: number; offset: number; inactiveForDays?: number; userId?: string },
  now: Date = new Date()
): Promise<AppActivityUsersView> {
  const { from, to, keys, range } = reportWindow(input.days, now);

  // Default: everyone active in the window, most recent first. With `inactiveForDays`: everyone
  // quiet for at least that long (never-seen users included), longest-quiet first.
  const where: Prisma.UserWhereInput = input.userId
    ? { id: input.userId }
    : input.inactiveForDays
      ? appInactiveSinceWhere(new Date(now.getTime() - input.inactiveForDays * DAY_MS))
      : { appActivityDays: { some: { date: range } } };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ appActivity: { lastActiveAt: input.inactiveForDays ? "asc" : "desc" } }, { id: "asc" }],
      skip: input.offset,
      take: input.limit,
      select: { id: true, email: true, name: true, role: true, appActivity: { select: { lastActiveAt: true } } },
    }),
  ]);

  const ids = users.map((user) => user.id);
  const [appRows, studyRows] =
    ids.length === 0
      ? [[], []]
      : await Promise.all([
          prisma.appActivityDay.findMany({
            where: { userId: { in: ids }, date: range },
            select: { userId: true, date: true, activeSeconds: true },
          }),
          prisma.dailyActivity.findMany({
            where: { date: range, enrollment: { userId: { in: ids } } },
            select: { date: true, activeSeconds: true, enrollment: { select: { userId: true } } },
          }),
        ]);

  const cell = (map: Map<string, number>, userId: string, date: string) => map.get(`${userId}:${date}`) ?? 0;
  const app = new Map<string, number>();
  for (const row of appRows) app.set(`${row.userId}:${dayKey(row.date)}`, row.activeSeconds);
  const study = new Map<string, number>();
  for (const row of studyRows) {
    const key = `${row.enrollment.userId}:${dayKey(row.date)}`;
    study.set(key, (study.get(key) ?? 0) + row.activeSeconds);
  }

  return {
    days: input.days,
    from: dayKey(from),
    to: dayKey(to),
    total,
    users: users.map(({ appActivity, ...user }) => {
      const daily: AppActivityDayRow[] = keys.map((date) => ({
        date,
        appSeconds: cell(app, user.id, date),
        studySeconds: cell(study, user.id, date),
      }));
      return {
        user,
        lastActiveAt: appActivity?.lastActiveAt.toISOString() ?? null,
        activeDays: daily.filter((day) => day.appSeconds > 0).length,
        appSeconds: daily.reduce((sum, day) => sum + day.appSeconds, 0),
        studySeconds: daily.reduce((sum, day) => sum + day.studySeconds, 0),
        daily,
      };
    }),
  };
}
