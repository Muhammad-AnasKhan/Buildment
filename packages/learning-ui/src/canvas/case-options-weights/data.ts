import type { FactorSpec } from "../renderers/factor/types";

// Founder Interview course, chapter 4.3 "Options and trade-offs".
// Mais has narrowed the case to new customers and the delivery fee. She compares
// three options on cost, time, risk and what she learns. Every score and weight
// matches the worked example in the chapter. The winner depends on what matters
// most this month: raising the weight of cost, or lowering the weight of time
// this month, changes it. See spec.md.
export const caseOptionsWeights: FactorSpec = {
  kind: "factor",
  title: "Mais's three options: change what matters this month",
  purpose: "See how the weight you give cost, time, risk and learning changes which option comes out ahead.",
  whatThisShows:
    "Each option has a score from 1 to 5 on four questions, where 5 is the better side (low cost, fast, low risk, a lot learned). Each score is multiplied by how much that question matters this month, and the results are added up. Change one weight and every total that uses it moves.",
  options: [
    { id: "fee", name: "Lower the fee" },
    { id: "ask", name: "Ask ten lost customers" },
    { id: "loyalty", name: "Loyalty discount" },
  ],
  criteria: [
    { id: "cost", name: "Low cost", weight: 2, scores: { fee: 2, ask: 5, loyalty: 2 } },
    { id: "time", name: "Fast this month", weight: 3, scores: { fee: 5, ask: 3, loyalty: 2 } },
    { id: "risk", name: "Low risk", weight: 2, scores: { fee: 2, ask: 4, loyalty: 3 } },
    { id: "learn", name: "What you learn", weight: 3, scores: { fee: 5, ask: 3, loyalty: 2 } },
  ],
  weightLevels: [
    { value: 1, label: "Nice to have" },
    { value: 2, label: "Important" },
    { value: 3, label: "Very important" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Before you change anything, predict the leader. With these weights, Lower the fee leads with 38 points, against 36 and 22.",
    "Set Low cost to Very important. Now Ask ten lost customers wins, 41 to 40: when money is tight, the cheap option comes first.",
    "Set Fast this month to Nice to have. Ask ten lost customers wins again, 30 to 28: the fee option was ahead mostly because it is quick.",
  ],
  limits:
    "The scores and weights are Mais's own judgment for this example, and the model treats them as exact. It cannot see an option you left off the list, and it cannot tell you whether the fee is really the cause. A gap of one or two points means two options are close, and the sensible answer is to say so and explain what would decide it.",
};
