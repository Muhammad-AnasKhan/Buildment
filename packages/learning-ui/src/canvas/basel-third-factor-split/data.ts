import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 2.2 "Hidden third factors".
// Basel splits his class of 40 by study hours. Among students who study 10 or
// more hours a week, app users and others both average 80; most of the 9-mark
// gap came from who uses the app. See spec.md.
export const baselThirdFactorSplit: StateMachineSpec = {
  kind: "state-machine",
  title: "Where did the 9-mark gap come from?",
  purpose: "Split Basel's class by study hours and compare like with like, to see how much of the gap the app explains.",
  summary:
    "App users averaged 77 and the others 68. Among students who study 10 or more hours a week, both groups average 80. Fifteen of the 20 app users are in that group, but only 4 of the 20 others, so hard work pushes both app use and marks. Among students who study less, app users average 68 and others 65, but there are only 5 app users there, so that gap is a hint at most.",
  states: [
    { id: "whole", name: "Whole class", sub: "77 against 68", col: 0, row: 0 },
    { id: "heavy", name: "Study 10+ hours", sub: "80 against 80", col: 1, row: 0 },
    { id: "mix", name: "Who studies a lot", sub: "15 users, 4 others", col: 2, row: 0 },
    { id: "light", name: "Study less", sub: "68 against 65", col: 0, row: 1 },
    { id: "small", name: "Only 5 users", sub: "a hint at most", col: 1, row: 1 },
    { id: "factor", name: "Hard work", sub: "pushes both", col: 2, row: 1 },
  ],
  edges: [
    { from: "whole", to: "heavy", label: "10+ hours" },
    { from: "heavy", to: "mix", label: "count" },
    { from: "mix", to: "factor", label: "why" },
    { from: "whole", to: "light", label: "<10" },
    { from: "light", to: "small", label: "how many?" },
  ],
  steps: [
    {
      state: "whole",
      edge: 0,
      title: "The gap to explain",
      note: "The 20 app users averaged 77 on the midterm and the 20 others averaged 68: a gap of 9 marks. Basel splits the class by study hours. First, the students who study 10 or more hours a week.",
      chips: ["users: 77", "others: 68", "gap: 9"],
    },
    {
      state: "heavy",
      edge: 1,
      title: "Among heavy studiers: no gap",
      note: "App users in this group average 80. The other students in this group also average 80. Compared like with like, the gap is gone. So where did the 9 marks come from?",
      chips: ["users: 80", "others: 80"],
    },
    {
      state: "mix",
      edge: 2,
      title: "Count who is in the group",
      note: "Fifteen of the 20 app users study 10 or more hours a week. Only 4 of the 20 other students do. The app users were mostly hard workers to begin with.",
      chips: ["15 of 20 users", "4 of 20 others"],
    },
    {
      state: "factor",
      tone: "good",
      outcome: "third factor",
      title: "Hard work pushes both",
      note: "A student who works hard is more likely to use the app, and also studies more hours, which raises marks. Most of the 9-mark gap comes from who uses the app, not from the app itself.",
    },
    {
      state: "whole",
      edge: 3,
      title: "Now the students who study less",
      note: "Basel makes the same comparison for the students who study less than 10 hours a week.",
    },
    {
      state: "light",
      edge: 4,
      title: "Among light studiers: 68 against 65",
      note: "App users in this group average 68 and the others 65: a gap of 3 marks. Before reading anything into it, Basel counts how many students that is.",
      chips: ["users: 68", "others: 65", "gap: 3"],
    },
    {
      state: "small",
      tone: "warn",
      outcome: "a hint",
      title: "Five users is very few",
      note: "Only 5 app users are in this group. With so few students, a gap of 3 marks can come from luck. It is a hint at most: the app may help a little, or not at all.",
      chips: ["5 users, 16 others"],
    },
  ],
  tryThis: [
    "Before step 2, predict how app users and other students compare among those who study 10 or more hours a week.",
    "At step 3, check the averages: 15 x 80 plus 5 x 68 is 1,540, and 1,540 divided by 20 is 77.",
  ],
  limits:
    "Basel only split the class by one factor he could measure. Earlier marks and free time may also matter, and splitting by factors you thought of never covers the ones you did not. Letting chance decide who gets the app is the stronger test, which module 3 teaches. Study hours here are what students reported, so they are rough.",
};
