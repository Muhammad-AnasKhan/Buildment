import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// AI Engineering Interview course, chapter 9.2 "Async Python: gather,
// semaphores and cancellation". The defaults are the chapter's predict: 10
// calls of 1 second behind asyncio.Semaphore(3) take about 4 seconds. The
// provider limit of 5 is Sahel Relief's limit from the same chapter. See spec.md.

export type BatchInputs = {
  /** Calls started together with gather. */
  calls: number;
  /** Slots in the shared semaphore. */
  limit: number;
  /** Seconds one call takes, all waiting on the network. */
  seconds: number;
  /** Calls the provider accepts at once; the rest are rejected. */
  providerLimit: number;
};

export type BatchOutcome = {
  /** Seconds until every accepted call has finished. */
  totalSeconds: number;
  /** Rounds of calls, each as long as one call. */
  waves: number;
  /** Most calls the batch sends at the same moment. */
  peakSent: number;
  /** Calls the provider refused with "too many requests". */
  rejected: number;
};

/**
 * Waves of the semaphore limit. While the limit is at or under the provider's,
 * every call succeeds and the batch takes ceil(calls / limit) waves. Above it,
 * the provider rejects every call beyond its own limit at once; each rejected
 * call frees its slot straight away, so the next waiting call is sent and
 * rejected too, until only the accepted calls are left running. Rejected calls
 * are not retried.
 */
export function runBatch({ calls, limit, seconds, providerLimit }: BatchInputs): BatchOutcome {
  const peakSent = Math.min(calls, limit);
  if (peakSent > providerLimit) {
    return { totalSeconds: seconds, waves: 1, peakSent, rejected: calls - providerLimit };
  }
  const waves = Math.ceil(calls / limit);
  return { totalSeconds: waves * seconds, waves, peakSent, rejected: 0 };
}

function inputsFrom(values: SliderValues): BatchInputs {
  return {
    calls: values.calls ?? 10,
    limit: values.limit ?? 3,
    seconds: values.seconds ?? 1,
    providerLimit: values.providerLimit ?? 5,
  };
}

