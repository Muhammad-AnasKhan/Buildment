import { intervalsOverlap, roundUp, trueTimeNow, type TimeInterval, type Trace } from "../sim";

// Spanner-style external consistency, reduced to two transactions.
// Alice removes Bob as a friend (T1, server A), sees "done", then posts a
// photo (T2, server B). Each server's clock is off by up to epsilon. The
// commit timestamp is the latest edge of the server's TrueTime range. With
// commit wait, A does not tell Alice "done" until its earliest possible time
// is past T1's timestamp, so anything Alice does afterwards gets a larger one.

export type ClockErrors = "a-fast" | "exact" | "a-slow";
export type TrueTimeInputs = { epsilonMs: number; gapMs: number; commitWait: boolean; errors: ClockErrors };

export const TRUETIME_BOUNDS = {
  epsilonMs: { min: 0, max: 10, step: 1, default: 4 },
  gapMs: { min: 1, max: 20, step: 1, default: 2 },
} as const;

export const TRUETIME_DEFAULTS: TrueTimeInputs = { epsilonMs: 4, gapMs: 2, commitWait: false, errors: "a-fast" };

/** Clocks stay inside their bound: each is off by 90% of epsilon in the worst case. */
const ERROR_SHARE = 0.9;
/** Late enough that no range (at most 19 ms below its commit) starts before 0 ms. */
export const T1_START = 20;

export type TrueTimeOutcome = {
  inputs: TrueTimeInputs;
  errorA: number;
  errorB: number;
  rangeA: TimeInterval;
  rangeB: TimeInterval;
  s1: number;
  s2: number;
  /** True time at which Alice sees "done" for T1. */
  ackAt: number;
  /** True time at which T2 starts on server B. */
  t2At: number;
  waitMs: number;
  rangesOverlap: boolean;
  /** T2's timestamp is strictly larger than T1's, matching real order. */
  orderCorrect: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
}

export function normaliseTrueTime(inputs: TrueTimeInputs): TrueTimeInputs {
  const b = TRUETIME_BOUNDS;
  return {
    epsilonMs: clamp(Math.round(inputs.epsilonMs), b.epsilonMs.min, b.epsilonMs.max),
    gapMs: clamp(Math.round(inputs.gapMs), b.gapMs.min, b.gapMs.max),
    commitWait: Boolean(inputs.commitWait),
    errors: inputs.errors === "exact" || inputs.errors === "a-slow" ? inputs.errors : "a-fast",
  };
}

export function simulateTrueTime(raw: TrueTimeInputs): TrueTimeOutcome {
  const inputs = normaliseTrueTime(raw);
  const eps = inputs.epsilonMs;
  const sign = inputs.errors === "a-fast" ? 1 : inputs.errors === "a-slow" ? -1 : 0;
  const errorA = round(sign * ERROR_SHARE * eps);
  const errorB = round(-sign * ERROR_SHARE * eps);

  const rangeA = trueTimeNow(T1_START, errorA, eps);
  const s1 = rangeA.latest;
  // Commit wait: wait until A's earliest possible time passes s1.
  // earliest(t) = t + errorA - eps > s1  =>  t > T1_START + 2 * eps.
  // "Done" is drawn at that boundary; the real wait ends just after it.
  const ackAt = inputs.commitWait ? T1_START + 2 * eps : T1_START;
  const t2At = ackAt + inputs.gapMs;
  const rangeB = trueTimeNow(t2At, errorB, eps);
  const s2 = rangeB.latest;

  return {
    inputs,
    errorA,
    errorB,
    rangeA,
    rangeB,
    s1,
    s2,
    ackAt,
    t2At,
    waitMs: ackAt - T1_START,
    rangesOverlap: intervalsOverlap(rangeA, rangeB),
    orderCorrect: s2 > s1,
  };
}

const round = (n: number) => Math.round(n * 10) / 10;
const ms = (n: number) => `${round(n)} ms`;

