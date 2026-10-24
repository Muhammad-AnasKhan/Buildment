import type { FactorSpec } from "../renderers/factor/types";

// Building Habits That Last course, chapter 6.2 "Choose one habit, and the
// person you are becoming". Dina scores three possible first habits on four
// criteria. Every number matches the worked example in the chapter. See
// spec.md.
export const whichHabitFirst: FactorSpec = {
  kind: "factor",
  title: "Dina's first habit: change what matters",
  purpose: "See how the weight Dina gives each criterion changes which habit should come first.",
  whatThisShows:
    "Each habit has a score from 1 to 5 on four criteria, in Dina's own judgement. Each score is multiplied by how much that criterion matters to her this month, and the results are added up. Change one weight and the first habit can change.",
  options: [
    { id: "english", name: "English, daily" },
    { id: "sleep", name: "Sleep by 23:00" },
    { id: "walk", name: "10-minute walk" },
  ],
  criteria: [
    { id: "matters", name: "Matters most now", weight: 3, scores: { english: 5, sleep: 3, walk: 2 } },
    { id: "small", name: "Can be very small", weight: 2, scores: { english: 4, sleep: 2, walk: 5 } },
    { id: "anchor", name: "Has a clear anchor", weight: 2, scores: { english: 4, sleep: 4, walk: 3 } },
    { id: "helps", name: "Helps the rest of the day", weight: 1, scores: { english: 1, sleep: 5, walk: 3 } },
  ],
  weightLevels: [
    { value: 1, label: "Nice to have" },
    { value: 2, label: "Important" },
    { value: 3, label: "Very important" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Raise 'Helps the rest of the day' to very important, as if Dina's tired mornings were her biggest problem. Sleep by 23:00 moves to first, 36 points to 34.",
    "Set every weight to 1 (nice to have). English and sleep tie at 14 points: with equal weights, the scores alone cannot decide.",
    "Go back to the start and lower 'Matters most now' to 1. English still comes first, but only 1 point ahead of the walk.",
  ],
  limits:
    "The scores and weights are Dina's own judgement, and the model treats them as exact. A gap of one or two points means both habits are reasonable first choices. The model chooses only the first habit: the course's advice is to start one, and add the next when the first starts on most days without a push.",
};
