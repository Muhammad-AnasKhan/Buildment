import type { FactorSpec } from "../renderers/factor/types";

// AI Engineering Interview course, chapter 6.4 "Workflows or agents: when not
// to use an agent". Tamer's team scores a fixed workflow and an autonomous
// agent for one kind of Bustan Books request. The scores and the default
// weights are the scenario's own judgment, not measurements. See spec.md.
export const workflowOrAgent: FactorSpec = {
  kind: "factor",
  title: "Workflow or agent: change what matters",
  purpose: "See how the weight you give predictability, cost and speed against new cases decides which design wins.",
  whatThisShows:
    "Tamer's team scored a fixed workflow and an autonomous agent from 1 to 5 on four criteria. Each score is multiplied by how much that criterion matters for the request, and the results are added up. The defaults are for 'Where is my order?' messages.",
  options: [
    { id: "workflow", name: "Fixed workflow" },
    { id: "agent", name: "Agent" },
  ],
  criteria: [
    { id: "predictability", name: "Predictability", weight: 3, scores: { workflow: 5, agent: 2 } },
    { id: "low-cost", name: "Low cost", weight: 2, scores: { workflow: 4, agent: 2 } },
    { id: "low-latency", name: "Low latency", weight: 3, scores: { workflow: 4, agent: 2 } },
    { id: "new-cases", name: "Handles new cases", weight: 1, scores: { workflow: 1, agent: 5 } },
  ],
  weightLevels: [
    { value: 1, label: "Nice to have" },
    { value: 2, label: "Important" },
    { value: 3, label: "Very important" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Raise Handles new cases to 3. The workflow still leads, 38 to 31: one criterion rarely outweighs three.",
    "Keep Handles new cases at 3, then set Predictability and Low cost to 1. Now the agent leads, 25 to 24, as for an open-ended request.",
    "Set every weight to 1. The workflow wins 14 to 11, because it scores higher on three of the four criteria.",
  ],
  limits:
    "The scores and weights are the team's example judgment for one kind of request, and the model treats them as exact. It leaves out risk, which needs approval steps in either design, and the router plus workflows that sits between the two. Real choices should rest on a golden set and traces, not on a score.",
};
