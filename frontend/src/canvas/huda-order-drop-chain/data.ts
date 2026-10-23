import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 1.2 "Chains of cause and effect".
// Huda's home bakery lost 20 of about 60 orders in one summer month. The chain
// runs back from the effect along its two biggest parts: 12 school orders lost
// to the holidays, and 4 regular orders lost to dry cakes, which needed two
// contributing causes together. See spec.md.
export const hudaOrderDropChain: StateMachineSpec = {
  kind: "state-machine",
  title: "Why did Huda's orders drop?",
  purpose: "Follow the two biggest parts of the drop back to their causes, and see two contributing causes meet.",
  summary:
    "Twenty orders are missing. Twelve school orders were lost because there were no class parties, because schools closed for the summer, which Huda cannot change. Four regular orders were lost because cakes came out dry, because the new oven runs 20 degrees Celsius hot and Huda kept her old baking times; she can change the baking times.",
  states: [
    { id: "missing", name: "20 orders missing", sub: "the effect", col: 0, row: 0 },
    { id: "parties", name: "No class parties", sub: "12 school orders", col: 1, row: 0 },
    { id: "holidays", name: "School holidays", sub: "cannot change", col: 2, row: 0 },
    { id: "dry", name: "Cakes come out dry", sub: "4 regular orders", col: 0, row: 1 },
    { id: "hot", name: "Oven runs hot", sub: "20 degrees Celsius", col: 1, row: 1 },
    { id: "times", name: "Old baking times", sub: "can change", col: 2, row: 1 },
  ],
  edges: [
    { from: "missing", to: "parties", label: "why" },
    { from: "parties", to: "holidays", label: "why" },
    { from: "missing", to: "dry", label: "why" },
    { from: "dry", to: "hot", label: "why" },
    { from: "hot", to: "times", label: "and" },
  ],
  steps: [
    {
      state: "missing",
      edge: 0,
      title: "Start with the effect and its biggest part",
      note: "Last month Huda got 40 orders, against about 60 in a normal month: 20 are missing. Twelve of them are school orders. Why did those stop?",
      chips: ["40 instead of 60", "12 school, 7 regular, 1 new"],
    },
    {
      state: "parties",
      edge: 1,
      title: "Direct cause: no class parties",
      note: "Teachers usually order cakes for class parties, and this month there were none. Why not?",
      chips: ["evidence: teachers' messages"],
    },
    {
      state: "holidays",
      tone: "warn",
      outcome: "cannot change",
      title: "Schools closed for the summer",
      note: "The school calendar shows it. Huda cannot change the holidays, so she stops here. She can still plan for next summer. Now go back to the second part: the regular orders.",
      chips: ["evidence: school calendar"],
    },
    {
      state: "missing",
      edge: 2,
      title: "The second part: regular orders",
      note: "Seven regular orders are missing. Four of those customers said their last cake was dry. Two mentioned the price and one was away; those small branches are left out here. Why were the cakes dry?",
      chips: ["4 of 7 said: dry cake"],
    },
    {
      state: "dry",
      edge: 3,
      title: "Direct cause: dry cakes",
      note: "Dry cakes cost Huda 4 regular orders. Why did the cakes come out dry? She puts a cheap thermometer inside the new oven.",
      chips: ["evidence: 4 customer messages"],
    },
    {
      state: "hot",
      edge: 4,
      title: "Contributing cause: the oven runs hot",
      note: "The new oven runs about 20 degrees Celsius hotter than its dial says. Is that the whole cause? Her old oven never made dry cakes with the same recipe and the same times.",
      chips: ["evidence: oven thermometer"],
    },
    {
      state: "times",
      tone: "good",
      outcome: "can act on",
      title: "Contributing cause: the old baking times",
      note: "Huda kept her old baking times. A hot oven with shorter times makes good cakes, and the old times made good cakes for years in the old oven. Together they made dry cakes. Shorter times are a change she can make today.",
      chips: ["two causes together", "fix: new baking times"],
    },
  ],
  tryThis: [
    "Before step 6, decide: is the hot oven the whole cause of the dry cakes? Check your prediction at step 7.",
    "At step 3, Huda stops at a cause she cannot change. What can she still do about it?",
  ],
  limits:
    "The canvas shows only the two biggest branches, 16 of the 20 missing orders. The price (2 orders), the customer who was away (1) and the one missing new customer are left out to keep it small. Every arrow here has evidence behind it; a real chain often still has some arrows that are guesses.",
};
