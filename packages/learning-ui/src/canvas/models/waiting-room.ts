import { withCommas } from "./picture-controls";
import { flowRate } from "./envelope-estimate";

// 25.2 "Let fans in at a steady rate". The waiting room admits fans at a
// steady rate; the seat store sees only the admitted fans. Pure functions.
//
//   fans inside    = admit rate x 120 s            (Little's law, L = lambda W)
//   store load     = admit rate x 4 requests       (requests a second)
//   times its plan = load / 5,000
//   sell-out time  = 20,000 seats / (admit rate x 50% who buy)

export const ADMIT_STOPS = [10, 33, 100, 167, 500, 1_250, 5_000, 20_000] as const;
export const DEFAULT_ADMIT = 167;

export const FANS = 400_000;
export const SEATS = 20_000;
export const SECONDS_INSIDE = 120;
export const REQUESTS_PER_ADMITTED = 4;
export const STORE_PLAN = 5_000;
export const BUY_PERCENT = 50;
/** Sell-outs slower than this (in seconds) count as slow. */
export const SLOW_SELL_OUT = 600;

/** How fast the picture runs: 20 seconds of the sale for each second on screen. */
export const SALE_SPEED = 20;
/** The seconds of the sale one loop of the picture covers (4 minutes). */
export const SALE_SHOWN = 240;

export type RoomResult = {
  admit: number;
  inside: number;
  load: number;
  /** load / plan, so 1 means exactly on plan. */
  timesPlan: number;
  /** Seconds to sell every seat. */
  sellOut: number;
};

export function waitingRoom(admit: number): RoomResult {
  const a = Number.isFinite(admit) ? Math.max(0, admit) : 0;
  const load = a * REQUESTS_PER_ADMITTED;
  const buyers = (a * BUY_PERCENT) / 100;
  return {
    admit: a,
    inside: a * SECONDS_INSIDE,
    load,
    timesPlan: load / STORE_PLAN,
    sellOut: buyers > 0 ? SEATS / buyers : Infinity,
  };
}

/** Fans admitted by `seconds` after the doors open, never more than it takes to sell out. */
export function admittedBy(r: RoomResult, seconds: number): number {
  const cap = Number.isFinite(r.sellOut) ? r.sellOut : seconds;
  return r.admit * Math.max(0, Math.min(seconds, cap));
}

/** Share of seats sold (0 to 1) after `seconds`. */
export function soldBy(r: RoomResult, seconds: number): number {
  if (!Number.isFinite(r.sellOut) || r.sellOut <= 0) return 0;
  return Math.max(0, Math.min(1, seconds / r.sellOut));
}

/** Sell-out time in short words: seconds below 90 s, otherwise whole minutes. */
export function sellOutText(seconds: number): string {
  if (!Number.isFinite(seconds)) return "never";
  return seconds < 90 ? `${Math.round(seconds)} s` : `${Math.round(seconds / 60)} min`;
}

/** The same, spoken: "4 minutes", "80 seconds". */
export function sellOutWords(seconds: number): string {
  if (!Number.isFinite(seconds)) return "never";
  if (seconds < 90) {
    const n = Math.round(seconds);
    return `${n} ${n === 1 ? "second" : "seconds"}`;
  }
  const n = Math.round(seconds / 60);
  return `${n} ${n === 1 ? "minute" : "minutes"}`;
}

/** "4", "16", "2.5": one decimal below 10, whole at 10 and above. */
export function timesText(n: number): string {
  if (n >= 10) return String(Math.round(n));
  return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");
}

/** Share of plan in percent, one decimal below 10: "0.8", "13", "100". */
export const planPercentText = (timesPlan: number) => timesText(timesPlan * 100);

export type RoomVerdict = { text: string; tone: "good" | "warn" | "bad" };

/** At most 38 characters. */
export function roomVerdict(r: RoomResult): RoomVerdict {
  if (r.timesPlan > 1) return { text: `Store at ${timesText(r.timesPlan)}x its plan`, tone: "bad" };
  if (r.sellOut > SLOW_SELL_OUT) return { text: `Safe but slow: sold out in ${sellOutText(r.sellOut)}`, tone: "warn" };
  return { text: `Within plan: sold out in ${sellOutText(r.sellOut)}`, tone: "good" };
}

/** The pill on the Seat store card: "13% of plan", "16x plan". */
export function planPill(r: RoomResult): string {
  return r.timesPlan > 1 ? `${timesText(r.timesPlan)}x plan` : `${planPercentText(r.timesPlan)}% of plan`;
}

export const insidePill = (r: RoomResult) => `${withCommas(r.inside)} inside`;

export function roomValueText(r: RoomResult): string {
  return `${withCommas(r.admit)} fans a second, ${withCommas(r.inside)} inside, store at ${planPercentText(r.timesPlan)} percent of plan, sold out in ${sellOutWords(r.sellOut)}`;
}

/** Dots a second on the lanes, set by the store's load against its plan. */
export const roomFlow = (r: RoomResult) => flowRate(r.timesPlan);

/** How many of `dots` stay in the line outside once `admitted` of the 400,000 fans are in. */
export function lineDots(admitted: number, dots: number): number {
  const left = Math.max(0, 1 - admitted / FANS);
  return Math.max(0, Math.min(dots, Math.round(left * dots)));
}

/** Position 0 to 1 of a value on a log gauge between `lo` and `hi`. */
export function logFraction(value: number, lo: number, hi: number): number {
  if (!(value > 0)) return 0;
  const f = (Math.log10(value) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo));
  return Math.max(0, Math.min(1, f));
}
