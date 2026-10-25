import type { FactorSpec } from "../renderers/factor/types";

// Learn and Build with AI course, chapter 7.4 "Slow down for trade-offs".
// Where should Qasir count clicks: in the database on every click, or in a
// cache counter saved to the database every minute (the AI's suggestion)?
// The scores are Yara's own illustrative judgement for her project, and the
// starting weights are hers. The cache counter wins at exactly one setting of
// the weights. See spec.md for the checked totals.
export const twoOptionsTradeOff: FactorSpec = {
  kind: "factor",
  title: "Where should Qasir count clicks?",
  purpose: "Change how much each test matters, and see when the AI's suggestion comes out ahead and when Yara's facts pick the other option.",
  whatThisShows:
    "Two ways to count clicks, each scored from 1 to 5 on four tests. Each score is multiplied by how much that test matters, and the results are added up. The weights start at Yara's, from her project's facts: small shops and NGOs, a few hundred clicks a day on a busy link, one person building it.",
  options: [
    { id: "database", name: "Database on every click" },
    { id: "cache", name: "Cache, saved each minute" },
  ],
  criteria: [
    { id: "simple", name: "Simple to build", weight: 3, scores: { database: 5, cache: 2 } },
    { id: "fast", name: "Fast under many clicks", weight: 1, scores: { database: 2, cache: 5 } },
    { id: "no-loss", name: "No clicks lost if a part stops", weight: 3, scores: { database: 5, cache: 2 } },
    { id: "explain", name: "Easy to explain", weight: 2, scores: { database: 4, cache: 2 } },
  ],
  weightLevels: [
    { value: 1, label: "Matters a little" },
    { value: 2, label: "Matters" },
    { value: 3, label: "Matters a lot" },
  ],
  scoreScale: { min: 1, max: 5 },
  unit: "points",
  tryThis: [
    "Find the settings where the cache counter wins. Set 'Fast under many clicks' to 'Matters a lot' and the other three to 'Matters a little': it wins, 21 to 20. It is the only one of the 81 settings where it does.",
    "Now put 'No clicks lost if a part stops' first instead, with the rest at 'Matters a little'. The database wins, 26 to 15.",
    "Set every weight to 'Matters'. Counting in the database leads, 32 to 22.",
  ],
  limits:
    "The scores are Yara's judgement for one small project, not measurements. The real speed of each option depends on the database, the cache and the traffic, and the risk of lost clicks depends on how the cache is set up. A project with heavy traffic would score and weigh these tests differently, and that is the point: the facts set the weights.",
};
