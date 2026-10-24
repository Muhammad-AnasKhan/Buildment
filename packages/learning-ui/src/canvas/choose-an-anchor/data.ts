import type { FactorSpec } from "../renderers/factor/types";

// Building Habits That Last course, chapter 2.4 "Anchor it to something you
// already do". Lina compares three anchors for her three sentences: after Fajr
// prayer and tea, when the power comes on, and after the evening meal. Every
// score and weight matches the worked example in that chapter. Power hours
// move week to week, so "Same time every day" scores 1 for that option, and
// lowering that weight changes the winner. See spec.md.
export const chooseAnAnchor: FactorSpec = {
  kind: "factor",
  title: "Lina's anchor: change what matters",
  purpose: "See how the weight you give each question about an anchor changes which anchor comes out ahead.",
  whatThisShows:
    "Each anchor has a score from 1 to 5 on four questions about a good anchor. Each score is multiplied by how much that question matters to Lina, and the results are added up. Her power hours move every week, so the power anchor scores 1 for happening at the same time every day.",
  options: [
    { id: "fajr-tea", name: "After Fajr and tea" },
    { id: "power-on", name: "When the power comes on" },
    { id: "evening-meal", name: "After the evening meal" },
  ],
  criteria: [
    { id: "same-time", name: "Same time every day", weight: 3, scores: { "fajr-tea": 5, "power-on": 1, "evening-meal": 4 } },
    { id: "right-place", name: "Right place", weight: 2, scores: { "fajr-tea": 3, "power-on": 5, "evening-meal": 3 } },
    { id: "clear-end", name: "Clear end moment", weight: 2, scores: { "fajr-tea": 5, "power-on": 5, "evening-meal": 2 } },
    { id: "free-minutes", name: "Free minutes after", weight: 2, scores: { "fajr-tea": 3, "power-on": 4, "evening-meal": 4 } },
  ],
  weightLevels: [
    { value: 1, label: "Nice to have" },
    { value: 2, label: "Important" },
    { value: 3, label: "Very important" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Before you change anything, predict which anchor leads with Lina's weights. After Fajr and tea leads with 37 points, against 31 and 30.",
    "Set Same time every day to Nice to have. Now When the power comes on wins, 29 to 27: the result depends on what matters most in your week.",
    "Set Free minutes after to Very important. After Fajr and tea still leads, 40 to 35 and 34.",
  ],
  limits:
    "The scores and weights are Lina's own judgment, and the model treats them as exact. It cannot see a problem she left off the list, such as an anchor that disappears on some days; chapter 2.4 adds a second anchor for those. A gap of one or two points means both anchors could work; the chapter explains why a moving anchor is weaker even when it wins on points.",
};
