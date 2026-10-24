import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// AI Engineering Interview course, chapter 2.4 "Prompts, sampling and
// structured outputs". The ticket sorter from that chapter is about to write
// the category word for one borderline message. Four candidate words with
// fixed example scores; probabilities are softmax(score / temperature).
// Below 0.05 the sampler is greedy, so nothing divides by zero. See spec.md.

export const CANDIDATES = [
  { word: "bundle", score: 3 },
  { word: "billing", score: 2 },
  { word: "network", score: 1 },
  { word: "other", score: 0 },
] as const;

/** Temperatures below this are treated as greedy: all probability on the top word. */
export const GREEDY_BELOW = 0.05;
const DEFAULT_TEMPERATURE = 0.9;

export type Sampling = {
  temperature: number;
  greedy: boolean;
  /** One probability per candidate, in CANDIDATES order, summing to 1. */
  probabilities: number[];
  /** Chance that two independent runs pick different words: 1 minus the sum of squares. */
  disagree: number;
};

export function sampling(temperature: unknown): Sampling {
  const t = typeof temperature === "number" && Number.isFinite(temperature) ? Math.max(0, temperature) : DEFAULT_TEMPERATURE;
  if (t < GREEDY_BELOW) {
    return { temperature: t, greedy: true, probabilities: CANDIDATES.map((_, i) => (i === 0 ? 1 : 0)), disagree: 0 };
  }
  // Subtract the top score before exp() so a small temperature cannot overflow.
  const top = Math.max(...CANDIDATES.map((c) => c.score));
  const weights = CANDIDATES.map((c) => Math.exp((c.score - top) / t));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const probabilities = weights.map((w) => w / total);
  const disagree = 1 - probabilities.reduce((sum, p) => sum + p * p, 0);
  return { temperature: t, greedy: false, probabilities, disagree: Math.max(0, disagree) };
}

/** Whole percent, with "under 1%" for a chance that is small but not zero. */
export function chance(p: number): string {
  if (p > 0 && p < 0.005) return "under 1%";
  return `${Math.round(p * 100)}%`;
}

const temp = (t: number) => String(Number(t.toFixed(2)));

function computeSampling(values: SliderValues): SliderResult {
  const s = sampling(values.temperature);
  const [top, , , last] = s.probabilities;
  return {
    stats: [
      { label: "Chance of bundle", value: chance(top!), detail: "the top-scoring word" },
      { label: "Chance of other", value: chance(last!), detail: "the lowest-scoring word" },
      { label: "Two runs disagree", value: chance(s.disagree), detail: "same message, run twice" },
    ],
    bars: CANDIDATES.map((c, i) => ({
      label: `${c.word} (score ${c.score})`,
      value: s.probabilities[i]!,
      display: chance(s.probabilities[i]!),
    })),
    barMax: 1,
    summary: s.greedy
      ? "At temperature 0 the sampler always takes the top word, bundle, so every run gives the same category."
      : `At temperature ${temp(s.temperature)}, bundle has a ${chance(top!)} chance, billing ${chance(s.probabilities[1]!)}, network ${chance(s.probabilities[2]!)} and other ${chance(last!)}. Two runs disagree ${chance(s.disagree)} of the time.`,
  };
}

export function describeSamplingChange(before: SliderValues, after: SliderValues): string {
  const a = sampling(before.temperature);
  const b = sampling(after.temperature);
  if (a.temperature === b.temperature) return "Nothing changed: the same temperature gives the same probabilities.";
  const from = temp(a.temperature);
  const to = temp(b.temperature);
  if (b.greedy) {
    return `At temperature ${to} the sampler stops sampling and always takes the top word, so bundle goes from ${chance(a.probabilities[0]!)} to 100% and two runs never disagree.`;
  }
  if (b.temperature < a.temperature) {
    return `Lowering the temperature from ${from} to ${to} widened the gaps between the scores, so bundle rose from ${chance(a.probabilities[0]!)} to ${chance(b.probabilities[0]!)} and two runs now disagree ${chance(b.disagree)} of the time.`;
  }
  return `Raising the temperature from ${from} to ${to} shrank the gaps between the scores, so bundle fell from ${chance(a.probabilities[0]!)} to ${chance(b.probabilities[0]!)} and the unlikely other went from ${chance(a.probabilities[3]!)} to ${chance(b.probabilities[3]!)}.`;
}

export const samplingTemperature: SliderSpec = {
  kind: "slider",
  title: "How temperature reshapes the next word",
  purpose: "Move the temperature and watch the chances of four candidate words change for the same message.",
  intro:
    "The ticket sorter reads a borderline message, 'My data bundle was charged twice this month', and is about to write the category word. The model gives four candidate words example scores: bundle 3, billing 2, network 1 and other 0. The sampler divides each score by the temperature and turns the results into chances that add up to 100%. The sorter was left at temperature 0.9. Predict how often it picks a word other than bundle.",
  inputs: [{ id: "temperature", label: "Temperature", min: 0, max: 2, step: 0.05, default: DEFAULT_TEMPERATURE, unit: "" }],
  compute: computeSampling,
  describeChange: describeSamplingChange,
  barsTitle: "Chance of each next word",
  tryThis: [
    "Lower the temperature from 0.9 to 0.2. Bundle rises from 68% to 99%, and two runs disagree only 1% of the time.",
    "Raise the temperature to 2. Bundle falls to 46% and other, the worst fit, rises from 2% to 10%.",
  ],
  limits:
    "Four whole words with made-up scores stand in for a vocabulary of many thousands of tokens. Real samplers often add top-p or top-k cut-offs, and real scores change with every word already written. Below 0.05 the model treats the temperature as 0 and always takes the top word.",
};
