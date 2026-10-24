import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 1.4 "After is not because".
// Huda's notebook, week by week, tests two "it came first" claims: the new
// shop (the drop began two weeks before it opened) and the new oven (the
// timing fits, but only other evidence makes it likely). See spec.md.
export const afterIsNotBecauseTimeline: SequenceSpec = {
  kind: "sequence",
  title: "Did the drop come after the new shop?",
  purpose: "Walk through Huda's month week by week, then test two 'it came first' claims against the dates.",
  summary:
    "A normal week brings about 15 orders. In week 1 the school holidays start and the price goes up: 12 orders. In week 2, the first full week with the new oven: 9 orders. In week 3 the new shop opens: 10 orders. In week 4: 9 orders. The drop began two weeks before the shop opened and did not get worse after it, so timing does not support the shop. The oven's timing fits, which keeps it on the list, and other evidence makes it likely.",
  actors: [
    { name: "Events", sub: "what changed" },
    { name: "Orders", sub: "per week" },
    { name: "Huda", sub: "tests claims" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "week 1: holidays",
      title: "Week 1: holidays start, price goes up",
      note: "A normal week brings about 15 orders: about 3 from schools and 12 from home customers. This week brings 12. The 3 school orders are missing.",
      chips: ["normal: 15", "week 1: 12"],
    },
    {
      from: 0,
      to: 1,
      label: "week 2: new oven",
      title: "Week 2: first full week with the new oven",
      note: "The oven arrived at the end of week 1. Orders fall again, to 9.",
      chips: ["week 2: 9"],
    },
    {
      from: 0,
      to: 1,
      label: "week 3: new shop",
      title: "Week 3: the new shop opens",
      note: "The new bakery on the main road opens. Orders this week: 10.",
      chips: ["week 3: 10"],
    },
    {
      from: 0,
      to: 1,
      label: "week 4",
      title: "Week 4: nothing new",
      note: "Orders: 9. The month's total is 12 + 9 + 10 + 9 = 40.",
      chips: ["week 4: 9", "total: 40"],
    },
    {
      from: 2,
      to: 1,
      label: "test the shop",
      tone: "bad",
      outcome: "timing fails",
      title: "Test Khaled's claim: the new shop",
      note: "If the shop caused the drop, the orders should fall from week 3. They started falling in week 1, and weeks 3 and 4 were no worse than week 2. The timing does not support the shop.",
      chips: ["drop began in week 1", "no worse after week 3"],
    },
    {
      from: 2,
      to: 1,
      label: "test the oven",
      tone: "good",
      outcome: "fits, not proof",
      title: "Test Lina's claim: the new oven",
      note: "The oven arrived at the end of week 1, and home orders fell in week 2. The timing fits, but that only keeps the oven on the list. The thermometer and four customers' messages are what make it a likely cause.",
      chips: ["timing fits", "plus a 'how' and messages"],
    },
  ],
  tryThis: [
    "Before step 5, say in which week the orders should start to fall if the new shop were the cause.",
    "At step 6, list what besides timing makes the oven a likely cause.",
  ],
  limits:
    "Four weeks is a short record, and some causes act slowly: the new shop could still pull customers away over the coming months. Timing can rule a cause out of one month's drop, but timing that fits never proves a cause on its own.",
};
