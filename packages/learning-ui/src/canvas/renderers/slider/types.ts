import type { Tone } from "../../primitives/tones";

/** One numeric control. Every input has a range, a step, a default and a unit. */
export type SliderInput = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** Shown after the value, for example "tokens", "ms" or "%". */
  unit: string;
};

export type SliderValues = Record<string, number>;

/** A number the learner needs first, shown as a card above the controls. */
export type SliderStat = {
  label: string;
  /** Already formatted, for example "0.67" or "$1,240". */
  value: string;
  detail?: string;
};

/** A horizontal bar. Bars in one result share a scale, so lengths compare. */
export type SliderBar = {
  label: string;
  value: number;
  /** Already formatted value text drawn at the end of the bar. */
  display: string;
  /** Colour only when it means something: good, warn or bad. Defaults to neutral. */
  tone?: Tone;
};

export type SliderResult = {
  stats: SliderStat[];
  bars?: SliderBar[];
  /** Upper end of the bar scale. Defaults to the largest bar value. */
  barMax?: number;
  /** One plain sentence describing the whole result, for screen readers. */
  summary: string;
};

/**
 * A small numeric model with two to four sliders: change an input and watch
 * the outputs and bars recalculate, with a sentence that explains the change.
 * compute and describeChange are pure functions of the input values, kept in
 * the canvas's data.ts and covered by unit tests.
 */
export type SliderSpec = {
  kind: "slider";
  title: string;
  /** One sentence shown under the title. */
  purpose: string;
  /** The scenario and the question to predict, shown above the numbers. */
  intro: string;
  inputs: SliderInput[];
  compute: (values: SliderValues) => SliderResult;
  /** "What changed": the delta in words, from the old values to the new ones. */
  describeChange: (before: SliderValues, after: SliderValues) => string;
  /** Heading over the bars, for example "Monthly cost by part". */
  barsTitle?: string;
  tryThis: string[];
  limits: string;
};
