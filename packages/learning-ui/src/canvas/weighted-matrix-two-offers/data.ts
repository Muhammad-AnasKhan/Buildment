import type { FactorSpec } from "../renderers/factor/types";

// Decision-Making course, chapter 2.3 "Compare options with criteria".
// Every number matches the worked example in that chapter, so the canvas
// starts exactly where the learner's table ends. See spec.md.
export const weightedMatrixTwoOffers: FactorSpec = {
  kind: "factor",
  title: "Yousef's two offers: change what matters",
  purpose: "See how the weight you give each criterion changes which offer comes out ahead.",
  whatThisShows:
    "Each offer has a score from 1 to 5 on four criteria. Each score is multiplied by how much that criterion matters to Yousef, and the results are added up. Change one weight and every total that uses it moves.",
  options: [
    { id: "offer-a", name: "Offer A" },
    { id: "offer-b", name: "Offer B" },
  ],
  criteria: [
    { id: "pay", name: "Pay", weight: 3, scores: { "offer-a": 5, "offer-b": 3 } },
    { id: "power-hours", name: "Power hours", weight: 3, scores: { "offer-a": 2, "offer-b": 4 } },
    { id: "learning", name: "Learning", weight: 2, scores: { "offer-a": 2, "offer-b": 4 } },
    { id: "future-work", name: "Future work", weight: 2, scores: { "offer-a": 3, "offer-b": 3 } },
  ],
  weightLevels: [
    { value: 1, label: "Nice to have" },
    { value: 2, label: "Important" },
    { value: 3, label: "Very important" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Set Power hours to 1, as if Yousef's power supply became steady. The gap closes to a tie at 27 points.",
    "Set Pay to 3 and the other three weights to 1. Now Offer A wins by 2 points: one criterion that matters a lot can beat several small ones.",
    "Set every weight to 1. Offer B still wins, 14 to 12, because it scores well on more criteria.",
  ],
  limits:
    "The scores and weights are Yousef's own judgment, and the model treats them as exact. It does not check must-haves (both offers already pass them), and it cannot warn you about a criterion you left off the list. A gap of one or two points means both offers are reasonable.",
};