export function trueTimeTrace(o: TrueTimeOutcome): Trace {
  const eps = o.inputs.epsilonMs;
  const aOff = o.errorA === 0 ? "exactly right" : `${Math.abs(o.errorA)} ms ${o.errorA > 0 ? "fast" : "slow"}`;
  const bOff = o.errorB === 0 ? "exactly right" : `${Math.abs(o.errorB)} ms ${o.errorB > 0 ? "fast" : "slow"}`;
  const end = roundUp(Math.max(o.rangeB.latest, o.ackAt, o.s1) + 4, 10);

  return {
    unit: "ms",
    range: [0, end],
    lanes: [
      { id: "a", label: "Server A", sublabel: "T1: unfriend Bob" },
      { id: "alice", label: "Alice's app" },
      { id: "b", label: "Server B", sublabel: "T2: post photo" },
    ],
    items: [
      { kind: "point", lane: "a", at: T1_START, label: "T1 commits", step: 0 },
      { kind: "span", lane: "a", from: o.rangeA.earliest, to: o.rangeA.latest, label: `A's range ${ms(o.rangeA.earliest)} to ${ms(o.rangeA.latest)}`, step: 1 },
      { kind: "point", lane: "a", at: o.s1, label: `s1 = ${round(o.s1)}`, shape: "diamond", labelRow: 1, step: 2 },
      ...(o.inputs.commitWait
        ? [{ kind: "span" as const, lane: "a", from: T1_START, to: o.ackAt, label: `commit wait ${ms(o.waitMs)}`, tone: "warn" as const, row: 1 as const, step: 3 }]
        : []),
      { kind: "message", from: "a", to: "alice", sentAt: o.ackAt, receivedAt: o.ackAt, label: "", tone: "warn", step: 3 },
      { kind: "point", lane: "alice", at: o.ackAt, label: "sees done", tone: "warn", step: 3 },
      { kind: "message", from: "alice", to: "b", sentAt: o.ackAt, receivedAt: o.t2At, label: "", step: 4 },
      { kind: "point", lane: "b", at: o.t2At, label: "T2 commits", step: 4 },
      { kind: "span", lane: "b", from: o.rangeB.earliest, to: o.rangeB.latest, label: `B's range ${ms(o.rangeB.earliest)} to ${ms(o.rangeB.latest)}`, step: 5 },
      { kind: "point", lane: "b", at: o.s2, label: `s2 = ${round(o.s2)}`, shape: "diamond", labelRow: 1, tone: o.orderCorrect ? "good" : "bad", step: 6 },
    ],
    steps: [
      {
        title: "T1 asks to commit",
        note: `Alice removes Bob from her friends. Server A starts the commit at true time ${ms(T1_START)}. A's clock is ${aOff}, but A cannot know that.`,
      },
      {
        title: "A reads TrueTime",
        note: `TrueTime answers with a range, not one number: earliest ${ms(o.rangeA.earliest)}, latest ${ms(o.rangeA.latest)}. True time is somewhere inside. The range is 2 times epsilon wide (${ms(2 * eps)}).`,
      },
      {
        title: "A picks the timestamp",
        note: `T1's timestamp s1 is the latest edge of the range, ${ms(o.s1)}, so it is never earlier than the real moment of the commit.`,
      },
      o.inputs.commitWait
        ? {
            title: "Commit wait",
            note: `A waits until even its earliest possible time is past s1. That takes 2 times epsilon, ${ms(o.waitMs)}. Only then does Alice see "done".`,
            tone: "warn",
            outcome: `+${ms(o.waitMs)}`,
          }
        : {
            title: "Alice sees done at once",
            note: `With no commit wait, A tells Alice "done" immediately, at true time ${ms(T1_START)}, even though s1 (${ms(o.s1)}) is still in the future by A's own clock.`,
            tone: "warn",
          },
      {
        title: "Alice posts a photo",
        note: `${ms(o.inputs.gapMs)} after she saw "done", Alice posts a photo. It commits on server B at true time ${ms(o.t2At)}. B's clock is ${bOff}.`,
      },
      {
        title: "B reads TrueTime",
        note: `B's range is ${ms(o.rangeB.earliest)} to ${ms(o.rangeB.latest)}. ${o.rangesOverlap ? "It overlaps A's range, so the two clocks alone cannot say which commit came first." : "It does not overlap A's range, so the order is clear from the ranges alone."}`,
      },
      o.orderCorrect
        ? {
            title: "Timestamps match real order",
            note: `s2 (${ms(o.s2)}) is larger than s1 (${ms(o.s1)}). Any reader that sees the photo also sees that Bob was removed.`,
            tone: "good",
            outcome: "s1 < s2",
          }
        : {
            title: "Timestamps disagree with real order",
            note: `s2 (${ms(o.s2)}) is not larger than s1 (${ms(o.s1)}), although T2 happened after T1. A snapshot read at a time between them shows the photo but still shows Bob as a friend, so Bob can see the photo.`,
            tone: "bad",
            outcome: "order broken",
          },
    ],
  };
}

export function describeTrueTimeChange(before: TrueTimeInputs, after: TrueTimeInputs): string {
  const a = simulateTrueTime(before);
  const b = simulateTrueTime(after);
  const what: string[] = [];
  if (a.inputs.epsilonMs !== b.inputs.epsilonMs) what.push(`epsilon from ${a.inputs.epsilonMs} to ${b.inputs.epsilonMs} ms`);
  if (a.inputs.gapMs !== b.inputs.gapMs) what.push(`the gap from ${a.inputs.gapMs} to ${b.inputs.gapMs} ms`);
  if (a.inputs.commitWait !== b.inputs.commitWait) what.push(`commit wait ${b.inputs.commitWait ? "on" : "off"}`);
  if (a.inputs.errors !== b.inputs.errors) what.push("the clock errors");
  if (what.length === 0) return "";
  const order = b.orderCorrect ? "now matches the real order" : "now contradicts the real order";
  const flip = a.orderCorrect !== b.orderCorrect ? ` (it ${a.orderCorrect ? "was correct" : "was broken"} before)` : "";
  const wait = b.inputs.commitWait ? ` T1 pays ${ms(b.waitMs)} of commit wait.` : "";
  return `You changed ${what.join(" and ")}. The timestamp order ${order}${flip}.${wait} The two ranges ${b.rangesOverlap ? "overlap" : "do not overlap"}.`;
}
