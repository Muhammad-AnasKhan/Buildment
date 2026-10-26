// Small pure helpers shared by the Listen player and its tests.

export const NARRATION_SPEEDS = [1, 1.25, 1.5, 0.85] as const;

export function nextSpeed(current: number): number {
  const index = NARRATION_SPEEDS.indexOf(current as (typeof NARRATION_SPEEDS)[number]);
  return NARRATION_SPEEDS[(index + 1) % NARRATION_SPEEDS.length]!;
}

export function formatSpeed(speed: number): string {
  return `${speed}x`;
}

/** "4 min" for the label; never shows "0 min" for a short clip. */
export function formatListenMinutes(minutes: number): string {
  return `${Math.max(1, Math.round(minutes))} min`;
}

/** Download size shown next to the player, so people on metered data can decide. */
export function formatMegabytes(bytes: number): string {
  const megabytes = bytes / 1024 / 1024;
  return `${megabytes < 10 ? megabytes.toFixed(1) : Math.round(megabytes)} MB`;
}

/** "1:05" for the running clock. */
export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/** Where to resume: not at the very start (nothing to resume) and not in the last seconds (it was finished). */
export function resumePosition(saved: number, duration: number): number {
  if (!Number.isFinite(saved) || !Number.isFinite(duration) || duration <= 0) return 0;
  return saved > 3 && saved < duration - 3 ? saved : 0;
}
