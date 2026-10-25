import type { FactorSpec } from "../renderers/factor/types";

// Course 13 v2, chapter 1.7 "Fewer people, more work". Rawan (fictional) leads
// a small agency and can keep one more engineer. Three fictional teammates are
// scored from 1 to 5 on what a smaller team needs. Only when raw output alone
// matters does the fastest teammate win. The scores are the
// course's own illustrative judgement; checked totals are in spec.md.
export const whoTheSmallerTeamKeeps: FactorSpec = {
  kind: "factor",
  title: "Who does a smaller team keep?",
  purpose: "Be Rawan: change how much each habit matters to her, and find the only settings where the engineer who ships the most wins.",
  whatThisShows:
    "Omar, Sana and Mazen, three fictional engineers, each scored from 1 to 5 on five things a smaller team needs. Each score is multiplied by how much that habit matters, and the results are added up. Raw output is easy to get with AI now; context, checking, ownership and teamwork are what separate people.",
  options: [
    { id: "omar", name: "Omar: ships most" },
    { id: "sana", name: "Sana: checks, owns" },
    { id: "mazen", name: "Mazen: steady helper" },
  ],
  criteria: [
    { id: "output", name: "Raw output", weight: 1, scores: { omar: 5, sana: 2, mazen: 3 } },
    { id: "context", name: "Gives AI the context", weight: 2, scores: { omar: 3, sana: 4, mazen: 3 } },
    { id: "checks", name: "Checks the result", weight: 3, scores: { omar: 2, sana: 5, mazen: 3 } },
    { id: "owns", name: "Owns the outcome", weight: 3, scores: { omar: 3, sana: 5, mazen: 4 } },
    { id: "team", name: "Works with others", weight: 2, scores: { omar: 3, sana: 4, mazen: 4 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters a lot" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Start with Rawan's weights: raw output 'Matters a little', context 'Matters', checking 'Matters a lot', ownership 'Matters a lot', teamwork 'Matters'. Sana leads with 48 points, Mazen has 38 and Omar 32.",
    "Set 'Raw output' to 'Matters a lot' and the other four to 'Matters a little'. Omar leads, 26 points to 24 for Sana and 23 for Mazen: one of only three settings where he leads.",
    "Keep that, then raise 'Gives AI the context' to 'Matters a lot'. Omar and Sana tie at 32, and Mazen has 29.",
    "Set every weight to 'Matters a little'. Sana leads with 20 points, Mazen has 17 and Omar 16.",
  ],
  limits:
    "The scores are the course's illustrative judgement for three fictional teammates, not measurements, and real people do not fit five numbers. A real choice also depends on the clients, the budget and the people already on the team. The model leaves out what each person is learning and how they grow.",
};
