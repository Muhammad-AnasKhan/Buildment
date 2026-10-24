// 12.2 beat 2: a monitor suspects a node when the gap between two beats is
// longer than the timeout T. A node sends a beat every 1,000 ms; a beat takes
// 10 ms plus a random extra with a mean of 30 ms (exponential). The gap is the
// interval plus the difference of two delays, which is Laplace with scale
// 30 ms. Pure model, no React.

import { seededRandom } from "../sim/random";
import { snapTo, withCommas } from "./picture-controls";

export const BEAT_MS = 1000;
export const BASE_DELAY_MS = 10;
export const MEAN_EXTRA_MS = 30;

export const TIMEOUT = { min: 900, max: 2000, step: 10, page: 100, default: 1100 } as const;
export const TIMEOUT_SNAPS = [900, 1000, 1050, 1100, 1150, 1200, 1300, 1500, 2000] as const;
/** Every rung of the rail, so arrow keys step 10 ms and Page keys step 100 ms. */
export const TIMEOUT_LADDER: readonly number[] = Array.from({ length: (TIMEOUT.max - TIMEOUT.min) / TIMEOUT.step + 1 }, (_, i) => TIMEOUT.min + i * TIMEOUT.step);

/** How many beat gaps the strip draws, and the seed that fixes them. */
export const GAP_COUNT = 40;
export const SEED = 7;
/** A fixed alarm threshold for the verdict. */
export const BAD_PER_HOUR = 10;
export const WARN_PER_HOUR = 0.5;

/** Chance that one gap is longer than T. */
export function falseAlarmChance(timeoutMs: number): number {
  const d = timeoutMs - BEAT_MS;
  return d >= 0 ? 0.5 * Math.exp(-d / MEAN_EXTRA_MS) : 1 - 0.5 * Math.exp(d / MEAN_EXTRA_MS);
}

/** False alarms in an hour of beats, one beat a second. */
export function falseAlarmsPerHour(timeoutMs: number): number {
  return 3600 * falseAlarmChance(timeoutMs);
}

/** Average time to notice a real crash: T minus half a beat, plus the 10 + 30 ms of delay. */
export function noticeAfterMs(timeoutMs: number): number {
  return timeoutMs - BEAT_MS / 2 + (BASE_DELAY_MS + MEAN_EXTRA_MS);
}

/** The timeout rail position, 0 to 1. */
export function timeoutToFraction(t: number): number {
  return (Math.max(TIMEOUT.min, Math.min(TIMEOUT.max, t)) - TIMEOUT.min) / (TIMEOUT.max - TIMEOUT.min);
}

/** The timeout for a rail position: whole steps, pulled onto a snap point when close. */
export function timeoutFromFraction(f: number): number {
  const clamped = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
  const raw = TIMEOUT.min + clamped * (TIMEOUT.max - TIMEOUT.min);
  const stepped = Math.round(raw / TIMEOUT.step) * TIMEOUT.step;
  return Math.max(TIMEOUT.min, Math.min(TIMEOUT.max, snapTo(stepped, TIMEOUT_SNAPS, 10)));
}

let cached: readonly number[] | null = null;

/** The 40 gaps between beat arrivals, in ms: 1,000 plus the difference of two seeded delays. */
export function beatGaps(): readonly number[] {
  if (cached) return cached;
  const rnd = seededRandom(SEED);
  const delay = () => BASE_DELAY_MS - MEAN_EXTRA_MS * Math.log(1 - rnd.next());
  let prev = delay();
  const gaps: number[] = [];
  for (let i = 0; i < GAP_COUNT; i++) {
    const next = delay();
    gaps.push(Math.round((BEAT_MS + next - prev) * 10) / 10);
    prev = next;
  }
  cached = gaps;
  return gaps;
}

/** How many of the drawn gaps are longer than the timeout. */
export function lateGaps(timeoutMs: number): number {
  return beatGaps().filter((g) => g > timeoutMs).length;
}

/** The false-alarm count as words and digits: whole numbers from 10 up, then finer. */
export function formatAlarms(perHour: number): string {
  if (!(perHour > 0.00005)) return "0";
  if (perHour >= 10) return withCommas(perHour);
  if (perHour >= 1) return perHour.toFixed(1);
  if (perHour >= 0.01) return perHour.toFixed(2);
  return perHour.toFixed(4).replace(/0+$/, "");
}

export function formatMs(ms: number): string {
  return `${withCommas(ms)} ms`;
}

export type TimeoutVerdict = { text: string; tone: "good" | "warn" | "bad" };

/** The banner, 38 characters or fewer. */
export function timeoutVerdict(timeoutMs: number): TimeoutVerdict {
  const perHour = falseAlarmsPerHour(timeoutMs);
  if (perHour >= BAD_PER_HOUR) return { text: `${withCommas(perHour)} false alarms an hour`, tone: "bad" };
  if (perHour >= WARN_PER_HOUR) return { text: `About ${Math.round(perHour)} false alarms an hour`, tone: "warn" };
  return { text: `Calm: a crash is seen in ${withCommas(noticeAfterMs(timeoutMs))} ms`, tone: "good" };
}

/** The slider's spoken value. */
export function timeoutValueText(timeoutMs: number): string {
  const perHour = falseAlarmsPerHour(timeoutMs);
  const shown = perHour >= 10 ? withCommas(perHour) : formatAlarms(perHour);
  return `timeout ${formatMs(timeoutMs)}, ${shown} false alarms an hour, a crash seen after ${formatMs(noticeAfterMs(timeoutMs))}`;
}
