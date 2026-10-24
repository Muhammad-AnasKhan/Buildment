// AI Engineering Interview course, chapter 11.6 "Quantization, speculative
// decoding and FlashAttention". The idealised model from the speculative
// decoding paper: each draft token is accepted independently with
// probability a, the draft model proposes g tokens per step, and one draft
// step costs c of one target step.
//
//   expected tokens per target step = (1 - a^(g+1)) / (1 - a)
//   walltime factor = (1 - a^(g+1)) / ((1 - a)(g c + 1))

import type { SliderValues } from "../renderers/slider/types";

export type SpecInput = { acceptance: number; drafts: number; cost: number };

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function specInput(values: SliderValues): SpecInput {
  return {
    acceptance: Math.min(1, Math.max(0, num(values.acceptance, 0.8))),
    drafts: Math.max(1, Math.round(num(values.drafts, 4))),
    cost: Math.max(0, num(values.cost, 0.05)),
  };
}

/** Expected tokens per target step. At a = 1 every draft token is kept, so g + 1. */
export function expectedTokens(acceptance: number, drafts: number): number {
  if (1 - acceptance < 1e-9) return drafts + 1;
  return (1 - Math.pow(acceptance, drafts + 1)) / (1 - acceptance);
}

/** Walltime improvement over plain decoding: tokens per step / (g c + 1). */
export function walltimeFactor(acceptance: number, drafts: number, cost: number): number {
  return expectedTokens(acceptance, drafts) / (drafts * cost + 1);
}

export type Verdict = "faster" | "about the same" | "slower";

/** Faster above 1.05, slower below 0.95, about the same in between (on the rounded factor). */
export function verdict(factor: number): Verdict {
  const rounded = Math.round(factor * 100) / 100;
  if (rounded > 1.05) return "faster";
  if (rounded < 0.95) return "slower";
  return "about the same";
}

export type SpecResult = SpecInput & { tokens: number; factor: number; verdict: Verdict };

export function speculativeGain(values: SliderValues): SpecResult {
  const input = specInput(values);
  return {
    ...input,
    tokens: expectedTokens(input.acceptance, input.drafts),
    factor: walltimeFactor(input.acceptance, input.drafts, input.cost),
    verdict: verdict(walltimeFactor(input.acceptance, input.drafts, input.cost)),
  };
}

export const two = (value: number) => value.toFixed(2);

/** "What changed": which input moved, and what it did to tokens per step and the walltime factor. */
export function describeSpecChange(before: SliderValues, after: SliderValues): string {
  const a = speculativeGain(before);
  const b = speculativeGain(after);
  const result = `Expected tokens per target step went from ${two(a.tokens)} to ${two(b.tokens)} and the walltime factor from ${two(a.factor)} to ${two(b.factor)}, which is ${b.verdict}.`;
  const moved = [a.acceptance !== b.acceptance, a.drafts !== b.drafts, a.cost !== b.cost].filter(Boolean).length;
  if (moved === 0) return "Nothing changed: the settings are the same, so the gain is the same.";
  if (moved > 1) return result;
  if (a.acceptance !== b.acceptance) {
    return `${b.acceptance > a.acceptance ? "Raising" : "Lowering"} the acceptance rate from ${two(a.acceptance)} to ${two(b.acceptance)} ${b.acceptance > a.acceptance ? "keeps more of each draft" : "throws away more of each draft"}, so the draft costs the same but pays back ${b.acceptance > a.acceptance ? "more" : "less"}. ${result}`;
  }
  if (a.drafts !== b.drafts) {
    const more = b.drafts > a.drafts;
    return `${more ? "Drafting more" : "Drafting fewer"} tokens per step (${a.drafts} to ${b.drafts}) ${more ? "adds more tokens that may be kept, but each extra one also adds draft cost and is less likely to survive, since a token is only kept if every token before it was" : "saves draft cost but caps the tokens a step can produce"}. ${result}`;
  }
  const cheaper = b.cost < a.cost;
  return `${cheaper ? "Cutting" : "Raising"} the draft cost from ${two(a.cost)} to ${two(b.cost)} of a target step does not change the tokens kept per step, only the time spent drafting them. ${result}`;
}
