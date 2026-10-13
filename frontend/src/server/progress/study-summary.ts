import "server-only";
import { prisma } from "@/server/db";
import { utcDateOnly } from "./heartbeat";

export async function loadStudyWeek(enrollmentIds: string[]) {
  const today = utcDateOnly();
  const since = new Date(today);
  since.setUTCDate(since.getUTCDate() - 6);

  const rows =
    enrollmentIds.length === 0
      ? []
      : await prisma.dailyActivity.findMany({
          where: { enrollmentId: { in: enrollmentIds }, date: { gte: since } },
          select: { date: true, activeSeconds: true },
        });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const byDay = new Map<string, number>();
  for (const row of rows) {
    const key = row.date.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + row.activeSeconds);
  }

  const week = days.map((day) => ({ day, seconds: byDay.get(day) ?? 0 }));
  const todayKey = today.toISOString().slice(0, 10);
  return {
    todaySeconds: byDay.get(todayKey) ?? 0,
    weekSeconds: week.reduce((sum, day) => sum + day.seconds, 0),
    maxDaySeconds: Math.max(1, ...week.map((day) => day.seconds)),
    week,
  };
}
