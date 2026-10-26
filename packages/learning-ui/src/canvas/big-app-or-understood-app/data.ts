import type { FactorSpec } from "../renderers/factor/types";

// Learn and Build with AI course, chapter 1.8 "Plenty of AI, few strong projects".
// Khaled's 14-feature store built in a weekend against Yara's small, understood
// first slice of Qasir, scored on what a reviewer checks. Only when "Number of
// features" matters most does the big app win. The scores are the course's own
// illustrative judgement; checked totals are in spec.md.
export const bigAppOrUnderstoodApp: FactorSpec = {
  kind: "factor",
  title: "A big app or an understood app?",
  purpose: "Be the reviewer: change how much each check matters, and find the only settings where the big app wins.",
  whatThisShows:
    "Khaled's weekend store and Yara's first slice of Qasir, each scored from 1 to 5 on five things a reviewer checks. Each score is multiplied by how much that check matters, and the results are added up. Speed of building no longer separates projects; understanding does.",
  options: [
    { id: "store", name: "Khaled's weekend store" },
    { id: "qasir", name: "Yara's Qasir slice" },
  ],
  criteria: [
    { id: "works", name: "Works when tried", weight: 3, scores: { store: 3, qasir: 4 } },
    { id: "explain", name: "Can explain every part", weight: 3, scores: { store: 1, qasir: 5 } },
    { id: "failure", name: "Handles a failure", weight: 2, scores: { store: 2, qasir: 4 } },
    { id: "choices", name: "Choices written down", weight: 2, scores: { store: 1, qasir: 4 } },
    { id: "features", name: "Number of features", weight: 1, scores: { store: 5, qasir: 1 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters a lot" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Set 'Number of features' to 'Matters a lot' and the other four to 'Matters a little'. Khaled's store wins, 22 points to 20: this is one of only two settings where it leads.",
    "Keep that, then set 'Can explain every part' to 'Matters'. Yara's slice leads again, 25 points to 23.",
    "Set every weight to 'Matters a little'. Yara's slice leads, 18 points to 12.",
  ],
  limits:
    "The scores are the course's illustrative judgement for two example projects, not measurements. Real reviewers weigh things differently, and some clients really do need many features soon. The model leaves out how the project looks and how well it is presented, and a small project still has to do something useful.",
};
