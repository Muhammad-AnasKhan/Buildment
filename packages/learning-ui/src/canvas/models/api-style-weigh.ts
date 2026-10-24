// 6.2 "Weigh what matters, see who wins": a weighted sum. For each API style,
// total = sum over needs of (weight x score). The scores (1 to 5) are course
// judgments, not measurements. Pure, no React.

export type StyleId = "rest" | "graphql" | "grpc";
export type NeedId = "reach" | "trips" | "service" | "cache" | "simple";
export type Weight = 0 | 1 | 3;

export const API_STYLES: readonly { id: StyleId; name: string }[] = [
  { id: "rest", name: "REST" },
  { id: "graphql", name: "GraphQL" },
  { id: "grpc", name: "gRPC" },
];

export type Need = { id: NeedId; short: string; full: string; scores: Record<StyleId, number> };

export const NEEDS: readonly Need[] = [
  { id: "reach", short: "Wide reach", full: "Reach: partners and browsers", scores: { rest: 5, graphql: 4, grpc: 2 } },
  { id: "trips", short: "Few round trips", full: "Few round trips for varied screens", scores: { rest: 2, graphql: 5, grpc: 3 } },
  { id: "service", short: "Fast service calls", full: "Small, fast calls between services", scores: { rest: 2, graphql: 2, grpc: 5 } },
  { id: "cache", short: "Free caching", full: "HTTP caching for free", scores: { rest: 5, graphql: 2, grpc: 1 } },
  { id: "simple", short: "Easy to run", full: "Simple to run and debug", scores: { rest: 5, graphql: 3, grpc: 3 } },
];

export const WEIGHT_LEVELS: readonly Weight[] = [0, 1, 3];
export const WEIGHT_WORDS: Record<Weight, { chip: string; full: string }> = {
  0: { chip: "skip", full: "not needed" },
  1: { chip: "nice", full: "nice to have" },
  3: { chip: "must", full: "must have" },
};

export type Weights = readonly Weight[];

export const PRESETS: readonly { id: string; name: string; weights: Weights }[] = [
  { id: "partner", name: "Partner API", weights: [3, 1, 0, 3, 1] },
  { id: "mobile", name: "Mobile screens", weights: [1, 3, 0, 1, 1] },
  { id: "internal", name: "Internal services", weights: [0, 1, 3, 0, 1] },
];

export const DEFAULT_WEIGHTS: Weights = PRESETS[0].weights;

/** Highest total any style can reach: every need a "must" (weight 3) at that style's scores. */
export const MAX_TOTAL = Math.max(...API_STYLES.map((s) => NEEDS.reduce((sum, n) => sum + 3 * n.scores[s.id], 0)));

/** Tap order: not needed, nice, must, and round again. */
export function nextWeight(w: Weight): Weight {
  return w === 0 ? 1 : w === 1 ? 3 : 0;
}

export function totals(weights: Weights): Record<StyleId, number> {
  const out: Record<StyleId, number> = { rest: 0, graphql: 0, grpc: 0 };
  NEEDS.forEach((need, i) => {
    for (const s of API_STYLES) out[s.id] += (weights[i] ?? 0) * need.scores[s.id];
  });
  return out;
}

export type StyleVerdict = { text: string; tone: "good" | "warn"; leader: StyleId | null; close: boolean; top: StyleId[] };

/** REST, GraphQL or gRPC leads by 2 points or more, or the race is close. */
export function styleVerdict(weights: Weights): StyleVerdict {
  const t = totals(weights);
  const ranked = [...API_STYLES].sort((a, b) => t[b.id] - t[a.id]);
  const lead = t[ranked[0].id] - t[ranked[1].id];
  if (lead < 2) {
    const top = ranked.filter((s) => t[ranked[0].id] - t[s.id] < 2).map((s) => s.id);
    return { text: "Close: pick what your team runs", tone: "warn", leader: null, close: true, top };
  }
  const leader = ranked[0].id;
  const text = leader === "rest" ? "REST wins: reach and caching" : leader === "graphql" ? "GraphQL wins: one trip per screen" : "gRPC wins: small typed calls";
  return { text, tone: "good", leader, close: false, top: [leader] };
}

/** The preset the weights match exactly, or null once the learner has changed one. */
export function matchingPreset(weights: Weights): string | null {
  return PRESETS.find((p) => p.weights.every((w, i) => w === weights[i]))?.id ?? null;
}
