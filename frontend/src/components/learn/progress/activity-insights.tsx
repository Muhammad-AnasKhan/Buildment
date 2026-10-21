import type { LearnerProgressCourse } from "@/shared/api/learner";
import { formatStudyAmount } from "@/lib/format-study-duration";

type Day = { day: string; seconds: number };

function dateLabel(day: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, { ...options, timeZone: "UTC" });
}

function aggregateDays(courses: LearnerProgressCourse[]): Day[] {
  if (courses.length === 0) return [];
  const byDay = new Map<string, number>();
  for (const course of courses) {
    for (const day of course.dailyActivity) {
      byDay.set(day.day, (byDay.get(day.day) ?? 0) + day.seconds);
    }
  }
  return [...byDay].sort(([a], [b]) => a.localeCompare(b)).map(([day, seconds]) => ({ day, seconds }));
}

function WeeklyStudyChart({ days }: { days: Day[] }) {
  const chartDays = days.slice(-84);
  const weeks = Array.from({ length: 12 }, (_, index) => {
    const weekDays = chartDays.slice(index * 7, index * 7 + 7);
    return { start: weekDays[0]?.day ?? "", end: weekDays.at(-1)?.day ?? "", seconds: weekDays.reduce((sum, day) => sum + day.seconds, 0) };
  });
  const totalSeconds = weeks.reduce((sum, week) => sum + week.seconds, 0);
  const maxSeconds = Math.max(...weeks.map((week) => week.seconds), 0);
  const scale = maxSeconds > 3600
    ? Math.ceil(maxSeconds / 3600) * 3600
    : maxSeconds > 600
      ? Math.ceil(maxSeconds / 600) * 600
      : Math.max(60, Math.ceil(maxSeconds / 60) * 60);

  return (
    <article className="rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="weekly-study-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 id="weekly-study-heading" className="text-lg font-semibold tracking-tight">Weekly study time</h3>
          <p className="mt-1 text-sm text-muted-foreground">How much time you studied in each 7-day period.</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-semibold tabular-nums">{formatStudyAmount(totalSeconds)}</p>
          <p className="text-xs text-muted-foreground">Total in the last 12 weeks</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
        <div className="flex h-60 flex-col justify-between pb-1 text-right text-xs tabular-nums text-muted-foreground">
          <span>{formatStudyAmount(scale)}</span>
          <span>{formatStudyAmount(scale / 2)}</span>
          <span>0m</span>
        </div>
        <div className="relative h-60 border-b border-border">
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
          <div className="relative flex h-full items-end gap-1.5 px-1 sm:gap-3 sm:px-3">
            {weeks.map((week, index) => {
              const height = week.seconds > 0 ? Math.max(2, (week.seconds / scale) * 85) : 0;
              return (
                <div key={`${week.start}-${index}`} className="flex h-full min-w-0 flex-1 items-end justify-center" title={`${dateLabel(week.start)}–${dateLabel(week.end)}: ${formatStudyAmount(week.seconds)}`}>
                  {week.seconds > 0 ? (
                    <div className="relative w-full max-w-12 rounded-t-md bg-primary/85 transition-colors hover:bg-primary" style={{ height: `${height}%` }}>
                      <span className="absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap text-[11px] font-medium tabular-nums text-foreground sm:block">{formatStudyAmount(week.seconds)}</span>
                    </div>
                  ) : <div className="h-1 w-full max-w-12 rounded-t-sm bg-muted" />}
                </div>
              );
            })}
          </div>
          {totalSeconds === 0 ? <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No study time recorded in this period</p> : null}
        </div>
      </div>
      <div className="ml-[4.25rem] flex gap-1.5 px-1 pt-3 sm:gap-3 sm:px-3">
        {weeks.map((week, index) => (
          <span key={`${week.start}-${index}`} className="min-w-0 flex-1 text-center text-[10px] text-muted-foreground sm:text-xs">
            {index % 3 === 0 || index === 11 ? dateLabel(week.start) : ""}
          </span>
        ))}
      </div>
      <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">The most recent bar includes today. Time is estimated from active study sessions.</p>
    </article>
  );
}

function RecentStudyDays({ days }: { days: Day[] }) {
  const week = days.slice(-7);
  const activeDays = week.filter((day) => day.seconds > 0).length;
  const totalSeconds = week.reduce((sum, day) => sum + day.seconds, 0);
  const bestDay = week.reduce<Day | null>((best, day) => day.seconds > (best?.seconds ?? 0) ? day : best, null);
  const maxSeconds = Math.max(...week.map((day) => day.seconds), 1);

  return (
    <article className="rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="recent-study-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 id="recent-study-heading" className="text-lg font-semibold tracking-tight">Your last 7 days</h3>
          <p className="mt-1 text-sm text-muted-foreground">Daily study time, so you can spot your learning rhythm.</p>
        </div>
        <span className="rounded-full border bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">Includes today</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="space-y-3">
          {week.map((day) => {
            const date = new Date(`${day.day}T00:00:00Z`);
            const weekday = date.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" });
            const width = day.seconds > 0 ? Math.max(4, (day.seconds / maxSeconds) * 100) : 0;
            return (
              <div key={day.day} className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm">
                <span className="tabular-nums text-muted-foreground">{weekday} <span className="text-xs">{dateLabel(day.day, { day: "numeric" })}</span></span>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="meter" aria-label={`${dateLabel(day.day)} study time`} aria-valuenow={day.seconds} aria-valuemin={0} aria-valuemax={maxSeconds}>
                  {day.seconds > 0 ? <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} /> : null}
                </div>
                <span className="text-right text-xs font-medium tabular-nums">{day.seconds > 0 ? formatStudyAmount(day.seconds) : "—"}</span>
              </div>
            );
          })}
        </div>
        <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/20 p-4 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:p-5">
          <div className="min-w-0 lg:pb-4"><dt className="text-xs text-muted-foreground">Active days</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{activeDays}<span className="text-xs font-normal text-muted-foreground"> / 7</span></dd></div>
          <div className="min-w-0 lg:py-4"><dt className="text-xs text-muted-foreground">Time studied</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{formatStudyAmount(totalSeconds)}</dd></div>
          <div className="min-w-0 lg:pt-4"><dt className="text-xs text-muted-foreground">Most active day</dt><dd className="mt-1 text-sm font-semibold">{bestDay ? `${dateLabel(bestDay.day)} · ${formatStudyAmount(bestDay.seconds)}` : "No activity yet"}</dd></div>
        </dl>
      </div>
    </article>
  );
}

export function ActivityInsights({ courses }: { courses: LearnerProgressCourse[] }) {
  const days = aggregateDays(courses);
  if (days.length === 0) return null;

  return (
    <section className="mt-10 space-y-5" aria-labelledby="activity-insights-heading">
      <div>
        <h2 id="activity-insights-heading" className="text-xl font-semibold tracking-tight">Study activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your learning time across the selected {courses.length === 1 ? "course" : "courses"}.</p>
      </div>
      <WeeklyStudyChart days={days} />
      <RecentStudyDays days={days} />
    </section>
  );
}
