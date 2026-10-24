import type { SliderInput, SliderSpec, SliderValues } from "./types";

// Input handling for the slider canvas. Pure: a value from the page, a URL or a
// test always lands on the input's range and step before the model sees it,
// so compute() never receives NaN, infinity or an out-of-range number.

export function defaultValues(spec: SliderSpec): SliderValues {
  return Object.fromEntries(spec.inputs.map((input) => [input.id, snapValue(input, input.default)]));
}

/** The nearest allowed value: clamped to [min, max] and rounded to the step. */
export function snapValue(input: SliderInput, value: number): number {
  if (!Number.isFinite(value)) return input.default;
  const clamped = Math.max(input.min, Math.min(input.max, value));
  const steps = Math.round((clamped - input.min) / input.step);
  const snapped = input.min + steps * input.step;
  // Round away floating-point noise such as 0.30000000000000004.
  const decimals = Math.max(0, (String(input.step).split(".")[1] ?? "").length);
  return Number(Math.min(input.max, snapped).toFixed(decimals));
}

export function withValue(spec: SliderSpec, values: SliderValues, id: string, value: number): SliderValues {
  const input = spec.inputs.find((item) => item.id === id);
  if (!input) return values;
  return { ...values, [id]: snapValue(input, value) };
}

export function isDefault(spec: SliderSpec, values: SliderValues): boolean {
  const initial = defaultValues(spec);
  return spec.inputs.every((input) => values[input.id] === initial[input.id]);
}

/** Bar width as a share of the scale, always between 0 and 100. */
export function barPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}