export function formatSeconds(seconds: number): string {
  return `${seconds.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
}

function plural(count: number, one: string, many: string): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;
}

export function computeBatch(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const outcome = runBatch(inputs);
  const oneAtATime = runBatch({ ...inputs, limit: 1 });
  const allAtOnce = runBatch({ ...inputs, limit: inputs.calls });
  const failed = outcome.rejected > 0;

  const timeDetail = failed
    ? `only ${plural(inputs.calls - outcome.rejected, "call", "calls")} succeeded`
    : `${plural(outcome.waves, "wave", "waves")} of up to ${inputs.limit}`;
  const summary = failed
    ? `The semaphore lets ${outcome.peakSent} calls out at once but the provider accepts ${inputs.providerLimit}, so ${outcome.rejected} of ${inputs.calls} calls are rejected and the rest finish in ${formatSeconds(outcome.totalSeconds)}.`
    : `${plural(inputs.calls, "call", "calls")} of ${formatSeconds(inputs.seconds)} with at most ${inputs.limit} at once ${inputs.calls === 1 ? "runs" : "run"} in ${plural(outcome.waves, "wave", "waves")} and finish in ${formatSeconds(outcome.totalSeconds)}, with no calls rejected.`;

  return {
    stats: [
      { label: "Total time", value: formatSeconds(outcome.totalSeconds), detail: timeDetail },
      { label: "Most calls at once", value: outcome.peakSent.toLocaleString("en-US"), detail: `provider allows ${inputs.providerLimit}` },
      { label: "Rejected calls", value: outcome.rejected.toLocaleString("en-US"), detail: failed ? "too many requests" : "none over the limit" },
    ],
    bars: [
      { label: "One at a time", value: oneAtATime.totalSeconds, display: formatSeconds(oneAtATime.totalSeconds) },
      {
        label: `Semaphore of ${inputs.limit}`,
        value: outcome.totalSeconds,
        display: failed ? `${formatSeconds(outcome.totalSeconds)}, ${outcome.rejected} rejected` : formatSeconds(outcome.totalSeconds),
        tone: failed ? "bad" : "good",
      },
      {
        label: "All at once, no semaphore",
        value: allAtOnce.totalSeconds,
        display: allAtOnce.rejected > 0 ? `${formatSeconds(allAtOnce.totalSeconds)}, ${allAtOnce.rejected} rejected` : formatSeconds(allAtOnce.totalSeconds),
        tone: allAtOnce.rejected > 0 ? "bad" : undefined,
      },
    ],
    summary,
  };
}

const NAMES: Record<keyof BatchInputs, string> = {
  calls: "the batch",
  limit: "the semaphore limit",
  seconds: "the time per call",
  providerLimit: "the provider limit",
};

export function describeBatchChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const changed = (Object.keys(NAMES) as (keyof BatchInputs)[]).filter((key) => a[key] !== b[key]);
  if (changed.length === 0) return "Nothing changed.";
  const moved = changed.length === 1 ? `Changing ${NAMES[changed[0]!]}` : "Changing several inputs";
  const x = runBatch(a);
  const y = runBatch(b);

  if (y.rejected > 0 && x.rejected === 0) {
    return `${moved} lets ${y.peakSent} calls out at once, more than the provider's ${b.providerLimit}, so ${y.rejected} calls are now rejected. The batch looks faster at ${formatSeconds(y.totalSeconds)} only because most of it failed.`;
  }
  if (y.rejected === 0 && x.rejected > 0) {
    return `${moved} keeps calls at or under the provider's limit of ${b.providerLimit}, so no call is rejected now. The batch takes ${formatSeconds(y.totalSeconds)} in ${plural(y.waves, "wave", "waves")}.`;
  }
  if (y.rejected > 0) {
    return `${moved} still sends more calls than the provider's ${b.providerLimit} at once, so ${y.rejected} of ${b.calls} calls are rejected.`;
  }
  if (y.totalSeconds === x.totalSeconds) {
    return `${moved} left the batch at ${plural(y.waves, "wave", "waves")} of up to ${b.limit}, so the total time stays ${formatSeconds(y.totalSeconds)}.`;
  }
  const direction = y.totalSeconds > x.totalSeconds ? "rose" : "fell";
  return `${moved} gives ${plural(y.waves, "wave", "waves")} of up to ${plural(b.limit, "call", "calls")}, ${formatSeconds(b.seconds)} each, so the total time ${direction} from ${formatSeconds(x.totalSeconds)} to ${formatSeconds(y.totalSeconds)}.`;
}

export const asyncConcurrencyLimit: SliderSpec = {
  kind: "slider",
  title: "A semaphore in front of the provider",
  purpose: "Change the batch, the semaphore limit and the provider's limit, and watch total time grow in waves while rejected calls stay at zero.",
  intro:
    "Ten calls of 1 second each start together with gather, and each must hold a slot of asyncio.Semaphore(3). In this example the provider accepts 5 calls at once and rejects the rest. Predict the total time before you move anything.",
  inputs: [
    { id: "calls", label: "Calls in the batch", min: 1, max: 60, step: 1, default: 10, unit: "calls" },
    { id: "limit", label: "Semaphore limit", min: 1, max: 20, step: 1, default: 3, unit: "at once" },
    { id: "seconds", label: "Time per call", min: 0.5, max: 5, step: 0.5, default: 1, unit: "s" },
    { id: "providerLimit", label: "Provider limit", min: 1, max: 20, step: 1, default: 5, unit: "at once" },
  ],
  compute: computeBatch,
  describeChange: describeBatchChange,
  barsTitle: "Time to finish the batch",
  tryThis: [
    "Set 40 calls of 3 seconds with a semaphore limit of 5, as in Omar's job. The batch takes 8 waves, 24.0 seconds, with 0 rejected.",
    "Now raise the semaphore limit to 6, one above the provider's 5. The batch looks faster at 3.0 seconds, but 35 of the 40 calls are rejected.",
  ],
  limits:
    "Every call takes exactly the same time and the provider's limit never changes. A rejected call fails at once and is not retried, and nothing else shares the provider's limit. Real calls vary in length, so slots free up at different moments and the waves blur, but the total stays close to waves times the call time.",
};
