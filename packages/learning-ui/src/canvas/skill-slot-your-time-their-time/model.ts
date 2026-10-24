export type ProviderZone = "Europe/Berlin" | "Asia/Gaza";
export type ViewerZone = "Asia/Qatar" | "Europe/Berlin" | "Europe/London";
export type Week = "2024-03-25" | "2024-04-01";
export type TimeInputs = { providerZone: ProviderZone; viewerZone: ViewerZone; week: Week };

export const initialTimeInputs: TimeInputs = {
  providerZone: "Europe/Berlin",
  viewerZone: "Asia/Qatar",
  week: "2024-03-25",
};

function clockParts(instant: Date, zone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(instant);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute") };
}

/** Resolve a fixed Monday 09:00 local rule. These dates/zones have no 09:00 ambiguity. */
export function resolveMondayNine(week: Week, zone: ProviderZone): Date {
  const [year, month, day] = week.split("-").map(Number);
  const wanted = Date.UTC(year, month - 1, day, 9);
  let estimate = wanted;
  // Translate a candidate UTC instant to local parts, then correct the delta.
  // Two iterations cover offsets and daylight-saving changes near these weeks.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = clockParts(new Date(estimate), zone);
    const shownAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
    const difference = wanted - shownAsUtc;
    if (difference === 0) break;
    estimate += difference;
  }
  const result = new Date(estimate);
  const check = clockParts(result, zone);
  if (check.year !== year || check.month !== month || check.day !== day || check.hour !== 9 || check.minute !== 0) {
    throw new Error("Selected local time could not be resolved");
  }
  return result;
}

export function localLabel(instant: Date, zone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, weekday: "short", day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(instant);
}

export function timeComparison(inputs: TimeInputs) {
  const instant = resolveMondayNine(inputs.week, inputs.providerZone);
  return {
    provider: localLabel(instant, inputs.providerZone),
    utc: instant.toISOString(),
    viewer: localLabel(instant, inputs.viewerZone),
  };
}
