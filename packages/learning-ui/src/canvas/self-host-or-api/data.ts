import type { FactorSpec } from "../renderers/factor/types";

// AI Engineering Interview course, chapter 11.7 "Beyond one GPU, and choosing
// how to serve". Nour's team at Wadi Labs scores a hosted API and a
// self-hosted engine for its internal assistant. The scores and the default
// weights are the example's own judgement, not measurements. See spec.md.
export const selfHostOrApi: FactorSpec = {
  kind: "factor",
  title: "Self-host or call an API: change what matters",
  purpose: "See how the weight you give data control, cost, effort and speed to launch decides which way of serving wins.",
  whatThisShows:
    "Nour's team scored a hosted API and a self-hosted engine from 1 to 5 on five criteria, where a higher score is better for that option. Each score is multiplied by how much the criterion matters, and the results are added up. These scores are the example's own judgement.",
  options: [
    { id: "api", name: "Hosted API" },
    { id: "self", name: "Self-hosted engine" },
  ],
  criteria: [
    { id: "data", name: "Data stays in network", weight: 2, scores: { api: 2, self: 5 } },
    { id: "cost", name: "Low cost at volume", weight: 2, scores: { api: 2, self: 4 } },
    { id: "effort", name: "Low team effort", weight: 2, scores: { api: 5, self: 1 } },
    { id: "launch", name: "Fast to launch", weight: 2, scores: { api: 5, self: 2 } },
    { id: "control", name: "Latency and version control", weight: 2, scores: { api: 2, self: 5 } },
  ],
  weightLevels: [
    { value: 1, label: "Nice to have" },
    { value: 2, label: "Important" },
    { value: 3, label: "Very important" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Raise Data stays in network to 3. The self-hosted engine pulls ahead, 39 to 34, because it scores 5 where the hosted API scores 2.",
    "Keep that, then raise Low team effort and Fast to launch to 3. Now the hosted API leads, 44 to 42: two criteria it wins outweigh the one you raised first.",
  ],
  limits:
    "The scores and weights are the example's own judgement for one team and one assistant, and the model treats them as exact. It leaves out model quality, reliability, the contract terms of a particular provider and the break-even volume, which chapter 11.4 shows as a cost per million tokens. Real choices should rest on your own numbers, not on a score.",
};
