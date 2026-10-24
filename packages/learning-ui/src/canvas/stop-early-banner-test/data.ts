import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 3.4 "Small experiments".
// Nadine's banner test, day by day and week by week: B leads 9 to 4 on
// Wednesday, the lead swings, and after the planned four weeks B leads only
// 66 to 61. Every number matches the chapter. See spec.md.
export const stopEarlyBannerTest: SequenceSpec = {
  kind: "sequence",
  title: "Should Nadine stop on Wednesday?",
  purpose: "Follow an A/B test day by day to the end of the plan, and see how an early lead shrinks and even swings the other way.",
  summary:
    "Nadine plans four whole weeks with orders per 100 visitors as the measure. On Wednesday banner B leads 9 orders to 4. The lead shrinks to 18 to 15 after week 1 and 33 to 31 after week 2, banner A leads 47 to 46 after week 3, and the test ends 66 to 61 for B: about 3 orders in every 100 visitors for both, a hint and not a win.",
  actors: [
    { name: "Nadine", sub: "shop owner" },
    { name: "Banner A", sub: "collection photo" },
    { name: "Banner B", sub: "free delivery" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "write the plan",
      title: "Plan before the first visitor",
      note: "Measure: completed orders for every 100 visitors. Length: four whole weeks, Monday to Sunday. Each visitor sees banner A or B by chance. The end date does not move.",
      chips: ["orders per 100 visitors", "4 whole weeks"],
    },
    {
      from: 2,
      to: 0,
      label: "Mon: B 3, A 1",
      title: "Monday",
      note: "Orders so far: B 3, A 1.",
    },
    {
      from: 2,
      to: 0,
      label: "Tue: B 6, A 2",
      title: "Tuesday",
      note: "Orders so far: B 6, A 2.",
    },
    {
      from: 2,
      to: 0,
      label: "Wed: B 9, A 4",
      tone: "warn",
      outcome: "stop now?",
      title: "Wednesday evening",
      note: "B has more than twice as many orders. Nadine wants to stop and use B. Thirteen orders is a tiny number, and the plan says four weeks.",
    },
    {
      from: 2,
      to: 0,
      label: "Week 1: B 18, A 15",
      title: "End of week 1",
      note: "The lead has shrunk from 5 orders to 3.",
    },
    {
      from: 2,
      to: 0,
      label: "Week 2: B 33, A 31",
      title: "End of week 2",
      note: "B is ahead by only 2 orders.",
    },
    {
      from: 1,
      to: 0,
      label: "Week 3: A 47, B 46",
      tone: "warn",
      outcome: "lead swings",
      title: "End of week 3",
      note: "Now banner A is ahead by one. Early leads move with luck. Stopping on any of these days would have given a different winner.",
    },
    {
      from: 2,
      to: 0,
      label: "Week 4: B 66, A 61",
      tone: "good",
      outcome: "plan ends",
      title: "End of week 4: the planned end",
      note: "About 2,100 visitors saw each banner. Both sold to about 3 visitors in every 100. B is ahead by 5 orders in four weeks, just over one a week, which is small enough to be luck.",
      chips: ["about 3 in 100 each", "gap: 5 orders"],
    },
    {
      from: 0,
      to: 0,
      label: "read it",
      title: "A hint, not a win",
      note: "Both banners cost the same, so Nadine keeps B but does not claim it raised sales. Next month she will test a bigger change, a new photo on the product pages.",
    },
  ],
  tryThis: [
    "On Wednesday B leads 9 to 4. Before you step on, predict: should Nadine stop the test now and choose B?",
    "Find the week when banner A was ahead. What would Nadine have told her friends if she had stopped then?",
  ],
  limits:
    "The daily and weekly counts are one example run. Real tests swing in different ways, but the pattern is common: small early counts move a lot, and the counts settle as they grow. Four weeks with about 3 orders per 100 visitors is still a small test for a small difference, so the end result is a hint. The canvas shows when to stop, not how many visitors a test needs.",
};
