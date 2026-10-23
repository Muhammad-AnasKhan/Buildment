import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 7.3 "Incentives and targets".
// Sawsan's support team: a bonus for the fastest close makes the number look
// good while the help clinics get gets worse; then a target with three
// measures and a team bonus. See spec.md.
export const targetLooksGood: SequenceSpec = {
  kind: "sequence",
  title: "A target that looks good while the work gets worse",
  purpose: "Follow a target and its reward through a support team, and see the number improve while the real work gets worse.",
  summary:
    "A manager rewards the agent with the fastest average time to close a ticket. Agents close tickets after one short reply. The average time falls from 40 hours to 14, but clinics write again: reopened tickets rise from 10 to 78 a week and the rating falls from 4.4 to 3.6. The manager adds two more measures and a team bonus, and after two months the help is better although the time to close is 22 hours.",
  actors: [
    { name: "Manager", sub: "sets the target" },
    { name: "Agents", sub: "5 people" },
    { name: "Clinics", sub: "the customers" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "bonus: close fast",
      title: "The target and the reward",
      note: "Close every ticket within 24 hours. Each month, the agent with the shortest average time to close gets a bonus. Everyone agrees it is fair.",
      chips: ["target: 24 hours", "bonus: fastest agent"],
    },
    {
      from: 1,
      to: 2,
      label: "one short reply",
      title: "The easiest path",
      note: "Closing a ticket is much quicker than solving the problem behind it. Many tickets are closed after one reply, such as 'Please restart the app and try again', with no check that it worked.",
    },
    {
      from: 1,
      to: 0,
      label: "avg 14 hours",
      tone: "good",
      outcome: "number looks good",
      title: "The number improves",
      note: "After a month, the average time to close falls from 40 hours to 14. The manager thanks the team in a message to the whole company.",
      chips: ["before: 40 hours", "after: 14 hours"],
    },
    {
      from: 2,
      to: 1,
      label: "same problem again",
      tone: "bad",
      outcome: "78 reopened a week",
      title: "The problems come back",
      note: "The clinics still have their problems, so they write again. Reopened tickets rise from 10 a week to 78 a week, and tickets received rise from 200 to 260 a week.",
      chips: ["reopened: 5 in 100, then 30 in 100"],
    },
    {
      from: 2,
      to: 0,
      label: "rating 3.6",
      tone: "bad",
      outcome: "work got worse",
      title: "The real work gets worse",
      note: "The customer rating falls from 4.4 to 3.6 out of 5, and two clinics phone Sawsan directly, angry. The number got better while the help got worse.",
    },
    {
      from: 0,
      to: 1,
      label: "3 measures, 1 team",
      title: "A target that is harder to push",
      note: "Time to close stays, but now it sits next to tickets reopened within seven days and the clinic's rating. The bonus goes to the whole team when all three are good. Sawsan also reads ten closed tickets every Friday.",
    },
    {
      from: 1,
      to: 2,
      label: "solve, then close",
      tone: "good",
      outcome: "help improves",
      title: "Slower on one number, better for the clinics",
      note: "After two months: 22 hours to close, about 6 reopened tickets in every 100, and a rating of 4.5. Two months is a short time, so Sawsan treats this as a hint and keeps watching all three numbers.",
    },
  ],
  tryThis: [
    "Before step 4, predict what happens to the number of tickets each week.",
    "At step 3, the manager sees only one number. Which other number would have shown him the problem?",
  ],
  limits:
    "This shows one team and one target over a few months, with numbers made for the example. Not every target goes wrong this way. The lesson is to expect people to aim at the number, use more than one measure and read real work, not to stop measuring.",
};
