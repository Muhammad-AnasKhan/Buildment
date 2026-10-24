export type FactorOption = { id: string; name: string };

export type FactorCriterion = {
  id: string;
  name: string;
  /** Starting weight. Must be one of the spec's weight levels. */
  weight: number;
  /** Score for each option id, on the spec's score scale. */
  scores: Record<string, number>;
};

export type WeightLevel = { value: number; label: string };

/**
 * A weighted-sum comparison the learner can change: flip how much one factor
 * matters and watch which option comes out ahead. Two or three options, three
 * to five criteria, two to four weight levels.
 */
export type FactorSpec = {
  kind: "factor";
  title: string;
  purpose: string;
  /** "What this shows": the model and the trade-off, in one or two sentences. */
  whatThisShows: string;
  options: FactorOption[];
  criteria: FactorCriterion[];
  weightLevels: WeightLevel[];
  scoreScale: { min: number; max: number };
  /** Unit for totals, plural, for example "points". */
  unit: string;
  tryThis: string[];
  limits: string;
};
