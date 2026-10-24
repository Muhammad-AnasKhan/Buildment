import type { FactorSpec } from "../renderers/factor/types";

// Steady Hearts course (faith-and-resilience), chapter 5.2 "Take the means of
// knowing". Rania's two permissible job offers, scored from 1 to 5 on five
// things that matter in her choice. The scores are Rania's own judgement in the
// chapter, not measurements. Every weight starts at "Matters", where the two
// offers tie: the canvas never decides for her, it shows that the leader
// changes with what matters most. See spec.md.
export const raniaTwoOffers: FactorSpec = {
  kind: "factor",
  title: "Rania's two offers: what matters most?",
  purpose: "Change how much each thing matters and watch whether the same offer stays ahead.",
  whatThisShows:
    "Two allowed offers, each scored by Rania from 1 to 5 on five things. Each score is multiplied by how much that thing matters, and the results are added up. With every weight the same, the offers tie: the facts alone do not choose. What leads depends on what matters most to the person choosing.",
  options: [
    { id: "ngo", name: "NGO data assistant" },
    { id: "startup", name: "Startup contract" },
  ],
  criteria: [
    { id: "steady", name: "Steady income", weight: 2, scores: { ngo: 5, startup: 2 } },
    { id: "pay", name: "Monthly pay", weight: 2, scores: { ngo: 3, startup: 5 } },
    { id: "learning", name: "Learning", weight: 2, scores: { ngo: 2, startup: 4 } },
    { id: "evenings", name: "Free evenings", weight: 2, scores: { ngo: 5, startup: 2 } },
    { id: "days", name: "Days and travel", weight: 2, scores: { ngo: 2, startup: 4 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters a lot" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Before you change anything, predict: if steady income matters most to one person and learning matters most to another, will the same offer lead for both?",
    "Raise Steady income to 'Matters a lot'. The NGO job leads, 39 to 36. Put it back and raise Learning instead: now the startup contract leads, 38 to 36.",
    "Set Rania's own weights from the chapter: Steady income and Learning 'Matters a lot', Days and travel 'Matters a little', the other two 'Matters'. The NGO job leads by only 3 points, 39 to 36: close enough that both offers are reasonable.",
  ],
  limits:
    "The scores are Rania's own judgement for her situation, not measurements, and someone else could score the same facts differently. The model cannot check whether an option is allowed (both of these are), cannot see the future, and leaves out anything not on the list. A gap of a few points means both options are reasonable. It is a tool for seeing your priorities before you consult people and pray istikhara, not a judge that makes the decision.",
};
