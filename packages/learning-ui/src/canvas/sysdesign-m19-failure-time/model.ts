// 19.3 beat 1: the data lost is the gap back to the last recovery point; the
// time to recover is copy-back + replay + switch-over. Made-up course numbers:
// 1 TB database, restore at 250 MB/s, 10 minutes to switch the app, replay 10
// times faster than real time, log uploaded every 5 minutes, copy lag 1 s,
// 300 writes a second, 1 minute to promote a copy.

export type Mode = "nightly" | "log" | "copy";

export const DATABASE_MB = 1_000_000;
export const RESTORE_MB_PER_S = 250;
export const SWITCH_MIN = 10;
export const REPLAY_SPEEDUP = 10;
export const LOG_EVERY_MIN = 5;
export const COPY_LAG_S = 1;
export const WRITES_PER_S = 300;
export const PROMOTE_MIN = 1;
export const BACKUP_HOUR = 2;
export const H_MAX = 24;
export const H_STEP = 0.5;
export const DEFAULT_H = 12;

/** 1,000,000 MB at 250 MB/s is 4,000 s, shown as 67 minutes. */
export const COPY_BACK_MIN = Math.round(DATABASE_MB / RESTORE_MB_PER_S / 60);

export type Step = { id: "copy-back" | "replay" | "promote" | "switch"; label: string; minutes: number };

/** Snap a number of hours to the half hour grid, 0 to 24. */
export function snapHours(h: number): number {
  if (!Number.isFinite(h)) return DEFAULT_H;
  return Math.max(0, Math.min(H_MAX, Math.round(h / H_STEP) * H_STEP));
}

/** The recovery steps for a mode when the failure comes h hours after the nightly backup. */
export function stepsFor(mode: Mode, h: number): Step[] {
  if (mode === "copy") {
    return [
      { id: "promote", label: "promote", minutes: PROMOTE_MIN },
      { id: "switch", label: "switch over", minutes: SWITCH_MIN },
    ];
  }
  const steps: Step[] = [{ id: "copy-back", label: "copy back", minutes: COPY_BACK_MIN }];
  if (mode === "log") steps.push({ id: "replay", label: "replay", minutes: Math.round((h * 60) / REPLAY_SPEEDUP) });
  steps.push({ id: "switch", label: "switch over", minutes: SWITCH_MIN });
  return steps;
}

export const recoverMinutes = (mode: Mode, h: number) => stepsFor(mode, h).reduce((s, x) => s + x.minutes, 0);

/** Data lost, in minutes (nightly: everything since the backup; log: at most 5; copy: about a second). */
export function lostMinutes(mode: Mode, h: number): number {
  if (mode === "nightly") return h * 60;
  if (mode === "log") return Math.min(LOG_EVERY_MIN, h * 60);
  return COPY_LAG_S / 60;
}

export const lostWrites = () => WRITES_PER_S * COPY_LAG_S;

/** Hours as "12", "12.5". */
export const formatHours = (h: number) => (Number.isInteger(h) ? String(h) : h.toFixed(1));

/** The clock time of the failure, "14:00", for h hours after the 02:00 backup. */
export function clockTime(h: number): string {
  const total = Math.round((BACKUP_HOUR + h) * 60) % (24 * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(mode: Mode, h: number): Verdict {
  const back = recoverMinutes(mode, h);
  if (mode === "copy") return { text: `1 s lost; back in ${back} min`, tone: "good" };
  if (mode === "log") return { text: `5 min lost at most; back in ${back} min`, tone: "warn" };
  if (h === 0) return { text: `Nothing lost yet; back in ${back} min`, tone: "warn" };
  return { text: `${formatHours(h)} h lost; back in ${back} min`, tone: "bad" };
}
