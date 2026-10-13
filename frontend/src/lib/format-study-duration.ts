export function formatStudyClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatStudyDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatStudyAmount(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  if (totalSeconds < 3600) return `${Math.max(1, Math.round(totalSeconds / 60))}m`;
  return formatStudyHours(totalSeconds);
}

export function formatStudyHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  if (hours < 0.1) return "< 0.1 h";
  return `${hours.toFixed(1)} h`;
}
