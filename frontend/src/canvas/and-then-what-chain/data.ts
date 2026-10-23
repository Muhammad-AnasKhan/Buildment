import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 7.2 "And then what?".
// Hamza's bicycle repair shop: one branch of the consequence map for his sign
// "Repaired in one hour, or the repair is free", stepped from the decision to
// its first, second and third effects, where the chain turns into a loop.
// See spec.md.
export const andThenWhatChain: StateMachineSpec = {
  kind: "state-machine",
  title: "And then what? One branch of Hamza's map",
  purpose: "Step from a decision to its first, second and third effects, and see where the chain turns into a loop.",
  summary:
    "Hamza's sign promises every repair in one hour or free. First effect: Jawad works against the clock. Second effect: small mistakes. Third effect: bicycles come back. Returned bicycles make the queue grow, which puts more pressure on Jawad, so the chain becomes a loop. Hamza decides to watch how many bicycles come back within a week.",
  states: [
    { id: "sign", name: "Sign goes up", sub: "1 hour or free", col: 0, row: 0 },
    { id: "rush", name: "Jawad rushes", sub: "first effect", col: 1, row: 0 },
    { id: "mistakes", name: "Small mistakes", sub: "second effect", col: 2, row: 0 },
    { id: "back", name: "Bicycles come back", sub: "third effect", col: 2, row: 1 },
    { id: "queue", name: "Queue grows", sub: "more pressure", col: 1, row: 1 },
    { id: "watch", name: "Watch the returns", sub: "1 in 20 before", col: 0, row: 1 },
  ],
  edges: [
    { from: "sign", to: "rush", label: "then what?" },
    { from: "rush", to: "mistakes", label: "then what?" },
    { from: "mistakes", to: "back", label: "so" },
    { from: "back", to: "queue", label: "then what?" },
    { from: "queue", to: "rush", label: "so" },
    { from: "queue", to: "watch", label: "plan" },
  ],
  steps: [
    {
      state: "sign",
      edge: 0,
      title: "Start with the decision",
      note: "Hamza's sign says: 'Repaired in one hour, or the repair is free.' His goal is more customers than the two new shops in the street. Follow one branch of his map: Jawad, who does most of the repairs. Then what?",
      chips: ["goal: more customers"],
    },
    {
      state: "rush",
      edge: 1,
      title: "First effect: Jawad works against the clock",
      note: "This comes straight from the sign, so it is a first effect. With a clock on every job, the easiest path for Jawad is to work faster. Then what?",
      chips: ["first link in the chain"],
    },
    {
      state: "mistakes",
      edge: 2,
      tone: "warn",
      outcome: "second effect",
      title: "Second effect: small mistakes",
      note: "Fast work means more small mistakes: a bolt left loose, a brake not adjusted well. This is the effect of the effect. A badly adjusted brake is also a safety problem for the rider.",
    },
    {
      state: "back",
      edge: 3,
      tone: "bad",
      outcome: "third effect",
      title: "Third effect: bicycles come back",
      note: "Some bicycles come back within a few days, and each one takes Jawad's time again. Three links from the sign, the effect is already far from Hamza's goal, and it would not show up in a count of customers.",
    },
    {
      state: "queue",
      edge: 4,
      tone: "bad",
      outcome: "a loop",
      title: "The chain turns into a loop",
      note: "Returned bicycles make the queue longer, so more jobs miss the hour, and Jawad feels even more pressure to rush. More pressure, more mistakes, more pressure: the loop feeds itself.",
    },
    {
      state: "watch",
      edge: 5,
      tone: "good",
      outcome: "watch plan",
      title: "What Hamza decides to watch",
      note: "Before the sign, about 1 bicycle in 20 came back within a week. Hamza writes that number down: if it rises, the loop has started. He also limits the promise to tyres, chains and brakes on bicycles handed in before 4 pm.",
      chips: ["watch: bicycles back in a week", "before: 1 in 20"],
    },
  ],
  tryThis: [
    "Before step 2, predict which group reacts first: Jawad inside the shop, or the other shops in the street.",
    "At step 4, count the links back to the sign. Why is a third effect harder to notice than a first one?",
  ],
  limits:
    "This follows one branch of the map only. Hamza's full map also has customers, the other shops and Hamza himself. Every link is a guess to watch and test, not a fact, and after about three links the guesses become too uncertain to be useful.",
};
