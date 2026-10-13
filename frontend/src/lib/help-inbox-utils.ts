export const AGING_HOURS = 48;

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ageHoursFrom(sinceMs: number, nowMs: number) {
  return (nowMs - sinceMs) / (1000 * 60 * 60);
}

export function formatWaitingBadge(ageHours: number) {
  if (ageHours >= 24) {
    return `${Math.floor(ageHours / 24)}d waiting`;
  }
  return `${Math.floor(ageHours)}h waiting`;
}

export function isAgingOpenRequest(ageHours: number, status: "OPEN" | "RESOLVED") {
  return status === "OPEN" && ageHours >= AGING_HOURS;
}
