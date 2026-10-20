import type { FactorSpec } from "./types";

// The weighted-sum model behind the factor canvas. Pure: same weights in, same
// totals out, no rounding. total(option) = sum over criteria of
// weight(criterion) x score(option, criterion).

export type Weights = Record<string, number>;

export type Cell = { score: number; weight: number; points: number };

export type Scored = {
  totals: Record<string, number>;
  /** cells[criterionId][optionId] */
  cells: Record<string, Record<string, Cell>>;
};

export type Standing = {
  /** Option ids with the highest total. More than one means a tie. */
  leaders: string[];
  tie: boolean;
  /** Lead over the next best option. Zero on a tie. */
  margin: number;
};

export function defaultWeights(spec: FactorSpec): Weights {
  return Object.fromEntries(spec.criteria.map((c) => [c.id, snapWeight(spec, c.weight)]));
}

/** The nearest allowed weight level, so a bad value can never reach the totals. */
export function snapWeight(spec: FactorSpec, value: number): number {
  const levels = spec.weightLevels.map((l) => l.value);
  if (levels.length === 0) return 0;
  if (!Number.isFinite(value)) return levels[0]!;
  return levels.reduce((best, level) => (Math.abs(level - value) < Math.abs(best - value) ? level : best));
}

function clampScore(spec: FactorSpec, value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return spec.scoreScale.min;
  return Math.max(spec.scoreScale.min, Math.min(spec.scoreScale.max, value));
}

export function scoreOptions(spec: FactorSpec, weights: Weights): Scored {
  const totals: Record<string, number> = Object.fromEntries(spec.options.map((o) => [o.id, 0]));
  const cells: Scored["cells"] = {};
  for (const criterion of spec.criteria) {
    const weight = snapWeight(spec, weights[criterion.id] ?? criterion.weight);
    cells[criterion.id] = {};
    for (const option of spec.options) {
      const score = clampScore(spec, criterion.scores[option.id]);
      const points = score * weight;
      cells[criterion.id]![option.id] = { score, weight, points };
      totals[option.id]! += points;
    }
  }
  return { totals, cells };
}

export function standing(spec: FactorSpec, totals: Record<string, number>): Standing {
  const values = spec.options.map((o) => totals[o.id] ?? 0);
  const best = Math.max(...values);
  const leaders = spec.options.filter((o) => (totals[o.id] ?? 0) === best).map((o) => o.id);
  const rest = values.filter((v) => v !== best);
  const tie = leaders.length > 1;
  const margin = tie || rest.length === 0 ? 0 : best - Math.max(...rest);
  return { leaders, tie, margin };
}

/** The largest total any option could reach: every weight and score at its top. */
export function maxTotal(spec: FactorSpec): number {
  const topWeight = Math.max(0, ...spec.weightLevels.map((l) => l.value));
  return spec.criteria.length * topWeight * spec.scoreScale.max;
}

function nameOf(spec: FactorSpec, optionId: string): string {
  return spec.options.find((o) => o.id === optionId)?.name ?? optionId;
}

function levelLabel(spec: FactorSpec, value: number): string {
  const level = spec.weightLevels.find((l) => l.value === value);
  return level ? `${value} (${level.label.toLowerCase()})` : String(value);
}

function signed(n: number, unit: string): string {
  if (n === 0) return `no ${unit}`;
  return `${n > 0 ? "+" : ""}${n} ${Math.abs(n) === 1 ? unit.replace(/s$/, "") : unit}`;
}

function describeStanding(spec: FactorSpec, s: Standing, totals: Record<string, number>): string {
  if (s.tie) {
    return `Now it is a tie: ${s.leaders.map((id) => nameOf(spec, id)).join(" and ")} both have ${totals[s.leaders[0]!]} ${spec.unit}.`;
  }
  return `${nameOf(spec, s.leaders[0]!)} leads by ${s.margin} ${s.margin === 1 ? spec.unit.replace(/s$/, "") : spec.unit}.`;
}

/**
 * "What changed", in words: which weight moved, how many points that moved
 * each option, and whether the leader changed. Plain sentences for ESL readers.
 */
export function describeChange(spec: FactorSpec, before: Weights, after: Weights): string {
  const changed = spec.criteria.filter(
    (c) => snapWeight(spec, before[c.id] ?? c.weight) !== snapWeight(spec, after[c.id] ?? c.weight)
  );
  const prev = scoreOptions(spec, before);
  const next = scoreOptions(spec, after);
  const prevStanding = standing(spec, prev.totals);
  const nextStanding = standing(spec, next.totals);

  if (changed.length === 0) return "";

  if (changed.length > 1) {
    return `You changed ${changed.length} weights. ${describeStanding(spec, nextStanding, next.totals)}`;
  }

  const criterion = changed[0]!;
  const from = snapWeight(spec, before[criterion.id] ?? criterion.weight);
  const to = snapWeight(spec, after[criterion.id] ?? criterion.weight);
  const verb = to > from ? "raised" : "lowered";
  const moves = spec.options
    .map((o) => `${o.name} ${signed(next.totals[o.id]! - prev.totals[o.id]!, spec.unit)}`)
    .join(", ");

  const leaderChanged =
    prevStanding.tie !== nextStanding.tie || prevStanding.leaders.join() !== nextStanding.leaders.join();
  let outcome = describeStanding(spec, nextStanding, next.totals);
  if (!nextStanding.tie && leaderChanged) outcome = `${outcome} The result changed.`;
  if (!nextStanding.tie && !leaderChanged) {
    outcome = `${nameOf(spec, nextStanding.leaders[0]!)} still leads, now by ${nextStanding.margin} ${
      nextStanding.margin === 1 ? spec.unit.replace(/s$/, "") : spec.unit
    }.`;
  }

  return `You ${verb} ${criterion.name} from ${levelLabel(spec, from)} to ${levelLabel(spec, to)}. That moved ${moves}. ${outcome}`;
}
