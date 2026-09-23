const DAY_MS = 24 * 60 * 60 * 1000;

export function activityState(lastActiveAt: Date | null, now: number, inactiveDays = 7) {
  if (!lastActiveAt) return "never" as const;
  return now - lastActiveAt.getTime() >= inactiveDays * DAY_MS ? "inactive" as const : "recent" as const;
}

export function progressState(status: string, percentComplete: number) {
  if (status === "COMPLETED" || percentComplete >= 100) return "completed" as const;
  if (status === "IN_PROGRESS" || percentComplete > 0) return "in-progress" as const;
  return "not-started" as const;
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function formatLastActive(value: Date | null, now: number) {
  if (!value) return "Not started";
  const minutes = Math.max(0, Math.round((now - value.getTime()) / 60000));
  if (minutes < 2) return "Active just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return value.toLocaleDateString();
}
