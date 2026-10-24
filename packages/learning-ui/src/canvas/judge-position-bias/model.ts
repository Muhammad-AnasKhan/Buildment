// AI Engineering Interview course, chapter 5.4 "LLM-as-judge and its
// pitfalls". A pairwise judge compares prompt B with prompt A. The model: the
// judge adds a fixed bonus, in percentage points, to the win rate of whichever
// answer it reads first, and the observed rate is kept between 0 and 100.
// Every pair has a winner (no ties), so A's rate is 100 minus B's.

export type JudgeRuns = {
  /** B's true win rate, in percent. */
  trueRate: number;
  /** Bonus for going first, in percentage points. */
  bias: number;
  /** B's observed win rate when B is shown first. */
  bFirst: number;
  /** B's observed win rate when A is shown first. */
  bSecond: number;
  /** Mean of the two orders. */
  average: number;
  /** average minus trueRate. Zero unless one order hit 0 or 100. */
  gap: number;
  /** Which run, if any, hit the 0 to 100 limit and lost part of the bonus. */
  clipped: "b-first" | "a-first" | null;
};

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

/** Observed win rate of the answer in first position: its true rate plus the bonus, clamped. */
export function firstPositionRate(trueRate: number, bias: number): number {
  return clampPercent(trueRate + bias);
}

export function judgeRuns(trueRateIn: number, biasIn: number): JudgeRuns {
  const trueRate = clampPercent(trueRateIn);
  const bias = Number.isFinite(biasIn) ? Math.max(0, biasIn) : 0;
  const bFirst = firstPositionRate(trueRate, bias);
  const aFirst = firstPositionRate(100 - trueRate, bias);
  const bSecond = 100 - aFirst;
  const average = (bFirst + bSecond) / 2;
  const clipped = trueRate + bias > 100 ? "b-first" : 100 - trueRate + bias > 100 ? "a-first" : null;
  return { trueRate, bias, bFirst, bSecond, average, gap: average - trueRate, clipped };
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

function formatPoints(value: number): string {
  const rounded = Math.round(Math.abs(value) * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${rounded === 1 ? "point" : "points"}`;
}

/** Why the average does or does not equal the true rate, in one sentence. */
export function averageVerdict(runs: JudgeRuns): string {
  if (runs.bias === 0) return `With no bonus, both orders show the true rate of ${formatPercent(runs.trueRate)}.`;
  if (runs.clipped === null) {
    return `The average, ${formatPercent(runs.average)}, equals the true rate, because the bonus goes to B in one order and to A in the other, so it cancels.`;
  }
  const where = runs.clipped === "b-first" ? "the run with B first hit 100%" : "the run with A first hit 100% for A, so B second fell to 0%";
  return `The average, ${formatPercent(runs.average)}, misses the true ${formatPercent(runs.trueRate)} by ${formatPoints(runs.gap)}, because ${where} and part of the bonus was cut off.`;
}

/** "What changed": which input moved, the two runs, and whether averaging still recovers the true rate. */
export function describeJudgeChange(before: { trueRate: number; bias: number }, after: { trueRate: number; bias: number }): string {
  const b = judgeRuns(before.trueRate, before.bias);
  const a = judgeRuns(after.trueRate, after.bias);
  const moved: string[] = [];
  if (a.bias !== b.bias) moved.push(`The bonus for going first went from ${formatPoints(b.bias)} to ${formatPoints(a.bias)}.`);
  if (a.trueRate !== b.trueRate) moved.push(`B's true win rate went from ${formatPercent(b.trueRate)} to ${formatPercent(a.trueRate)}.`);
  if (moved.length === 0) return `Nothing moved. ${averageVerdict(a)}`;
  const runs = `B now wins ${formatPercent(a.bFirst)} when shown first and ${formatPercent(a.bSecond)} when shown second, a gap of ${formatPoints(a.bFirst - a.bSecond)}.`;
  return `${moved.join(" ")} ${runs} ${averageVerdict(a)}`;
}
