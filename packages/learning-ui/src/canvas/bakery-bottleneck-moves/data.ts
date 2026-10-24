import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 6.4 "Bottlenecks".
// Huda's five steps, with the cakes each can handle in a day. The oven sets
// the pace; getting the most out of it, then adding a second oven, moves the
// bottleneck to decorating. See spec.md.
export const bakeryBottleneckMoves: StateMachineSpec = {
  kind: "state-machine",
  title: "Huda's bottleneck, and where it moves",
  purpose: "Follow the five steps for Huda's slowest step and see the bottleneck move once it is fixed.",
  summary:
    "Taking orders handles 20 cakes a day, mixing 12, baking 6, decorating 10 and delivery 15, so the oven sets the pace at 36 a week. With batter always ready, the same oven bakes 8 a day, 48 a week. A second oven makes baking 16 a day. Now decorating, at 10 a day, is the slowest step, and the bakery can deliver 60 a week.",
  states: [
    { id: "orders", name: "Take orders", sub: "20 a day", col: 0, row: 0 },
    { id: "mix", name: "Mix batter", sub: "12 a day", col: 1, row: 0 },
    { id: "bake", name: "Bake", sub: "6 a day at first", col: 2, row: 0 },
    { id: "out", name: "Cakes out", sub: "per week", col: 0, row: 1 },
    { id: "deliver", name: "Deliver", sub: "15 a day", col: 1, row: 1 },
    { id: "decorate", name: "Decorate", sub: "10 a day", col: 2, row: 1 },
  ],
  edges: [
    { from: "orders", to: "mix", label: "orders" },
    { from: "mix", to: "bake", label: "pile waits" },
    { from: "bake", to: "decorate", label: "go" },
    { from: "decorate", to: "deliver", label: "decorated" },
    { from: "deliver", to: "out", label: "delivered" },
  ],
  steps: [
    {
      state: "bake",
      tone: "warn",
      outcome: "bottleneck",
      title: "Find the slowest step",
      note: "The oven bakes 6 cakes a day. Every other step can handle more. Six days of 6 cakes is 36 a week, exactly where the bakery stalled.",
      chips: ["6 a day", "36 a week"],
    },
    {
      state: "mix",
      edge: 1,
      title: "Look for the pile",
      note: "Orders arrive and batter is mixed faster than the oven can bake, so a pile of waiting orders builds up in front of the oven. After the oven, decorating and delivery wait for cakes.",
    },
    {
      state: "bake",
      tone: "good",
      outcome: "8 a day",
      title: "Get the most out of it",
      note: "The oven can bake one cake an hour for 8 hours, but it sits empty about two hours a day while Huda mixes or answers the phone. With the next batter always ready, the same oven bakes 8 a day: 48 a week, without buying anything.",
    },
    {
      state: "orders",
      edge: 0,
      title: "Make everything else serve it",
      note: "Huda's mother answers the phone during baking hours, and Huda mixes each batter while the cake before it bakes. The other steps now work to the oven's timing.",
    },
    {
      state: "bake",
      edge: 2,
      tone: "good",
      outcome: "16 a day",
      title: "Add capacity, only after that",
      note: "Weeks later, customers again ask for more than 48 a week. Now Huda buys a second-hand oven. Two ovens bake 16 cakes a day.",
    },
    {
      state: "decorate",
      edge: 3,
      tone: "warn",
      outcome: "new bottleneck",
      title: "Start again: the bottleneck moved",
      note: "Now the slowest step is decorating: Wiam can decorate 10 cakes a day. A new pile of baked cakes builds up in front of her table.",
      chips: ["10 a day"],
    },
    {
      state: "out",
      edge: 4,
      tone: "good",
      outcome: "60 a week",
      title: "The new pace",
      note: "The bakery now delivers at most 10 cakes a day, which is 60 a week. To go further, Huda follows the same five steps for decorating.",
    },
  ],
  tryThis: [
    "Before step 3, predict whether Huda can get more cakes out of the same oven without buying anything. Then check.",
    "At step 6, look at the five numbers again. Which step would be the slowest if Wiam could decorate 20 a day?",
  ],
  limits:
    "Every step here handles the same number every day, and every order is one cake. Real steps vary from day to day, and a step that is sometimes slow can still build a pile. The slowest step can also be outside the bakery, such as how many customers want cakes.",
};
