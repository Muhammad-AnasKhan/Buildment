import type { FactorSpec } from "../renderers/factor/types";

// The Founder Interview course, chapter 5.2 "Choosing the story".
// Yazan compares three stories he could tell for "What is the best technical
// thing you have done?": his report job, a team project with fashionable tools
// where he wrote the tests, and a weekend project. Scores are his own judgment.
// With the starting weights the report job leads; only when impressive tools
// become very important does the team project pass it. See spec.md.
export const chooseTechnicalStory: FactorSpec = {
  kind: "factor",
  title: "Yazan's story: change what matters",
  purpose: "See how the weight you give each question changes which technical story comes out ahead.",
  whatThisShows:
    "Each story has a score from 1 to 5 on five questions. Each score is multiplied by how much that question matters, and the results are added up. The report job was Yazan's own decision and he can explain it five whys deep. The team project has the most impressive tools.",
  options: [
    { id: "report-job", name: "Report job" },
    { id: "team-project", name: "Team project" },
    { id: "weekend-app", name: "Weekend app" },
  ],
  criteria: [
    { id: "own-decision", name: "My own decision", weight: 3, scores: { "report-job": 5, "team-project": 3, "weekend-app": 4 } },
    { id: "five-whys", name: "I can explain five whys", weight: 2, scores: { "report-job": 5, "team-project": 3, "weekend-app": 3 } },
    { id: "result", name: "Result or honest gap", weight: 2, scores: { "report-job": 4, "team-project": 3, "weekend-app": 1 } },
    { id: "recent", name: "Recent", weight: 1, scores: { "report-job": 2, "team-project": 5, "weekend-app": 4 } },
    { id: "tools", name: "Impressive tools", weight: 1, scores: { "report-job": 1, "team-project": 5, "weekend-app": 3 } },
  ],
  weightLevels: [
    { value: 1, label: "Nice to have" },
    { value: 2, label: "Important" },
    { value: 3, label: "Very important" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Before you change anything, predict which story leads. The report job leads with 36 points, against 31 for the team project and 27 for the weekend app.",
    "Set Impressive tools to Very important. Now the team project wins, 41 to 38. This is the trap: the story with the best tools is the one Yazan can defend least.",
    "Put Impressive tools back to Nice to have and set I can explain five whys to Very important. The report job leads by 7 points, 41 to 34.",
  ],
  limits:
    "The scores are Yazan's own judgment, and the model treats them as exact. It is a simple illustration: it cannot see a story you left off the list, and a gap of one or two points means two stories could both work. The point is not the totals. It is that the weight you give to impressive tools can change which story you choose.",
};
