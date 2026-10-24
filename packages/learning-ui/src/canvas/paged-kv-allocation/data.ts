import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";
import { BLOCK_TOKENS, describePagedChange, gb, pagedAllocation, percent } from "./model";

// AI Engineering Interview course, chapter 11.5 "Continuous batching,
// PagedAttention and prefix caching". 20 requests, each reserving 32,768
// tokens but averaging 6,000: contiguous reservation holds 85.90 GB, paged
// 16-token blocks hold 15.73 GB, and 15.73 GB is what the tokens use. See
// spec.md.

export { describePagedChange, pagedAllocation } from "./model";

function computePaged(values: SliderValues): SliderResult {
  const r = pagedAllocation(values);
  const reserved = r.reserved.toLocaleString("en-US");
  const actual = r.actual.toLocaleString("en-US");
  return {
    stats: [
      { label: "Contiguous reservation", value: gb(r.contiguousGB), detail: `${reserved} tokens held per request` },
      { label: "Paged blocks", value: gb(r.pagedGB), detail: `${r.pagedTokens.toLocaleString("en-US")} tokens held per request` },
      { label: "Share wasted", value: `${percent(r.contiguousWaste)} vs ${percent(r.pagedWaste)}`, detail: "contiguous vs paged" },
    ],
    bars: [
      { label: "Tokens actually used", value: r.usedGB, display: gb(r.usedGB) },
      { label: "Contiguous reserved", value: r.contiguousGB, display: gb(r.contiguousGB), tone: r.contiguousWaste > 0.5 ? "bad" : undefined },
      { label: "Paged allocated", value: r.pagedGB, display: gb(r.pagedGB) },
    ],
    summary: `${r.requests} requests that reserve ${reserved} tokens but use ${actual} on average need ${gb(r.contiguousGB)} with contiguous reservation, of which ${percent(r.contiguousWaste)} is wasted, and ${gb(r.pagedGB)} with ${BLOCK_TOKENS}-token blocks, of which ${percent(r.pagedWaste)} is wasted.`,
  };
}

export const pagedKvAllocation: SliderSpec = {
  kind: "slider",
  title: "Reserving the whole context versus paging",
  purpose: "Compare reserving a request's full context up front with allocating 16-token blocks as the tokens arrive.",
  intro:
    "A server holds many requests at once, and each one's cache grows with its tokens. Contiguous reservation sets aside the full context for every request before it starts. Paged allocation hands out 16-token blocks only as tokens are produced, so a request holds its used tokens rounded up to a whole block. One token takes 131,072 bytes, as in the running example. Before you move anything, predict how much memory 20 requests use if each reserves 32,768 tokens but averages 6,000.",
  inputs: [
    { id: "requests", label: "Requests held at once", min: 1, max: 64, step: 1, default: 20, unit: "requests" },
    { id: "reserved", label: "Reserved context", min: 2_048, max: 32_768, step: 2_048, default: 32_768, unit: "tokens" },
    { id: "actual", label: "Average tokens actually used", min: 100, max: 32_768, step: 100, default: 6_000, unit: "tokens" },
  ],
  compute: computePaged,
  describeChange: describePagedChange,
  barsTitle: "KV memory in GB",
  tryThis: [
    "Lower the reserved context from 32,768 to 8,192 tokens. Contiguous falls from 85.90 GB to 21.47 GB, while paged stays at 15.73 GB, so the gap shrinks.",
    "Set the average tokens used to 100. Paged shrinks to 0.29 GB and contiguous stays at 85.90 GB, and paged now wastes 10.7% because 100 tokens fill 7 blocks of 16 (112 tokens).",
  ],
  limits:
    "Every request has the same average length, and prefix sharing is not modelled. The paper's measured waste for real older servers (61.8% to 79.6%) also counts fragmentation and other losses this model leaves out, so treat the contiguous figure as an illustration. An average above the reserved context is cut down to it.",
};
