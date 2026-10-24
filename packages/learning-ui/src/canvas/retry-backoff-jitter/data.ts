import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// AI Engineering Interview course, chapter 9.4 "Retries, timeouts and rate
// limits". The defaults are the chapter's thundering herd: 1,000 app clients
// fail at the same moment and retry after 1 second with no random part. See
// spec.md.

export type RetryInputs = {
  /** Clients that failed at the same moment. */
  clients: number;
  /** The backoff wait before this retry, in seconds. */
  baseSeconds: number;
  /** Share of the wait that is random, 0 to 100. 100 is full jitter. */
  jitterPercent: number;
};

/** The provider's view is counted in windows of this length. */
export const WINDOW_SECONDS = 0.1;

export type RetrySpread = {
  /** Width of the time range the retries land in, in seconds. */
  spreadSeconds: number;
  /** Expected retries in the busiest 100 ms. */
  peak: number;
  /** Average wait before the retry, in seconds. */
  averageWait: number;
};

/**
 * Each client waits a random time drawn evenly from
 * [base x (1 - jitter share), base], so the retries spread over a range of
 * width base x jitter share. With full jitter (100%) that is 0 to base, as in
 * the chapter. When the range is no wider than 100 ms, one 100 ms window holds
 * every retry; otherwise the busiest 100 ms holds clients x 0.1 / width.
 */
export function retrySpread({ clients, baseSeconds, jitterPercent }: RetryInputs): RetrySpread {
  const spreadSeconds = baseSeconds * (jitterPercent / 100);
  const peak = spreadSeconds <= WINDOW_SECONDS ? clients : (clients * WINDOW_SECONDS) / spreadSeconds;
  return { spreadSeconds, peak, averageWait: baseSeconds - spreadSeconds / 2 };
}

function inputsFrom(values: SliderValues): RetryInputs {
  return {
    clients: values.clients ?? 1000,
    baseSeconds: values.baseSeconds ?? 1,
    jitterPercent: values.jitterPercent ?? 0,
  };
}

export function formatCount(count: number): string {
  return Math.round(count).toLocaleString("en-US");
}

/** Under a second in ms, otherwise seconds with up to two decimals. */
export function formatSpread(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  return `${seconds.toLocaleString("en-US", { maximumFractionDigits: 2 })} s`;
}

export function computeRetries(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const spread = retrySpread(inputs);
  const noJitter = retrySpread({ ...inputs, jitterPercent: 0 });
  const fullJitter = retrySpread({ ...inputs, jitterPercent: 100 });
  const herd = spread.spreadSeconds <= WINDOW_SECONDS;
  const average = `${spread.averageWait.toLocaleString("en-US", { maximumFractionDigits: 2 })} s`;

  return {
    stats: [
      { label: "Busiest 100 ms", value: formatCount(spread.peak), detail: `of ${formatCount(inputs.clients)} retries` },
      { label: "Retries spread over", value: formatSpread(spread.spreadSeconds), detail: herd ? "all in one burst" : "evenly, at random" },
      { label: "Average wait", value: average, detail: `longest ${inputs.baseSeconds.toLocaleString("en-US")} s` },
    ],
    bars: [
      { label: "No jitter", value: noJitter.peak, display: formatCount(noJitter.peak), tone: "bad" },
      { label: `Jitter share ${inputs.jitterPercent}%`, value: spread.peak, display: formatCount(spread.peak), tone: herd ? "bad" : undefined },
      { label: "Full jitter, 100%", value: fullJitter.peak, display: formatCount(fullJitter.peak) },
    ],
    barMax: inputs.clients,
    summary: herd
      ? `All ${formatCount(inputs.clients)} retries land ${spread.spreadSeconds === 0 ? "at the same instant" : `within ${formatSpread(spread.spreadSeconds)}`}, so the provider sees one burst of ${formatCount(spread.peak)} in a single 100 ms.`
      : `The ${formatCount(inputs.clients)} retries spread over ${formatSpread(spread.spreadSeconds)}, so the busiest 100 ms holds about ${formatCount(spread.peak)} of them.`,
  };
}

export function describeRetryChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = retrySpread(a);
  const y = retrySpread(b);
  const changed: string[] = [];
  if (a.clients !== b.clients) changed.push("the number of clients");
  if (a.baseSeconds !== b.baseSeconds) changed.push("the wait");
  if (a.jitterPercent !== b.jitterPercent) changed.push("the jitter share");
  if (changed.length === 0) return "Nothing changed.";
  const moved = changed.length === 1 ? `Changing ${changed[0]}` : "Changing several inputs";
  const peakNow = formatCount(y.peak);
  const peakBefore = formatCount(x.peak);

  if (y.spreadSeconds <= WINDOW_SECONDS) {
    const why = b.jitterPercent === 0
      ? "with no random part, every client waits exactly the same time"
      : `the random part covers only ${formatSpread(y.spreadSeconds)}, less than one 100 ms window`;
    return `${moved}: ${why}, so all ${formatCount(b.clients)} retries arrive together (before: ${peakBefore} in the busiest 100 ms).`;
  }
  const direction = y.peak < x.peak ? "fell" : y.peak > x.peak ? "rose" : "stayed";
  const amount = direction === "stayed" ? `at ${peakNow}` : `from ${peakBefore} to ${peakNow}`;
  return `${moved} spreads ${formatCount(b.clients)} retries over ${formatSpread(y.spreadSeconds)}, so the busiest 100 ms ${direction} ${amount}. A wider random range means fewer retries in any one moment.`;
}

export const retryBackoffJitter: SliderSpec = {
  kind: "slider",
  title: "Jitter spreads a retry spike",
  purpose: "Change how many clients fail together, how long they wait and how much of the wait is random, and watch the busiest 100 ms of retries.",
  intro:
    "1,000 app clients fail at the same moment and each retries after a 1 second wait. With a jitter share of 0%, every wait is exactly 1 second. Predict how many retries land in the busiest 100 ms, then add jitter.",
  inputs: [
    { id: "clients", label: "Clients that fail together", min: 100, max: 5000, step: 100, default: 1000, unit: "clients" },
    { id: "baseSeconds", label: "Backoff wait", min: 0.5, max: 8, step: 0.5, default: 1, unit: "s" },
    { id: "jitterPercent", label: "Jitter share of the wait", min: 0, max: 100, step: 5, default: 0, unit: "%" },
  ],
  compute: computeRetries,
  describeChange: describeRetryChange,
  barsTitle: "Retries in the busiest 100 ms",
  tryThis: [
    "Raise the jitter share from 0% to 100% (full jitter). The busiest 100 ms falls from 1,000 retries to about 100, because the retries spread evenly over a whole second.",
    "Set the jitter share to 5%. The random part covers only 50 ms, so all 1,000 retries still land in one 100 ms window. A small random amount is not enough.",
  ],
  limits:
    "This models one retry after one shared failure, with waits spread perfectly evenly, so the numbers are averages: real random waits bunch a little. It ignores new traffic arriving at the same time, later retries, Retry-After headers and any limit on the provider's side.",
};
