// Two writers update one row (chapter 7.5). Writer A starts at t = 0 and
// writer B at t = 2 ms. A read takes 1 ms, a write 1 ms, and both think for the
// same T ms between them. Three rules decide what happens when they meet:
// nothing, a row lock, or a version check (compare-and-set). Times are made
// up. Pure, so the worked values in the chapter are tested.

export type Strategy = "none" | "lock" | "version";

export const STRATEGIES: readonly { id: Strategy; label: string }[] = [
  { id: "none", label: "Nothing" },
  { id: "lock", label: "Row lock" },
  { id: "version", label: "Version check" },
];

export const THINK_LADDER = [0, 10, 25, 50, 100] as const;
export const DEFAULT_THINK = 25;
export const READ_MS = 1;
export const WRITE_MS = 1;
export const B_STARTS = 2;
export const START_VALUE = 100;
export const A_ADDS = 50;
export const B_ADDS = 30;

export type SegKind = "read" | "think" | "write" | "wait" | "refused";
export type Seg = { kind: SegKind; from: number; to: number };
export type RowChange = { at: number; value: number; lost: boolean };

export type Run = {
  strategy: Strategy;
  think: number;
  a: Seg[];
  b: Seg[];
  /** The row's value over time, starting with 100 at t = 0. */
  row: RowChange[];
  lostUpdates: number;
  retries: number;
  /** When the last writer finishes, in ms. */
  finish: number;
  /** Time B spends waiting for a lock, in ms. */
  waited: number;
  /** Think time B throws away on a refused write, in ms. */
  wasted: number;
  /** The end of the time axis, in ms. */
  domain: number;
  verdict: { text: string; tone: "good" | "accent" | "warn" | "bad" };
};

const seg = (kind: SegKind, from: number, to: number): Seg => ({ kind, from, to });

/** Read, think, write from time t. Think is left out when it is zero. */
function cycle(t: number, think: number): Seg[] {
  const out: Seg[] = [seg("read", t, t + READ_MS)];
  let at = t + READ_MS;
  if (think > 0) {
    out.push(seg("think", at, at + think));
    at += think;
  }
  out.push(seg("write", at, at + WRITE_MS));
  return out;
}

export function run(strategy: Strategy, think: number): Run {
  const T = Math.max(0, think);
  const a = cycle(0, T);
  const aDone = 2 + T;
  const domain = 6 + 2 * T;
  const row: RowChange[] = [
    { at: 0, value: START_VALUE, lost: false },
    { at: aDone, value: START_VALUE + A_ADDS, lost: false },
  ];
  let b: Seg[];
  let lostUpdates = 0;
  let retries = 0;
  let waited = 0;
  let wasted = 0;
  let finish: number;
  let verdict: Run["verdict"];

  if (strategy === "none") {
    b = cycle(B_STARTS, T);
    finish = B_STARTS + 2 + T;
    if (T > 0) {
      // B read 100 before A's write landed, so its write is based on an old read.
      lostUpdates = 1;
      row.push({ at: finish, value: START_VALUE + B_ADDS, lost: true });
      verdict = { text: "One update lost", tone: "bad" };
    } else {
      row.push({ at: finish, value: START_VALUE + A_ADDS + B_ADDS, lost: false });
      verdict = { text: "No overlap, no loss (this time)", tone: "accent" };
    }
  } else if (strategy === "lock") {
    waited = T;
    b = [...(T > 0 ? [seg("wait", B_STARTS, B_STARTS + T)] : []), ...cycle(B_STARTS + T, T)];
    finish = B_STARTS + T + 2 + T;
    row.push({ at: finish, value: START_VALUE + A_ADDS + B_ADDS, lost: false });
    verdict = T > 0 ? { text: "B waited, nothing lost", tone: "good" } : { text: "No wait, nothing lost", tone: "good" };
  } else if (T > 0) {
    // B's compare-and-set at 3 + T finds A's newer version, so B starts again.
    retries = 1;
    wasted = T;
    const refusedAt = B_STARTS + READ_MS + T;
    b = [seg("read", B_STARTS, B_STARTS + READ_MS), seg("think", B_STARTS + READ_MS, refusedAt), seg("refused", refusedAt, refusedAt), ...cycle(refusedAt, T)];
    finish = refusedAt + 2 + T;
    row.push({ at: finish, value: START_VALUE + A_ADDS + B_ADDS, lost: false });
    verdict = { text: "B repeated its work, nothing lost", tone: "warn" };
  } else {
    // B's read at t = 2 already sees A's commit.
    b = cycle(B_STARTS, T);
    finish = B_STARTS + 2;
    row.push({ at: finish, value: START_VALUE + A_ADDS + B_ADDS, lost: false });
    verdict = { text: "No collision, no retry", tone: "good" };
  }
  return { strategy, think: T, a, b, row, lostUpdates, retries, finish, waited, wasted, domain, verdict };
}

/** Round tick values for an axis from 0 to `max`, at most about six. */
export function niceTicks(max: number): number[] {
  const steps = [1, 2, 5, 10, 20, 50, 100, 200];
  const step = steps.find((s) => max / s <= 6) ?? 200;
  const out: number[] = [];
  for (let t = 0; t <= max + 1e-9; t += step) out.push(t);
  return out;
}

export const thinkFromFraction = (f: number): number => THINK_LADDER[Math.round(Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0)) * (THINK_LADDER.length - 1))];
export const thinkToFraction = (t: number): number => Math.max(0, THINK_LADDER.indexOf(t as (typeof THINK_LADDER)[number])) / (THINK_LADDER.length - 1);

/** Spread the row-value chips so that none overlaps the one before it, keeping their order. Returns each chip's centre. */
export function spreadChips(xs: readonly number[], width: number, min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < xs.length; i++) {
    const want = Math.max(min + width / 2, Math.min(max - width / 2, xs[i]));
    out.push(i === 0 ? want : Math.max(want, out[i - 1] + width + 4));
  }
  // If the last chip ran past the end, shift the tail back from the right.
  for (let i = out.length - 1; i >= 0; i--) {
    const limit = i === out.length - 1 ? max - width / 2 : out[i + 1] - width - 4;
    if (out[i] > limit) out[i] = limit;
  }
  return out;
}

export function describeRun(r: Run): string {
  const parts = [
    `Think time ${r.think} ms.`,
    r.strategy === "none" ? "No protection." : r.strategy === "lock" ? "Row lock." : "Version check.",
    `${r.lostUpdates} lost update${r.lostUpdates === 1 ? "" : "s"}, ${r.retries} retr${r.retries === 1 ? "y" : "ies"}, finish at ${r.finish} ms.`,
    r.waited > 0 ? `Writer B waits ${r.waited} ms for the lock.` : "",
    r.wasted > 0 ? `Writer B throws away ${r.wasted} ms of work.` : "",
    `Row ends at ${r.row[r.row.length - 1].value}.`,
    `${r.verdict.text}.`,
  ];
  return parts.filter(Boolean).join(" ");
}
