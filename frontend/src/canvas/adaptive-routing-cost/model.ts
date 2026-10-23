// AI Engineering Interview course, chapter 4.5 "Adaptive retrieval, and RAG
// versus fine-tuning". A router sends each question down one of three routes.
// The learner sets two route shares; single-step takes whatever is left. All
// latencies and prices are the chapter's own example numbers, not real prices.

export type RouteId = "none" | "single" | "multi";

export type Route = {
  id: RouteId;
  name: string;
  /** Average latency of one question on this route, in milliseconds. */
  latencyMs: number;
  /** Example cost of 1,000 questions on this route, in cents. */
  centsPer1000: number;
};

export const ROUTES: Record<RouteId, Route> = {
  none: { id: "none", name: "No retrieval", latencyMs: 800, centsPer1000: 100 },
  single: { id: "single", name: "Single-step", latencyMs: 1900, centsPer1000: 400 },
  multi: { id: "multi", name: "Multi-step", latencyMs: 4500, centsPer1000: 1200 },
};

/** Whole-percent shares of the three routes. They always add up to 100. */
export type RouteMix = {
  none: number;
  single: number;
  multi: number;
  /** True when the multi-step input was cut down so the shares fit in 100%. */
  multiCapped: boolean;
};

function percent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * The route mix from the two inputs. No retrieval is taken as given, multi-step
 * is clamped to what is left, and single-step is the remainder, so the three
 * shares never pass 100% and none is negative.
 */
export function routeMix(noneShare: number, multiShare: number): RouteMix {
  const none = percent(noneShare);
  const asked = percent(multiShare);
  const multi = Math.min(asked, 100 - none);
  return { none, single: 100 - none - multi, multi, multiCapped: multi < asked };
}

export type RoutingResult = {
  mix: RouteMix;
  /** Average latency per question, in milliseconds. */
  latencyMs: number;
  /** Cost of 1,000 questions with the router, in cents. */
  cents: number;
  /** The same, split by route, in cents. */
  centsByRoute: Record<RouteId, number>;
  /** With no router, every question takes the multi-step route. */
  baselineLatencyMs: number;
  baselineCents: number;
  /** Share saved against the no-router baseline, 0 to 100, rounded. */
  latencySavedPct: number;
  costSavedPct: number;
};

export function routingResult(noneShare: number, multiShare: number): RoutingResult {
  const mix = routeMix(noneShare, multiShare);
  const ids: RouteId[] = ["none", "single", "multi"];
  const centsByRoute = Object.fromEntries(ids.map((id) => [id, (mix[id] * ROUTES[id].centsPer1000) / 100])) as Record<RouteId, number>;
  const latencyMs = ids.reduce((sum, id) => sum + mix[id] * ROUTES[id].latencyMs, 0) / 100;
  const cents = ids.reduce((sum, id) => sum + centsByRoute[id], 0);
  const baselineLatencyMs = ROUTES.multi.latencyMs;
  const baselineCents = ROUTES.multi.centsPer1000;
  return {
    mix,
    latencyMs,
    cents,
    centsByRoute,
    baselineLatencyMs,
    baselineCents,
    latencySavedPct: Math.round((1 - latencyMs / baselineLatencyMs) * 100),
    costSavedPct: Math.round((1 - cents / baselineCents) * 100),
  };
}

export function formatMs(ms: number): string {
  return `${Math.round(ms).toLocaleString("en-US")} ms`;
}

export function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatMix(mix: RouteMix): string {
  return `${mix.none}/${mix.single}/${mix.multi}`;
}

/** "What changed": the new mix, the direction of latency and cost, and why. */
export function describeRoutingChange(before: { none: number; multi: number }, after: { none: number; multi: number }): string {
  const b = routingResult(before.none, before.multi);
  const a = routingResult(after.none, after.multi);
  const cap = a.mix.multiCapped
    ? ` Multi-step is capped at ${a.mix.multi}%, because ${a.mix.none}% already go to no retrieval and the shares cannot pass 100%.`
    : "";
  if (formatMix(a.mix) === formatMix(b.mix)) {
    return `The route mix did not change, so latency and cost stayed the same.${cap}`;
  }
  const verb = (from: number, to: number) => (to < from ? "fell" : to > from ? "rose" : "stayed");
  const why =
    a.cents < b.cents
      ? "more questions now take a cheaper route"
      : a.cents > b.cents
        ? "more questions now take a costlier route"
        : "the cheaper and costlier moves balance out";
  return (
    `The mix (no retrieval/single/multi) went from ${formatMix(b.mix)} to ${formatMix(a.mix)}. ` +
    `Average latency ${verb(b.latencyMs, a.latencyMs)} from ${formatMs(b.latencyMs)} to ${formatMs(a.latencyMs)} ` +
    `and cost per 1,000 questions ${verb(b.cents, a.cents)} from ${formatDollars(b.cents)} to ${formatDollars(a.cents)}, because ${why}. ` +
    `Against sending everything multi-step, routing now saves ${a.costSavedPct}% of the cost.${cap}`
  );
}
