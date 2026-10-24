import type { SliderSpec, SliderValues } from "../renderers/slider/types";
import { describeRoutingChange, formatDollars, formatMs, ROUTES, routingResult } from "./model";

// AI Engineering Interview course, chapter 4.5. Two route shares in, the third
// derived; average latency and cost per 1,000 questions out, against the
// no-router baseline where every question takes the multi-step route. See spec.md.

function shares(values: SliderValues) {
  return { none: values.none ?? 30, multi: values.multi ?? 15 };
}

export const adaptiveRoutingCost: SliderSpec = {
  kind: "slider",
  title: "What a question router saves",
  purpose: "Change the mix of easy and hard questions and see how much latency and cost routing saves against sending every question down the most expensive path.",
  intro:
    "Najm's router sends each question down one of three routes. Example numbers per route: no retrieval 800 ms and $1.00 per 1,000 questions; single-step 1,900 ms and $4.00; multi-step 4,500 ms and $12.00. Single-step takes whatever share is left. Before you move a slider, predict: if half the questions needed several searches, would routing still save most of the cost?",
  inputs: [
    { id: "none", label: "No-retrieval share", min: 0, max: 100, step: 5, default: 30, unit: "%" },
    { id: "multi", label: "Multi-step share", min: 0, max: 100, step: 5, default: 15, unit: "%" },
  ],
  compute: (values) => {
    const { none, multi } = shares(values);
    const r = routingResult(none, multi);
    const singleDetail = r.mix.multiCapped
      ? `Multi-step capped at ${r.mix.multi}% so the shares total 100%`
      : "The rest, after the other two routes";
    return {
      stats: [
        { label: "Single-step share", value: `${r.mix.single}%`, detail: singleDetail },
        {
          label: "Average latency",
          value: formatMs(r.latencyMs),
          detail: `${formatMs(r.baselineLatencyMs)} with no router (${r.latencySavedPct}% less)`,
        },
        {
          label: "Cost per 1,000 questions",
          value: formatDollars(r.cents),
          detail: `${formatDollars(r.baselineCents)} with no router (${r.costSavedPct}% less)`,
        },
      ],
      bars: [
        { label: `${ROUTES.none.name} (${r.mix.none}%)`, value: r.centsByRoute.none, display: formatDollars(r.centsByRoute.none) },
        { label: `${ROUTES.single.name} (${r.mix.single}%)`, value: r.centsByRoute.single, display: formatDollars(r.centsByRoute.single) },
        { label: `${ROUTES.multi.name} (${r.mix.multi}%)`, value: r.centsByRoute.multi, display: formatDollars(r.centsByRoute.multi) },
        { label: "No router: all multi-step", value: r.baselineCents, display: formatDollars(r.baselineCents) },
      ],
      barMax: r.baselineCents,
      summary:
        `With ${r.mix.none}% no retrieval, ${r.mix.single}% single-step and ${r.mix.multi}% multi-step, ` +
        `the average question takes ${formatMs(r.latencyMs)} and 1,000 questions cost ${formatDollars(r.cents)}, ` +
        `against ${formatMs(r.baselineLatencyMs)} and ${formatDollars(r.baselineCents)} if every question took the multi-step route.`,
    };
  },
  describeChange: (before, after) => describeRoutingChange(shares(before), shares(after)),
  barsTitle: "Cost per 1,000 questions, by route (example prices)",
  tryThis: [
    "Raise no retrieval from 30% to 60%. Single-step drops to 25%, latency falls to 1,630 ms and cost to $3.40, a 72% saving.",
    "Set no retrieval to 0% and multi-step to 60%. Cost rises to $8.80, so routing saves only 27%: most questions still need the costly route.",
    "Drag multi-step to 100% with no retrieval at 30%. It is capped at 70%, because the three shares cannot pass 100%.",
  ],
  limits:
    "Latencies and prices are this example's own numbers, not real provider prices. The router is free (simple rules) and always right, no question escalates from single-step to multi-step, and latency is an average, not p95. Use it for the shape of the saving, not to price a real system.",
};
