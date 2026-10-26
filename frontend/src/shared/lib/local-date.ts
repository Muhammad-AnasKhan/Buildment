// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
// Calendar days in the learner's own timezone. Streaks, daily caps and weekly goals count the
// learner's day, so studying at 1 AM in Karachi is "today" there, not yesterday in UTC.
// Day keys are ISO dates ("2026-10-23"); an unknown or malformed timezone falls back to UTC.

const DAY_MS = 24 * 60 * 60 * 1000;
const formatters = new Map<string, Intl.DateTimeFormat>();

/** The timezone if the runtime knows it, else "UTC". Profile timezones are free text. */
export function safeTimeZone(timeZone: string | null | undefined): string {
  if (!timeZone) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(0);
    return timeZone;
  } catch {
    return "UTC";
  }
}

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** The learner's calendar day at `instant`, as "YYYY-MM-DD". */
export function localDayKey(instant: Date, timeZone: string | null | undefined): string {
  const parts = formatterFor(safeTimeZone(timeZone)).formatToParts(instant);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** A day key as the UTC-midnight Date Prisma stores in `@db.Date` columns. */
export function dayKeyToDate(dayKey: string): Date {
  return new Date(`${dayKey}T00:00:00.000Z`);
}

export function dateToDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function shiftDayKey(dayKey: string, days: number): string {
  return dateToDayKey(new Date(dayKeyToDate(dayKey).getTime() + days * DAY_MS));
}

/** Monday of the week that contains `dayKey`. */
export function weekStartKey(dayKey: string): string {
  const weekday = dayKeyToDate(dayKey).getUTCDay(); // 0 = Sunday
  return shiftDayKey(dayKey, -((weekday + 6) % 7));
}

/** The instant the learner's `dayKey` begins, for querying timestamps by local day. */
export function startOfLocalDay(dayKey: string, timeZone: string | null | undefined): Date {
  const zone = safeTimeZone(timeZone);
  const utcMidnight = dayKeyToDate(dayKey).getTime();
  // The zone's offset can differ across the day (DST), so settle it with two passes.
  let guess = utcMidnight;
  for (let pass = 0; pass < 2; pass += 1) {
    guess = utcMidnight - offsetMs(new Date(guess), zone);
  }
  return new Date(guess);
}

function offsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const value = (type: string) => Number(parts.find((item) => item.type === type)?.value ?? 0);
  const asUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}
