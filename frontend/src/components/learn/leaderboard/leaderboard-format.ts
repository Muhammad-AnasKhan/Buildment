const numberFormat = new Intl.NumberFormat();

/** "1,234 XP", "12 chapters", "5-day streak". The server sends the metric label per board. */
export function formatScore(score: number, metricLabel: string): string {
  if (metricLabel === "day streak") return `${score}-day streak`;
  return `${numberFormat.format(score)} ${metricLabel}`;
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** "Ada L." → "AL"; the server only ever sends first name and last initial. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]![0]! : "";
  return (first + last).toUpperCase();
}

export function resetLabel(resetsAt: string): string {
  const ms = Date.parse(resetsAt) - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "Resets soon";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `Resets in ${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return `Resets in ${hours} hour${hours === 1 ? "" : "s"}`;
}
