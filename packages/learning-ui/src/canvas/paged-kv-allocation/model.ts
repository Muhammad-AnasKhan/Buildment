// AI Engineering Interview course, chapter 11.5 "Continuous batching,
// PagedAttention and prefix caching". Contiguous reservation holds the full
// context for every request; paged allocation holds the tokens actually used,
// rounded up to whole 16-token blocks. Per token: 131,072 bytes (the running
// example at 16-bit). Memory is GB (decimal, 1e9 bytes).

import type { SliderValues } from "../renderers/slider/types";

export const BYTES_PER_GB = 1_000_000_000;
export const BYTES_PER_TOKEN = 131_072;
export const BLOCK_TOKENS = 16;

export type PagedInput = { requests: number; reserved: number; actual: number; clamped: boolean };

function pick(value: unknown, fallback: number, min: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.round(value)) : fallback;
}

/** The inputs as whole numbers. The average length is cut down to the reserved context. */
export function pagedInput(values: SliderValues): PagedInput {
  const requests = pick(values.requests, 20, 1);
  const reserved = pick(values.reserved, 32_768, 1);
  const average = pick(values.actual, 6_000, 1);
  return { requests, reserved, actual: Math.min(average, reserved), clamped: average > reserved };
}

export type PagedResult = PagedInput & {
  /** Tokens allocated per request when paged: ceil(actual / 16) x 16. */
  pagedTokens: number;
  usedGB: number;
  contiguousGB: number;
  pagedGB: number;
  /** Share of each allocation that holds no token, 0 to 1. */
  contiguousWaste: number;
  pagedWaste: number;
};

export function pagedAllocation(values: SliderValues): PagedResult {
  const input = pagedInput(values);
  const pagedTokens = Math.ceil(input.actual / BLOCK_TOKENS) * BLOCK_TOKENS;
  const gbOf = (tokensPerRequest: number) => (input.requests * tokensPerRequest * BYTES_PER_TOKEN) / BYTES_PER_GB;
  return {
    ...input,
    pagedTokens,
    usedGB: gbOf(input.actual),
    contiguousGB: gbOf(input.reserved),
    pagedGB: gbOf(pagedTokens),
    contiguousWaste: (input.reserved - input.actual) / input.reserved,
    pagedWaste: (pagedTokens - input.actual) / pagedTokens,
  };
}

/** GB with two decimals, or three below 0.1 GB so a small amount does not show as 0.00. */
export function gb(value: number): string {
  return `${value.toFixed(value < 0.1 && value > 0 ? 3 : 2)} GB`;
}
export const percent = (share: number) => `${(share * 100).toFixed(1)}%`;
const count = (value: number) => value.toLocaleString("en-US");

/** "What changed": which input moved and what it did to each way of allocating. */
export function describePagedChange(before: SliderValues, after: SliderValues): string {
  const a = pagedAllocation(before);
  const b = pagedAllocation(after);
  const now = `Contiguous now uses ${gb(b.contiguousGB)} (${percent(b.contiguousWaste)} wasted) and paged ${gb(b.pagedGB)} (${percent(b.pagedWaste)} wasted).`;
  const moved = [a.requests !== b.requests, a.reserved !== b.reserved, a.actual !== b.actual].filter(Boolean).length;
  if (moved === 0) return "Nothing changed: the requests are the same, so both ways of allocating use the same memory.";
  if (moved > 1) return `Contiguous went from ${gb(a.contiguousGB)} to ${gb(b.contiguousGB)} and paged from ${gb(a.pagedGB)} to ${gb(b.pagedGB)}. ${now}`;
  if (a.requests !== b.requests) {
    return `Going from ${count(a.requests)} to ${count(b.requests)} requests scaled both ways by the same factor, because every request is the same size. ${now}`;
  }
  if (a.reserved !== b.reserved) {
    return `Changing the reserved context from ${count(a.reserved)} to ${count(b.reserved)} tokens moved contiguous from ${gb(a.contiguousGB)} to ${gb(b.contiguousGB)}, because it holds the full reservation whether or not it is used. Paged ${a.actual === b.actual ? "stayed at" : "went to"} ${gb(b.pagedGB)}${a.actual === b.actual ? ", because it only follows the tokens in use" : ", because the average length was cut down to the new reservation"}. ${now}`;
  }
  return `Changing the average length from ${count(a.actual)} to ${count(b.actual)} tokens moved paged from ${gb(a.pagedGB)} to ${gb(b.pagedGB)}, because it allocates blocks for the tokens in use. Contiguous stayed at ${gb(b.contiguousGB)}, because it reserves the full context regardless. ${now}`;
}
