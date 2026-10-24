import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";
import { describeSpecChange, speculativeGain, two } from "./model";

// AI Engineering Interview course, chapter 11.6 "Quantization, speculative
// decoding and FlashAttention". At acceptance 0.80, 4 draft tokens and a
// draft cost of 0.05 of a target step: (1 - 0.8^5) / (1 - 0.8) = 3.36 tokens
// per target step, and a walltime factor of 3.36 / 1.2 = 2.80. See spec.md.

export { describeSpecChange, expectedTokens, speculativeGain, walltimeFactor } from "./model";

const VERDICT_TEXT = { faster: "Faster", "about the same": "About the same", slower: "Slower" } as const;

function computeSpec(values: SliderValues): SliderResult {
  const r = speculativeGain(values);
  return {
    stats: [
      { label: "Tokens per target step", value: two(r.tokens), detail: `at most ${r.drafts + 1} (g + 1)` },
      { label: "Walltime improvement", value: `${two(r.factor)} times`, detail: "against plain decoding" },
      { label: "Verdict", value: VERDICT_TEXT[r.verdict], detail: `draft cost ${two(r.drafts * r.cost)} of a step per round` },
    ],
    bars: [
      { label: "Plain decoding", value: 1, display: "1.00" },
      { label: "With speculation", value: r.factor, display: two(r.factor), tone: r.verdict === "faster" ? "good" : r.verdict === "slower" ? "bad" : undefined },
    ],
    summary: `With acceptance ${two(r.acceptance)}, ${r.drafts} draft tokens per step and a draft cost of ${two(r.cost)} of a target step, each target step yields ${two(r.tokens)} tokens on average, which is ${two(r.factor)} times the speed of plain decoding: ${r.verdict}.`,
  };
}

export const speculativeDecodingGain: SliderSpec = {
  kind: "slider",
  title: "When speculative decoding pays off",
  purpose: "Change how often the target model accepts the draft and what the draft costs, and see the speed-up or slow-down.",
  intro:
    "A small draft model guesses g tokens, and the large target model checks them in a single step. Each guess is kept with probability a, and a guess only counts if every guess before it was kept. The target step then also yields one token of its own. The draft costs c of one target step for each token it guesses. The expected tokens per target step are (1 - a^(g+1)) / (1 - a), and the walltime factor divides that by (g c + 1). Before you move anything, predict the factor for a = 0.80, g = 4 and c = 0.05.",
  inputs: [
    { id: "acceptance", label: "Acceptance rate", min: 0.5, max: 0.95, step: 0.05, default: 0.8, unit: "" },
    { id: "drafts", label: "Draft tokens per step", min: 1, max: 10, step: 1, default: 4, unit: "tokens" },
    { id: "cost", label: "Draft cost per token", min: 0.01, max: 0.5, step: 0.01, default: 0.05, unit: "of a step" },
  ],
  compute: computeSpec,
  describeChange: describeSpecChange,
  barsTitle: "Speed against plain decoding",
  tryThis: [
    "Lower the acceptance rate from 0.80 to 0.50. Tokens per step fall from 3.36 to 1.94 and the factor from 2.80 to 1.61, so the same draft pays back much less.",
    "Raise the draft cost from 0.05 to 0.50 with acceptance 0.80 and 4 draft tokens. Tokens per step stay at 3.36 but the factor drops to 1.12, because drafting now takes 2 target steps of time.",
  ],
  limits:
    "This is the speculative decoding paper's idealised model: each token is accepted independently with the same probability, and the costs are fixed. Real gains depend on how busy the server is, on the task and on how well the draft model matches the target. A busy, compute-bound server gains less.",
};
