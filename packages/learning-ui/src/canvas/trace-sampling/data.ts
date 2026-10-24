import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// AI Engineering Interview course, chapter 10.3 "Tracing and observability".
// The defaults are the chapter's numbers: Wadi Labs gets 20,000 requests a day,
// a rare bug fails 1 request in 2,000 (0.05%), each trace has 6 spans of about
// 1 KB, and the team keeps 10% of traces. See spec.md.

export type SamplingInputs = {
  requestsPerDay: number;
  /** Share of requests that fail, in percent. */
  failurePercent: number;
  /** Share of traces kept, in percent. Both samplers store this many. */
  keepPercent: number;
};

/** 6 spans of about 1 KB each, as in the chapter. */
export const TRACE_KB = 6;

export type SamplingOutcome = {
  failures: number;
  /** Traces stored per day by either sampler: the same budget. */
  keptTraces: number;
  headFailuresKept: number;
  tailFailuresKept: number;
  /** Normal traces tail sampling stores with the space left over. */
  tailNormalKept: number;
  storageMb: number;
};

/**
 * Head sampling keeps each request with probability keep share, decided before
 * it runs, so it keeps that share of the failures too. Tail sampling decides
 * after the request ends and has the same storage: it keeps every failure (or
 * as many as fit) and fills the rest with a random share of normal requests.
 * Storage uses 1 MB = 1,000 KB, as the chapter does.
 */
export function sampleTraces({ requestsPerDay, failurePercent, keepPercent }: SamplingInputs): SamplingOutcome {
  const failures = (requestsPerDay * failurePercent) / 100;
  const keptTraces = (requestsPerDay * keepPercent) / 100;
  const tailFailuresKept = Math.min(failures, keptTraces);
  return {
    failures,
    keptTraces,
    headFailuresKept: (failures * keepPercent) / 100,
    tailFailuresKept,
    tailNormalKept: keptTraces - tailFailuresKept,
    storageMb: (keptTraces * TRACE_KB) / 1000,
  };
}

function inputsFrom(values: SliderValues): SamplingInputs {
  return {
    requestsPerDay: values.requestsPerDay ?? 20000,
    failurePercent: values.failurePercent ?? 0.05,
    keepPercent: values.keepPercent ?? 10,
  };
}

/** Whole numbers from 10 up; below 10, one decimal so 0.5 of a failure is not shown as 1; never a bare 0 for a small share. */
export function formatCount(count: number): string {
  if (count > 0 && count < 0.05) return "under 0.1";
  if (count >= 10) return Math.round(count).toLocaleString("en-US");
  return count.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function formatMb(mb: number): string {
  return `${mb.toLocaleString("en-US", { maximumFractionDigits: 1 })} MB`;
}

export function computeSampling(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const o = sampleTraces(inputs);
  const tailKeepsAll = o.tailFailuresKept >= o.failures;
  return {
    stats: [
      { label: "Failures kept, head", value: formatCount(o.headFailuresKept), detail: `of ${formatCount(o.failures)} a day` },
      { label: "Failures kept, tail", value: formatCount(o.tailFailuresKept), detail: tailKeepsAll ? `of ${formatCount(o.failures)}, every one` : `of ${formatCount(o.failures)}, storage is full` },
      { label: "Storage, both ways", value: formatMb(o.storageMb), detail: `${formatCount(o.keptTraces)} traces a day` },
    ],
    bars: [
      { label: "Failed requests that day", value: o.failures, display: formatCount(o.failures) },
      { label: "Kept by head sampling", value: o.headFailuresKept, display: formatCount(o.headFailuresKept), tone: "bad" },
      { label: "Kept by tail sampling", value: o.tailFailuresKept, display: formatCount(o.tailFailuresKept), tone: tailKeepsAll ? "good" : "warn" },
    ],
    summary: `Both samplers store ${formatCount(o.keptTraces)} traces, ${formatMb(o.storageMb)} a day. Of ${formatCount(o.failures)} failed requests, head sampling keeps about ${formatCount(o.headFailuresKept)} and tail sampling keeps ${formatCount(o.tailFailuresKept)}.`,
  };
}

export function describeSamplingChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = sampleTraces(a);
  const y = sampleTraces(b);
  if (a.requestsPerDay === b.requestsPerDay && a.failurePercent === b.failurePercent && a.keepPercent === b.keepPercent) {
    return "Nothing changed.";
  }
  if (y.tailFailuresKept < y.failures) {
    return `Now ${formatCount(y.failures)} requests fail but only ${formatCount(y.keptTraces)} traces fit in storage, so even tail sampling must drop some failures. Head sampling keeps about ${formatCount(y.headFailuresKept)}.`;
  }
  if (a.keepPercent !== b.keepPercent && a.requestsPerDay === b.requestsPerDay && a.failurePercent === b.failurePercent) {
    const verb = b.keepPercent > a.keepPercent ? "Keeping more" : "Keeping fewer";
    return `${verb} traces changed storage from ${formatMb(x.storageMb)} to ${formatMb(y.storageMb)} a day. Head sampling now keeps about ${formatCount(y.headFailuresKept)} of ${formatCount(y.failures)} failures, because it keeps failures at the same ${b.keepPercent}% rate as everything else. Tail sampling still keeps all ${formatCount(y.failures)}.`;
  }
  return `There are now ${formatCount(y.failures)} failed requests a day. Head sampling keeps about ${formatCount(y.headFailuresKept)} of them, the same ${b.keepPercent}% as any request, while tail sampling keeps all ${formatCount(y.failures)} in the same ${formatMb(y.storageMb)}.`;
}

export const traceSampling: SliderSpec = {
  kind: "slider",
  title: "Head or tail sampling",
  purpose: "Change traffic, the failure rate and the share of traces kept, and compare how many failed requests each sampler keeps for the same storage.",
  intro:
    "Wadi Labs gets 20,000 requests a day and keeps 10% of traces, 6 KB each. A rare bug fails 1 request in 2,000 (0.05%). Head sampling decides when a request starts; tail sampling decides when it ends. Predict how many failures head sampling keeps.",
  inputs: [
    { id: "requestsPerDay", label: "Requests a day", min: 5000, max: 100000, step: 5000, default: 20000, unit: "requests" },
    { id: "failurePercent", label: "Requests that fail", min: 0.05, max: 5, step: 0.05, default: 0.05, unit: "%" },
    { id: "keepPercent", label: "Share of traces kept", min: 1, max: 50, step: 1, default: 10, unit: "%" },
  ],
  compute: computeSampling,
  describeChange: describeSamplingChange,
  barsTitle: "Failed requests with a trace you can read",
  tryThis: [
    "Lower the share of traces kept from 10% to 2%. Storage falls from 12 MB to 2.4 MB a day and head sampling keeps about 0.2 of the 10 daily failures, while tail sampling still keeps all 10.",
    "Raise the failure rate to 5% and lower the share kept to 2%. Now 1,000 requests fail but only 400 traces fit, so even tail sampling drops failures: storage is the limit, not the sampler.",
  ],
  limits:
    "Counts are daily averages, so head sampling's 1 of 10 means about one on a typical day and none on many days. Tail sampling here keeps failures first and fills the rest with normal requests; a real rule also keeps slow requests and ones with negative feedback, and needs a collector that holds traces until they finish. Every trace is the same example size of 6 KB.",
};
