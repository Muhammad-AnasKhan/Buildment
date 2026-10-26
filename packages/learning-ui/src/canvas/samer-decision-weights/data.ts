import type { FactorSpec } from "../renderers/factor/types";

// The Founder Interview course, chapter 1.4 "Decisions, trade-offs and what
// you would change". Samer's three options for bad delivery addresses, scored
// 1 to 5 on four criteria (a higher score is better on every criterion). The
// weights start as what mattered to him then. See spec.md.
export const samerDecisionWeights: FactorSpec = {
  kind: "factor",
  title: "Samer's choice: what mattered then?",
  purpose: "Change how much one thing mattered to Samer and see which option comes out ahead.",
  whatThisShows:
    "Samer had three ways to deal with bad delivery addresses. Each option has a score from 1 to 5 on four criteria. Each score is multiplied by how much that criterion mattered to him then, and the results are added up. Change one weight and the choice can change. This is why a decision story must say what mattered at the time.",
  options: [
    { id: "block", name: "Block the order" },
    { id: "flag", name: "Flag it for dispatch" },
    { id: "hand", name: "Fix by hand each morning" },
  ],
  criteria: [
    { id: "orders", name: "No lost orders", weight: 3, scores: { block: 1, flag: 4, hand: 4 } },
    { id: "calls", name: "Driver calls saved", weight: 3, scores: { block: 5, flag: 3, hand: 2 } },
    { id: "build", name: "Quick to build", weight: 1, scores: { block: 1, flag: 3, hand: 5 } },
    { id: "work", name: "Little dispatch work", weight: 2, scores: { block: 3, flag: 2, hand: 1 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters most" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Set No lost orders to Matters a little, as if dispatch said a blocked order could always be rescued. Blocking wins, 23 points to 20.",
    "Put No lost orders back to Matters most and set Quick to build to Matters most. Fixing by hand now edges ahead, 35 points to 34, because it needs no building at all.",
    "Set every weight to Matters a little. Flagging and fixing by hand tie at 12 points. When nothing matters more than anything else, the numbers cannot choose for you.",
  ],
  limits:
    "The scores and weights are Samer's own judgements in this example, and the model treats them as exact. It cannot warn you about a criterion you left off the list, and a gap of one or two points means the options are close. A real decision also depends on facts the table does not hold, such as what dispatch said and how many days Samer had.",
};
