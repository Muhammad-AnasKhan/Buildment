import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";
import { admission, describeAdmissionChange } from "./model";

// AI Engineering Interview course, chapter 11.8 "Admission control and
// capacity in tokens". 30 requests of 16,384 tokens arrive together at a
// server with 420,000 tokens of KV capacity and a 90% limit: 378,000 tokens
// may be promised, so 23 are admitted and 7 queue. Without control the 30
// need 491,520 tokens, which is 71,520 over capacity. See spec.md.

export { admission, describeAdmissionChange } from "./model";

const count = (value: number) => value.toLocaleString("en-US");

function computeAdmission(values: SliderValues): SliderResult {
  const r = admission(values);
  return {
    stats: [
      { label: "Admitted now", value: count(r.admitted), detail: `holding ${count(r.heldWith)} tokens` },
      { label: "Queued", value: count(r.queued), detail: r.queued === 0 ? "nobody waits" : "wait for tokens to free up" },
      {
        label: "Without admission control",
        value: r.fitsWithout ? "Fits" : `Over by ${count(r.overBy)}`,
        detail: `${count(r.heldWithout)} tokens needed${r.fitsWithout ? ", within capacity" : ""}`,
      },
    ],
    bars: [
      { label: "KV capacity", value: r.capacity, display: count(r.capacity) },
      { label: "Admission limit", value: r.limitTokens, display: count(r.limitTokens) },
      { label: "Held with control", value: r.heldWith, display: count(r.heldWith) },
      { label: "Held without control", value: r.heldWithout, display: count(r.heldWithout), tone: r.fitsWithout ? undefined : "bad" },
    ],
    summary: `${count(r.arrivals)} requests of ${count(r.tokens)} tokens arrive at a server with ${count(r.capacity)} tokens of capacity and a ${r.limit}% limit: ${count(r.admitted)} are admitted and ${count(r.queued)} queue. Without control they would need ${count(r.heldWithout)} tokens, ${r.fitsWithout ? "which fits" : `which is ${count(r.overBy)} over capacity`}.`,
  };
}

export const admissionControlTokens: SliderSpec = {
  kind: "slider",
  title: "How many requests to let in",
  purpose: "Set a limit in tokens and see how many arriving requests the server admits, queues or would have crashed on.",
  intro:
    "The server's KV cache holds a fixed number of tokens, about 420,000 in the running example (55.94 GB at 131,072 bytes a token). Admission control counts tokens, not requests: it admits a request only while the tokens already promised stay under a limit, a share of that capacity. The rest wait in a queue. Before you move anything, predict how many of 30 requests of 16,384 tokens each get in at a 90% limit.",
  inputs: [
    { id: "arrivals", label: "Requests arriving together", min: 1, max: 100, step: 1, default: 30, unit: "requests" },
    { id: "tokens", label: "Tokens each request holds", min: 1_024, max: 32_768, step: 1_024, default: 16_384, unit: "tokens" },
    { id: "capacity", label: "KV capacity", min: 100_000, max: 1_000_000, step: 10_000, default: 420_000, unit: "tokens" },
    { id: "limit", label: "Admission limit", min: 50, max: 100, step: 5, default: 90, unit: "%" },
  ],
  compute: computeAdmission,
  describeChange: describeAdmissionChange,
  barsTitle: "Tokens held",
  tryThis: [
    "Lower the admission limit from 90% to 70%. The server will promise 294,000 tokens, so 17 are admitted and 13 queue, leaving more room for each request to keep growing.",
    "Halve the tokens each request holds, from 16,384 to 8,192. The limit now allows 46, which is more than the 30 that arrived, so all 30 are admitted and nobody queues.",
  ],
  limits:
    "This is a snapshot: no request finishes while it is taken, and no preemption is modelled. Real engines also cap the number of sequences, and requests grow as they generate, which is why the limit is below 100%. The capacity is the running example's, rounded to 420,000 tokens.",
};
