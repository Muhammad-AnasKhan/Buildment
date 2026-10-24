// 18.5 beat 2: a commit goes through six stages. A red stage stops the pipeline
// and every later stage is skipped, so the cost of a failure is the time up to
// the red stage. Times are from challenge 17 on a laptop with a cold cache
// (lint to size gate); publish is illustrative. Kept in tenths of a second.
// "On a shared runner" multiplies every time by 10.

export type Scale = "laptop" | "runner";
export const RUNNER_FACTOR = 10;

export type Stage = {
  id: string;
  name: string;
  /** A short name for the verdict banner. */
  short: string;
  /** Laptop time in tenths of a second. */
  tenths: number;
};

export const STAGES: readonly Stage[] = [
  { id: "lint", name: "Lint", short: "lint", tenths: 2 },
  { id: "tests", name: "Service tests", short: "tests", tenths: 28 },
  { id: "build", name: "Build image", short: "build", tenths: 380 },
  { id: "smoke", name: "Smoke test", short: "smoke", tenths: 64 },
  { id: "size", name: "Size gate", short: "size gate", tenths: 10 },
  { id: "publish", name: "Publish image", short: "publish", tenths: 20 },
];
export const STAGE_COUNT = STAGES.length;

export type Status = "pass" | "fail" | "skipped" | "pending";

/** The first broken stage, or -1. */
export const firstRed = (broken: readonly boolean[]) => broken.findIndex(Boolean);

/** The red stage the commit has reached (so the pipeline has stopped), or -1. */
export function stopIndex(at: number, broken: readonly boolean[]): number {
  const red = firstRed(broken);
  return red !== -1 && red < at ? red : -1;
}

/** `at` is how many stages the commit has been through (0 to 6). */
export function statusesOf(at: number, broken: readonly boolean[]): Status[] {
  const stop = stopIndex(at, broken);
  return STAGES.map((_, i) => {
    if (stop !== -1) return i < stop ? "pass" : i === stop ? "fail" : "skipped";
    return i < at ? "pass" : "pending";
  });
}

export const isFinished = (at: number, broken: readonly boolean[]) => stopIndex(at, broken) !== -1 || at >= STAGE_COUNT;

/** Sum of the stage times (tenths, laptop) up to and including the first red stage, or all of them. */
export function knownTenths(broken: readonly boolean[]): number {
  const red = firstRed(broken);
  const end = red === -1 ? STAGE_COUNT : red + 1;
  return STAGES.slice(0, end).reduce((sum, s) => sum + s.tenths, 0);
}

/** Time the commit has waited so far, in laptop tenths. */
export function elapsedTenths(at: number, broken: readonly boolean[]): number {
  const stop = stopIndex(at, broken);
  const end = stop !== -1 ? stop + 1 : Math.min(at, STAGE_COUNT);
  return STAGES.slice(0, end).reduce((sum, s) => sum + s.tenths, 0);
}

/** Where the commit token sits: -1 at the start, otherwise the last stage it went through. */
export function tokenSlot(at: number, broken: readonly boolean[]): number {
  const stop = stopIndex(at, broken);
  if (stop !== -1) return stop;
  return Math.min(at, STAGE_COUNT) - 1;
}

/** The next value of `at` for the Step button: one stage on, or back to the start once the run is over. */
export const nextAt = (at: number, broken: readonly boolean[]) => (isFinished(at, broken) ? 0 : at + 1);

/** A time in laptop tenths, as shown: "47.4 s" on a laptop, "7 min 54 s" on a shared runner. */
export function formatTime(tenths: number, scale: Scale): string {
  if (scale === "laptop") return `${(tenths / 10).toFixed(1)} s`;
  const seconds = Math.round((tenths * RUNNER_FACTOR) / 10);
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(at: number, broken: readonly boolean[], scale: Scale): Verdict {
  const stop = stopIndex(at, broken);
  if (stop === 0) return { text: "Cheap check first: known at once", tone: "bad" };
  if (stop > 0) return { text: `Red at ${STAGES[stop].short}: known in ${formatTime(elapsedTenths(at, broken), scale)}`, tone: "bad" };
  if (at >= STAGE_COUNT) return { text: "All gates passed: ready to ship", tone: "good" };
  if (at === 0) return { text: "Commit waiting: press Step to begin", tone: "accent" };
  return { text: `Passed ${at} of ${STAGE_COUNT} stages so far`, tone: "accent" };
}
