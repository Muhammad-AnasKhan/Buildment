import type { SequenceSpec } from "../renderers/sequence/types";

// Founder Interview course, chapter 4.2 "Clarify and say your assumptions".
// Mais asks two clarifying questions, learns that the drop is in new customers
// and that the delivery fee rose two months ago, says her assumption aloud, and
// her answer narrows. See spec.md.
export const clarifyTheCase: SequenceSpec = {
  kind: "sequence",
  title: "Two questions narrow Mais's answer",
  purpose: "See how asking two clarifying questions and saying one assumption aloud turns a wide question into a narrow answer.",
  summary:
    "The founder says that repeat orders fell from about 40 percent of customers to about 30 percent over two months. Mais says the question back in her own words. She asks whether the drop is in new or returning customers and learns that it is mostly in new customers. She asks what changed two months ago and learns that the delivery fee rose from 1 dollar to 2 dollars on small orders. She says her assumption aloud, and her answer narrows to the fee on a customer's second order.",
  actors: [
    { name: "Founder", sub: "the case" },
    { name: "Mais", sub: "you" },
    { name: "The facts", sub: "what the team knows" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "repeat orders fell",
      title: "The case",
      note: "The founder of a nine-person team that runs a food delivery app says: repeat orders fell from about 40 percent of customers to about 30 percent over two months. You start next week. What would you do?",
      chips: ["40% to 30%", "two months"],
    },
    {
      from: 1,
      to: 1,
      label: "say it back",
      title: "Say the question back",
      note: "Mais says it in her own words: so out of 100 customers who order, about 40 used to order again within 30 days, and now about 30 do. She is checking that she heard the right question. The founder says yes.",
    },
    {
      from: 1,
      to: 2,
      label: "new or returning?",
      title: "Clarifying question 1: who?",
      note: "Mais asks whether the drop is in new customers, in customers who have ordered before, or in both. The answer would change what she looks at first.",
    },
    {
      from: 2,
      to: 1,
      label: "mostly new",
      tone: "good",
      outcome: "narrows it",
      title: "The drop is in new customers",
      note: "Customers who ordered for the first time in the last two months are ordering a second time less often. Customers who joined earlier order at about the same rate as before.",
      chips: ["new customers", "older ones steady"],
    },
    {
      from: 1,
      to: 2,
      label: "what changed?",
      title: "Clarifying question 2: when?",
      note: "Mais asks whether anything changed in the app, the prices or the restaurants about two months ago. A change that lines up with the drop is the first thing to check.",
    },
    {
      from: 2,
      to: 1,
      label: "fee $1 to $2",
      tone: "warn",
      outcome: "a lead",
      title: "The delivery fee went up",
      note: "Two months ago the delivery fee on orders under 15 dollars went from 1 dollar to 2 dollars. This is a lead, not proof. Two things that happen at the same time are not always cause and effect.",
      chips: ["fee up, orders under $15"],
    },
    {
      from: 1,
      to: 1,
      label: "assume aloud",
      title: "Say the assumption",
      note: "Mais says: I will assume the fee is one cause, not the only one. I will also assume the restaurants and the delivery times did not change, and I would check that first. She names what she does not know.",
      chips: ["fee: one cause", "check the rest first"],
    },
    {
      from: 1,
      to: 0,
      label: "start with the fee",
      tone: "good",
      outcome: "narrow answer",
      title: "Now the answer is narrow",
      note: "She started with a question about the whole app. She now has a question about one fee, for new customers, on a second order. That is something she can compare options for in the next chapter.",
    },
  ],
  tryThis: [
    "Before step 4, predict what the founder will say about new and returning customers. Then check whether your guess changed what you would look at first.",
    "At step 7, find the assumption. What would Mais do if the founder said that the restaurants had changed too?",
  ],
  limits:
    "A real founder may not have these facts, and may say: I do not know, what do you assume? Then you assume aloud and go on. This canvas shows two questions. Ask at most three, and only questions whose answer would change what you do.",
};
