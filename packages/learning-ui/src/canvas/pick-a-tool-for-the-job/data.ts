import type { FactorSpec } from "../renderers/factor/types";

// Learn and Build with AI course, chapter 2.3 "Jobs, not tools".
// Three kinds of AI tool scored on four needs a study job can have. The leader
// changes with the job: the chat assistant leads when every need matters the
// same, the source notebook when staying inside your sources matters most, and
// the search tool when recent pages matter most. The scores are the course's
// own illustrative judgement, not measurements. See spec.md.
export const pickAToolForTheJob: FactorSpec = {
  kind: "factor",
  title: "Which kind of tool for this job?",
  purpose: "Change how much each need matters for your job, and see which kind of tool comes out ahead.",
  whatThisShows:
    "Three kinds of AI tool, each scored from 1 to 5 on four needs a study job can have. Each score is multiplied by how much that need matters for your job, and the results are added up. No kind of tool leads for every job.",
  options: [
    { id: "chat", name: "Chat assistant" },
    { id: "notebook", name: "Source notebook" },
    { id: "search", name: "Search with sources" },
  ],
  criteria: [
    { id: "sources", name: "Stays inside my sources", weight: 2, scores: { chat: 2, notebook: 5, search: 1 } },
    { id: "pictures", name: "Explains with pictures", weight: 2, scores: { chat: 4, notebook: 3, search: 2 } },
    { id: "recent", name: "Finds recent pages", weight: 2, scores: { chat: 2, notebook: 1, search: 5 } },
    { id: "talk", name: "Talks it through with me", weight: 2, scores: { chat: 5, notebook: 3, search: 2 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters a lot" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Leave every weight at 'Matters': the chat assistant leads with 26 points, against 24 for the source notebook and 20 for the search tool.",
    "Set only 'Stays inside my sources' to 'Matters a lot'. The source notebook takes the lead, 29 points to 28 for the chat assistant and 21 for the search tool.",
    "Set 'Finds recent pages' to 'Matters a lot' and the other three to 'Matters a little'. The search tool leads with 20 points, against 17 for the chat assistant and 14 for the source notebook.",
  ],
  limits:
    "The scores are the course's illustrative judgement of each kind of tool at the time of writing (checked 2026-10-24), not measurements. Tools change: a chat assistant that can search the web would score higher on recent pages. The model leaves out the three-question check. A tool that does not open for you, at your age, on your device, is no use to you, whatever its score.",
};
