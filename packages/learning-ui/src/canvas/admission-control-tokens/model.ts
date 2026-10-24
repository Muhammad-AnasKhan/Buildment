// AI Engineering Interview course, chapter 11.8 "Admission control and
// capacity in tokens". The server has a KV capacity measured in tokens and
// admits a request only while the tokens already promised stay under a
// limit, a share of that capacity. The rest wait in a queue. A snapshot:
// nothing finishes while it is taken.

import type { SliderValues } from "../renderers/slider/types";

export type AdmissionInput = { arrivals: number; tokens: number; capacity: number; limit: number };

function pick(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

export function admissionInput(values: SliderValues): AdmissionInput {
  return {
    arrivals: pick(values.arrivals, 30, 0, Number.MAX_SAFE_INTEGER),
    tokens: pick(values.tokens, 16_384, 1, Number.MAX_SAFE_INTEGER),
    capacity: pick(values.capacity, 420_000, 0, Number.MAX_SAFE_INTEGER),
    limit: pick(values.limit, 90, 0, 100),
  };
}

export type Admission = AdmissionInput & {
  /** Tokens the server may promise: capacity x limit / 100. */
  limitTokens: number;
  /** floor(capacity x limit / tokens per request), capped at the arrivals. */
  admitted: number;
  queued: number;
  /** Tokens held by the admitted requests. */
  heldWith: number;
  /** Tokens needed if every arrival is let in: arrivals x tokens. */
  heldWithout: number;
  /** Tokens over capacity without control, or 0 when it fits. */
  overBy: number;
  fitsWithout: boolean;
};

export function admission(values: SliderValues): Admission {
  const input = admissionInput(values);
  const limitTokens = (input.capacity * input.limit) / 100;
  const admitted = Math.min(input.arrivals, Math.floor(limitTokens / input.tokens));
  const heldWithout = input.arrivals * input.tokens;
  return {
    ...input,
    limitTokens,
    admitted,
    queued: input.arrivals - admitted,
    heldWith: admitted * input.tokens,
    heldWithout,
    overBy: Math.max(0, heldWithout - input.capacity),
    fitsWithout: heldWithout <= input.capacity,
  };
}

const count = (value: number) => value.toLocaleString("en-US");

/** "What changed": which input moved, and what it did to admitted, queued and the no-control case. */
export function describeAdmissionChange(before: SliderValues, after: SliderValues): string {
  const a = admission(before);
  const b = admission(after);
  const now = `Now ${count(b.admitted)} are admitted and ${count(b.queued)} queued; without control, ${
    b.fitsWithout ? `all ${count(b.arrivals)} would fit` : `the server would be over capacity by ${count(b.overBy)} tokens`
  }.`;
  const moved = [a.arrivals !== b.arrivals, a.tokens !== b.tokens, a.capacity !== b.capacity, a.limit !== b.limit].filter(Boolean).length;
  if (moved === 0) return "Nothing changed: the same requests meet the same limit, so the same number are admitted.";
  if (moved > 1) return `Admitted went from ${count(a.admitted)} to ${count(b.admitted)} and queued from ${count(a.queued)} to ${count(b.queued)}. ${now}`;
  if (a.arrivals !== b.arrivals) {
    return b.arrivals > a.arrivals && a.admitted === b.admitted
      ? `Going from ${count(a.arrivals)} to ${count(b.arrivals)} arrivals added ${count(b.arrivals - a.arrivals)} to the queue and nobody to the server: the limit already allowed only ${count(a.admitted)}. ${now}`
      : `Going from ${count(a.arrivals)} to ${count(b.arrivals)} arrivals changed the queue from ${count(a.queued)} to ${count(b.queued)}, while the limit decides how many get in. ${now}`;
  }
  if (a.tokens !== b.tokens) {
    return `Each request holding ${count(b.tokens)} tokens instead of ${count(a.tokens)} changes how many fit under the ${count(b.limitTokens)}-token limit, from ${count(a.admitted)} to ${count(b.admitted)}, because longer requests use more of the capacity. ${now}`;
  }
  if (a.capacity !== b.capacity) {
    return `Going from ${count(a.capacity)} to ${count(b.capacity)} tokens of capacity moved the limit from ${count(a.limitTokens)} to ${count(b.limitTokens)} tokens, so admitted went from ${count(a.admitted)} to ${count(b.admitted)}. ${now}`;
  }
  return `Moving the admission limit from ${a.limit}% to ${b.limit}% of capacity changed the tokens the server will promise from ${count(a.limitTokens)} to ${count(b.limitTokens)}, so admitted went from ${count(a.admitted)} to ${count(b.admitted)}. ${b.limit < a.limit ? "A lower limit leaves more spare room for counting errors." : "A higher limit leaves less spare room for counting errors."} ${now}`;
}
