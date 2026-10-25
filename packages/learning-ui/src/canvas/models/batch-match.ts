// 24.4 beat 5 "Match together, not one by one". Two riders and two drivers on a
// straight road. Pure functions, no React. All distances are kept in tenths of
// a kilometre (whole numbers), so the sums never carry float noise.
//
//   Rider A at 0 km, Rider B at 1.0 km, Driver 2 at -0.5 km,
//   Driver 1 anywhere from 0.1 to 0.9 km (default 0.4).
//   One by one: A takes the nearer driver (a tie goes to Driver 1), B gets the other.
//   Together:   the smaller total of the two possible pairings.

export const RIDER_A = 0;
export const RIDER_B = 10;
export const DRIVER_2 = -5;
export const D1_MIN = 1;
export const D1_MAX = 9;
export const D1_DEFAULT = 4;
export const SPEED_KMH = 30;

export type Mode = "one" | "together";

export type Pair = { rider: "A" | "B"; driver: 1 | 2; tenths: number };

export type Matching = { pairs: [Pair, Pair]; totalTenths: number };

const gap = (a: number, b: number) => Math.abs(a - b);

function pairing(d1: number, a: 1 | 2): Matching {
  const b: 1 | 2 = a === 1 ? 2 : 1;
  const at = (n: 1 | 2) => (n === 1 ? d1 : DRIVER_2);
  const pa: Pair = { rider: "A", driver: a, tenths: gap(RIDER_A, at(a)) };
  const pb: Pair = { rider: "B", driver: b, tenths: gap(RIDER_B, at(b)) };
  return { pairs: [pa, pb], totalTenths: pa.tenths + pb.tenths };
}

/** A takes the nearer driver (a tie goes to Driver 1); B gets what is left. */
export function oneByOne(d1: number): Matching {
  return pairing(d1, gap(RIDER_A, d1) <= gap(RIDER_A, DRIVER_2) ? 1 : 2);
}

/** The pairing with the smaller total (a tie keeps A with Driver 1). */
export function together(d1: number): Matching {
  const x = pairing(d1, 1);
  const y = pairing(d1, 2);
  return y.totalTenths < x.totalTenths ? y : x;
}

export type Result = { one: Matching; both: Matching; savedTenths: number };

export function match(d1: number): Result {
  const one = oneByOne(d1);
  const both = together(d1);
  return { one, both, savedTenths: one.totalTenths - both.totalTenths };
}

export const kmText = (tenths: number) => `${(tenths / 10).toFixed(1)} km`;

/** Minutes of driving for a distance at 30 km/h: tenths of a km / 10 / 30 * 60. */
export const minutesText = (tenths: number) => `${(tenths / 5).toFixed(1)} min`;

export type Verdict = { text: string; tone: "good" | "bad" };

/** At most 38 characters; the number follows the model. */
export function matchVerdict(r: Result, mode: Mode): Verdict {
  if (r.savedTenths === 0) return { text: "Same pairing either way", tone: "good" };
  if (mode === "one") return { text: `One by one wastes ${kmText(r.savedTenths)}`, tone: "bad" };
  return { text: `Together: ${kmText(r.both.totalTenths)} in total`, tone: "good" };
}

/** The small chip with the saving, for the mode shown. */
export function savingText(r: Result, mode: Mode): string {
  if (r.savedTenths === 0) return "No saving here";
  const tail = `${kmText(r.savedTenths)}${mode === "one" ? "" : " saved"}, ${minutesText(r.savedTenths)}`;
  return mode === "one" ? `Together saves ${tail}` : tail;
}

export function valueText(d1: number, r: Result): string {
  return `Driver 1 at ${(d1 / 10).toFixed(1)} km, one by one ${kmText(r.one.totalTenths)}, together ${kmText(r.both.totalTenths)}`;
}

/** The matching drawn for a mode. */
export const shown = (r: Result, mode: Mode): Matching => (mode === "one" ? r.one : r.both);

// ---------- Cars driving to their riders ----------

/** Kilometres a second a car travels in the picture (the road time is 30 km/h; the picture is quicker). */
export const DRIVE_SPEED = 0.35;
const HOLD = 1.4;
const WAIT = 0.3;

/**
 * How far each paired car has driven toward its rider, 0 to 1, at a moment of
 * the loop. One by one: the first pair drives, then the second. Together: both
 * drive at once. The loop opens on the arrived picture, so a paused clock
 * still shows the pairings made.
 */
export function tripProgress(seconds: number, mode: Mode, m: Matching): [number, number] {
  const dur = m.pairs.map((p) => Math.max(0.4, p.tenths / 10 / DRIVE_SPEED));
  const starts = mode === "one" ? [0, dur[0] + WAIT] : [0, 0];
  const total = mode === "one" ? starts[1] + dur[1] : Math.max(dur[0], dur[1]);
  const cycle = total + HOLD;
  const t = (Math.max(0, seconds) + total) % cycle;
  const at = (i: number) => (t >= total ? 1 : Math.max(0, Math.min(1, (t - starts[i]) / dur[i])));
  return [at(0), at(1)];
}
