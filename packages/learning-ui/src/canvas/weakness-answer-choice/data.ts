import type { FactorSpec } from "../renderers/factor/types";

// The Founder Interview course, chapter 6.3 "A real weakness with a plan".
// Nour compares three answers to "What is your weakness?": the humblebrag
// ("I am a perfectionist"), a real weakness with no plan, and a real weakness
// with an example and a plan. Scores are her own judgment. With every weight at
// 1 the real weakness with a plan leads; when "feels safe to say" becomes
// very important, the humblebrag passes it. See spec.md.
export const weaknessAnswerChoice: FactorSpec = {
  kind: "factor",
  title: "Nour's weakness answer: change what matters",
  purpose: "See why many people choose the safe answer, and what the other answers offer.",
  whatThisShows:
    "Each answer has a score from 1 to 5 on four questions. Each score is multiplied by how much that question matters, and the results are added up. All four questions start equal. These scores are this example's: they are Nour's own judgment, and yours would differ. Feeling safe is the only question where the humblebrag scores best.",
  options: [
    { id: "humblebrag", name: "Perfectionist" },
    { id: "real-no-plan", name: "Real, no plan" },
    { id: "real-plan", name: "Real, with plan" },
  ],
  criteria: [
    { id: "honest", name: "Honest", weight: 1, scores: { humblebrag: 2, "real-no-plan": 5, "real-plan": 5 } },
    { id: "matters", name: "Matters for the work", weight: 1, scores: { humblebrag: 2, "real-no-plan": 4, "real-plan": 4 } },
    { id: "plan", name: "Shows what you do", weight: 1, scores: { humblebrag: 2, "real-no-plan": 1, "real-plan": 5 } },
    { id: "safe", name: "Feels safe to say", weight: 1, scores: { humblebrag: 5, "real-no-plan": 1, "real-plan": 2 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters a lot" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Before you change anything, predict which answer leads when all four questions are equal, and which two are close behind.",
    "Set Feels safe to say to Matters a lot. Now the humblebrag wins, 21 to 20. This is why people choose it: it feels safest in the moment.",
    "Keep Feels safe to say at Matters a lot and set Honest to Matters a lot. The real weakness with a plan leads again, 30 to 25.",
  ],
  limits:
    "The scores are Nour's own judgment, and the model treats them as exact. It is a simple illustration, and it cannot tell you which weakness to name. In one study of written answers by students, people reading the answers preferred a real weakness to a disguised strength. It was one study, not a study of real hiring.",
};
