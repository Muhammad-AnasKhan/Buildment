// AI Engineering Interview course, chapter 11.4 "GPU memory budgeting and
// sizing". Fixed model: the running example (8,030,261,248 parameters at
// 16-bit, and 2 x 32 x 8 x 128 values x bytes per value of KV cache per
// token). The GPU keeps 10% back for activations and the engine, in this
// example. Memory is GB (decimal, 1e9 bytes). All byte maths is on whole
// numbers, so the "fits" test has no rounding noise.

import type { SliderValues } from "../renderers/slider/types";

export const BYTES_PER_GB = 1_000_000_000;
/** 8,030,261,248 parameters x 2 bytes = 16.06 GB. */
export const WEIGHT_BYTES = 8_030_261_248 * 2;
/** KV cache bytes per token at one byte per value: 2 x 32 layers x 8 KV heads x 128. */
export const KV_BYTES_PER_TOKEN_PER_BYTE = 2 * 32 * 8 * 128;
/** The GPU memory the example uses for weights and cache: 90% (the rest is the reserve). */
export const USABLE_PERCENT = 90;

export type BudgetInput = { users: number; tokens: number; bytesPerValue: number; gpuGB: number };

function pick(value: unknown, fallback: number, min: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.round(value)) : fallback;
}

export function budgetInput(values: SliderValues): BudgetInput {
  return {
    users: pick(values.users, 20, 1),
    tokens: pick(values.tokens, 32_768, 1),
    bytesPerValue: pick(values.bytesPerValue, 2, 1),
    gpuGB: pick(values.gpuGB, 80, 1),
  };
}

export type Budget = BudgetInput & {
  perTokenBytes: number;
  weightsGB: number;
  /** KV cache needed for every user at this context, bytes and GB. */
  neededBytes: number;
  neededGB: number;
  /** Memory left for the KV cache: GPU x 0.9 - weights, never below zero. */
  availableBytes: number;
  availableGB: number;
  fits: boolean;
  /** GB short when it does not fit, GB to spare when it does. */
  gapGB: number;
  /** Most users that fit at this context. */
  maxUsers: number;
};

export function memoryBudget(values: SliderValues): Budget {
  const input = budgetInput(values);
  const perTokenBytes = KV_BYTES_PER_TOKEN_PER_BYTE * input.bytesPerValue;
  const neededBytes = input.users * input.tokens * perTokenBytes;
  const availableBytes = Math.max(0, (input.gpuGB * (BYTES_PER_GB / 100)) * USABLE_PERCENT - WEIGHT_BYTES);
  const perUserBytes = input.tokens * perTokenBytes;
  return {
    ...input,
    perTokenBytes,
    weightsGB: WEIGHT_BYTES / BYTES_PER_GB,
    neededBytes,
    neededGB: neededBytes / BYTES_PER_GB,
    availableBytes,
    availableGB: availableBytes / BYTES_PER_GB,
    fits: neededBytes <= availableBytes,
    gapGB: Math.abs(neededBytes - availableBytes) / BYTES_PER_GB,
    maxUsers: Math.floor(availableBytes / perUserBytes),
  };
}

export const gb = (value: number) => `${value.toFixed(2)} GB`;
const count = (value: number) => value.toLocaleString("en-US");

export function verdictText(b: Budget): string {
  return b.fits ? "Fits" : `Out of memory by ${gb(b.gapGB)}`;
}

/** "What changed": which input moved, what it did to the KV memory, and the verdict now. */
export function describeBudgetChange(before: SliderValues, after: SliderValues): string {
  const a = memoryBudget(before);
  const b = memoryBudget(after);
  const moved = [a.users !== b.users, a.tokens !== b.tokens, a.bytesPerValue !== b.bytesPerValue, a.gpuGB !== b.gpuGB].filter(Boolean).length;
  const tail = `${b.fits ? `It fits, with ${gb(b.gapGB)} to spare` : `It is out of memory by ${gb(b.gapGB)}`}, and at most ${count(b.maxUsers)} ${b.maxUsers === 1 ? "user fits" : "users fit"} at this context.`;
  if (moved === 0) return "Nothing changed: the budget is the same, so the verdict is the same.";
  if (moved > 1) {
    return `KV needed went from ${gb(a.neededGB)} to ${gb(b.neededGB)} and KV available from ${gb(a.availableGB)} to ${gb(b.availableGB)}. ${tail}`;
  }
  if (a.users !== b.users) {
    return `Going from ${count(a.users)} to ${count(b.users)} users changed the KV memory needed from ${gb(a.neededGB)} to ${gb(b.neededGB)}, because every user holds a full context. ${tail}`;
  }
  if (a.tokens !== b.tokens) {
    return `Going from ${count(a.tokens)} to ${count(b.tokens)} tokens per user changed the KV memory needed from ${gb(a.neededGB)} to ${gb(b.neededGB)}, because the cache grows with every token. ${tail}`;
  }
  if (a.bytesPerValue !== b.bytesPerValue) {
    return `Going from ${a.bytesPerValue} to ${b.bytesPerValue} bytes per KV value changed the cache per token from ${count(a.perTokenBytes)} to ${count(b.perTokenBytes)} bytes, so the KV memory needed went from ${gb(a.neededGB)} to ${gb(b.neededGB)}. ${tail}`;
  }
  return `Going from ${a.gpuGB} GB to ${b.gpuGB} GB of GPU memory changed the memory left for the KV cache from ${gb(a.availableGB)} to ${gb(b.availableGB)}, because the weights take the same ${gb(b.weightsGB)} and 10% stays reserved. ${tail}`;
}
