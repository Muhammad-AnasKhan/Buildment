import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// AI Engineering Interview course, chapter 2.2 "Tokens, context windows and
// cost". Sara's support assistant from that chapter: a 600-token system
// prompt, a 50-token question, 400-token chunks, example prices of $1 per
// million input tokens and $4 per million output tokens, 10,000 requests a
// day for 30 days. The defaults are her "after" request. See spec.md.

export const SYSTEM_TOKENS = 600;
export const QUESTION_TOKENS = 50;
export const CHUNK_TOKENS = 400;
/** Example prices, dollars per million tokens. Not any real provider's price. */
export const INPUT_PRICE = 1;
export const OUTPUT_PRICE = 4;
export const REQUESTS_PER_DAY = 10_000;
export const DAYS_PER_MONTH = 30;
const REQUESTS_PER_MONTH = REQUESTS_PER_DAY * DAYS_PER_MONTH;

export type TokenCost = {
  chunks: number;
  historyTokens: number;
  outputTokens: number;
  inputTokens: number;
  /** Dollars for one request. */
  inputCost: number;
  outputCost: number;
  perRequest: number;
  /** Dollars for a 30-day month at 10,000 requests a day. */
  monthly: number;
  /** Input cost as a share of the total, 0 to 1. */
  inputShare: number;
  /** Monthly dollars by part of the request. */
  parts: { fixed: number; history: number; chunks: number; output: number };
};

function count(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function tokenCost(values: SliderValues): TokenCost {
  const chunks = Math.round(count(values.chunks, 10));
  const historyTokens = count(values.history, 3_000);
  const outputTokens = count(values.output, 350);
  const chunkTokens = chunks * CHUNK_TOKENS;
  const inputTokens = SYSTEM_TOKENS + QUESTION_TOKENS + historyTokens + chunkTokens;
  const inputCost = (inputTokens * INPUT_PRICE) / 1_000_000;
  const outputCost = (outputTokens * OUTPUT_PRICE) / 1_000_000;
  const perRequest = inputCost + outputCost;
  const month = (tokens: number, price: number) => (tokens * price * REQUESTS_PER_MONTH) / 1_000_000;
  return {
    chunks,
    historyTokens,
    outputTokens,
    inputTokens,
    inputCost,
    outputCost,
    perRequest,
    monthly: perRequest * REQUESTS_PER_MONTH,
    inputShare: perRequest > 0 ? inputCost / perRequest : 0,
    parts: {
      fixed: month(SYSTEM_TOKENS + QUESTION_TOKENS, INPUT_PRICE),
      history: month(historyTokens, INPUT_PRICE),
      chunks: month(chunkTokens, INPUT_PRICE),
      output: month(outputTokens, OUTPUT_PRICE),
    },
  };
}

export const dollars = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;
export const perRequestDollars = (value: number) => `$${value.toFixed(5)}`;
export const percent = (share: number) => `${Math.round(share * 100)}%`;
const tokens = (value: number) => value.toLocaleString("en-US");

function computeTokenCost(values: SliderValues): SliderResult {
  const r = tokenCost(values);
  return {
    stats: [
      { label: "Cost per request", value: perRequestDollars(r.perRequest), detail: `${tokens(r.inputTokens)} in, ${tokens(r.outputTokens)} out` },
      { label: "Cost per month", value: dollars(r.monthly), detail: "10,000 requests a day" },
      { label: "Input share of cost", value: percent(r.inputShare), detail: r.inputShare >= 0.5 ? "input is the main cost" : "output is the main cost" },
    ],
    bars: [
      { label: "System prompt and question", value: r.parts.fixed, display: dollars(r.parts.fixed) },
      { label: "Chat history", value: r.parts.history, display: dollars(r.parts.history) },
      { label: "Retrieved chunks", value: r.parts.chunks, display: dollars(r.parts.chunks) },
      { label: "Answer (output)", value: r.parts.output, display: dollars(r.parts.output) },
    ],
    summary: `Each request sends ${tokens(r.inputTokens)} input tokens and gets ${tokens(r.outputTokens)} output tokens back, costing ${perRequestDollars(r.perRequest)}, or ${dollars(r.monthly)} a month. Input is ${percent(r.inputShare)} of the cost.`,
  };
}

/** "What changed": which input moved, what it did to the month, and where the money now goes. */
export function describeTokenCostChange(before: SliderValues, after: SliderValues): string {
  const a = tokenCost(before);
  const b = tokenCost(after);
  const delta = b.monthly - a.monthly;
  const moved = delta >= 0 ? `added ${dollars(delta)} a month` : `saved ${dollars(-delta)} a month`;
  const share = `Input is now ${percent(b.inputShare)} of the cost`;
  const changed = [a.chunks !== b.chunks, a.historyTokens !== b.historyTokens, a.outputTokens !== b.outputTokens].filter(Boolean).length;
  if (changed === 0) return "Nothing changed: the request is the same size, so the cost is the same.";
  if (changed > 1) return `The monthly cost went from ${dollars(a.monthly)} to ${dollars(b.monthly)}. ${share}.`;
  if (a.chunks !== b.chunks) {
    const diff = Math.abs(b.chunks - a.chunks) * CHUNK_TOKENS;
    return `Going from ${a.chunks} to ${b.chunks} chunks ${b.chunks > a.chunks ? "added" : "removed"} ${tokens(diff)} input tokens on every request and ${moved}. ${share}.`;
  }
  if (a.historyTokens !== b.historyTokens) {
    return `Changing the chat history from ${tokens(a.historyTokens)} to ${tokens(b.historyTokens)} tokens ${moved}, because the history is sent again with every request. ${share}.`;
  }
  const tail =
    b.inputShare >= 0.5
      ? `Each output token costs 4 times an input token here, yet input is still ${percent(b.inputShare)} of the cost, because there is far more of it`
      : `With this little context, output is now ${percent(1 - b.inputShare)} of the cost`;
  return `Changing the answer length from ${tokens(a.outputTokens)} to ${tokens(b.outputTokens)} tokens ${moved}. ${tail}.`;
}

export const llmTokenCost: SliderSpec = {
  kind: "slider",
  title: "Where the money goes in one request",
  purpose: "Change how much context each request carries and see whether input or output tokens drive the bill.",
  intro:
    "Sara's support assistant sends a 600-token system prompt, the chat history, retrieved chunks of 400 tokens each and a 50-token question, and gets an answer back. The prices are this example's own: $1 per million input tokens and $4 per million output tokens, at 10,000 requests a day for 30 days. Output tokens cost 4 times as much each. Before you move anything, predict which side of the bill is bigger.",
  inputs: [
    { id: "chunks", label: "Retrieved chunks", min: 0, max: 20, step: 1, default: 10, unit: "chunks" },
    { id: "history", label: "Chat history", min: 0, max: 8_000, step: 200, default: 3_000, unit: "tokens" },
    { id: "output", label: "Answer length", min: 50, max: 1_000, step: 50, default: 350, unit: "tokens" },
  ],
  compute: computeTokenCost,
  describeChange: describeTokenCostChange,
  barsTitle: "Monthly cost by part of the request",
  tryThis: [
    "Double the answer length from 350 to 700 tokens. The month rises by $420 to $3,135, and input is still 73% of the cost.",
    "Set retrieved chunks to 0 and chat history to 0. Now output is 68% of the cost: with little context, output tokens dominate again.",
  ],
  limits:
    "The prices are example numbers, not any provider's real price. Every request is assumed to be the same size, and the token counts are given, not measured with a real tokenizer. Retries, caching discounts and latency are left out.",
};
