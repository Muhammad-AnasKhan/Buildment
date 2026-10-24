import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course, chapter 2.2 "What tawakkul is, and what it is not".
// One need, three ways to meet it. Trust without means: the people of Yemen
// who came for Hajj without provisions (Sahih al-Bukhari 1523, Quran 2:197).
// Means without trust: Khalil's sleepless week, as if everything hung on him.
// The birds: trust with the heart and going out with the body (Jami'
// at-Tirmidhi 2344). Every fact matches the chapter. See spec.md.
export const birdsGoOut: StateMachineSpec = {
  kind: "state-machine",
  title: "Two ways tawakkul goes wrong, and the birds",
  purpose: "See why trust without means and means without trust both fail, and why the birds in the hadith trust and still go out.",
  summary:
    "Khalil needs to be ready for his interview on Thursday. If he trusts without taking the means, like the people of Yemen who came for Hajj without food and called themselves the ones who trust, he ends up stuck and asking others. If he takes the means without trust, as if everything hung on him, he ends up worn out and sleepless. The birds in the hadith show the third way: they trust Allah, go out hungry in the morning and come back full in the evening.",
  states: [
    { id: "trustonly", name: "Trust, no means", sub: "the pilgrims", col: 0, row: 0 },
    { id: "need", name: "A real need", sub: "food, work, a plan", col: 1, row: 0 },
    { id: "meansonly", name: "Means, no trust", sub: "it all hangs on me", col: 2, row: 0 },
    { id: "stuck", name: "Stuck, asking", sub: "no provisions", col: 0, row: 1 },
    { id: "birds", name: "Birds go out", sub: "trust and move", col: 1, row: 1 },
    { id: "worn", name: "Worn out", sub: "no rest, no peace", col: 2, row: 1 },
  ],
  edges: [
    { from: "need", to: "trustonly", label: "skip means" },
    { from: "trustonly", to: "stuck", label: "so" },
    { from: "need", to: "meansonly", label: "only effort" },
    { from: "meansonly", to: "worn", label: "so" },
    { from: "need", to: "birds", label: "or" },
  ],
  steps: [
    {
      state: "need",
      title: "A real need",
      note: "Everyone has needs: food, work, a way forward. Khalil's need this week is to be ready for his interview on Thursday at 10:00, with power, internet and practice. Tawakkul is about how the heart and the hands meet a need like this.",
      chips: ["interview Thursday 10:00", "60 minutes"],
    },
    {
      state: "trustonly",
      edge: 0,
      title: "Way 1: trust without means",
      note: "Some people of Yemen used to come for Hajj without taking provisions. They said: we are the ones who trust Allah (Sahih al-Bukhari 1523). They skipped the means and called it trust.",
    },
    {
      state: "stuck",
      edge: 1,
      tone: "bad",
      outcome: "stuck",
      title: "Where way 1 leads",
      note: "When they arrived, they had to ask people for food. Allah revealed: take provisions, and the best provision is taqwa (Quran 2:197). For Khalil, way 1 would be praying and doing nothing about the power, then losing the call halfway through the test.",
    },
    {
      state: "meansonly",
      edge: 2,
      title: "Way 2: means without trust",
      note: "Khalil's week shows the opposite way. He reads testing notes until 02:00, checks the power group every hour and feels that everything depends on him. His hands are busy, but his heart has nowhere to rest.",
    },
    {
      state: "worn",
      edge: 3,
      tone: "bad",
      outcome: "worn out",
      title: "Where way 2 leads",
      note: "After three bad nights, his notes are longer, not better, and he is tired. If the interview fails, he will blame only himself. If it succeeds, he may think it was only him. Either way, his heart hangs on things that can fail.",
    },
    {
      state: "birds",
      edge: 4,
      tone: "good",
      outcome: "trust and move",
      title: "The third way: the birds go out",
      note: "The Prophet, peace be upon him, said: if you relied on Allah as He truly deserves, He would provide for you as He provides for the birds: they go out hungry in the morning and come back full in the evening (Jami' at-Tirmidhi 2344). The birds trust, and they still fly out. For Khalil: practise in set hours, plan the power, sleep, and rest his heart on Allah.",
      chips: ["Tirmidhi 2344", "heart trusts, hands work"],
    },
  ],
  tryThis: [
    "At step 6, check your prediction about Mazen's cousin: what do the birds in the hadith do each morning?",
    "Compare steps 3 and 5. Both end badly. What is missing in each one?",
  ],
  limits:
    "Real people are rarely all of one kind: most of us lean a little towards one of the two mistakes, and it can change from week to week. The canvas shows the three ways as clean paths so they are easy to tell apart. It does not measure anyone's trust; only Allah knows what is in a heart.",
};
