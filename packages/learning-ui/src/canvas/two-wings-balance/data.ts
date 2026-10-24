import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course (faith-and-resilience), chapter 4.3 "Hope and fear in
// balance". Ahmad's two evenings: fear with no hope becomes despair, hope with
// no fear becomes carelessness; adding the missing wing brings both back to a
// steady heart that makes dua and does honest work. Fear here is only about his
// own choices, never about events. See spec.md.
export const twoWingsBalance: StateMachineSpec = {
  kind: "state-machine",
  title: "Two wings: hope and fear",
  purpose: "See how one missing wing breaks the balance, and how adding the missing wing brings a heart back to steady action.",
  summary:
    "With only fear, Ahmad falls into despair and stops asking; with only hope, he becomes careless about an untruth to a client; adding hope to the first and fear to the second brings both to two wings, which leads to dua and honest work.",
  states: [
    { id: "fear", name: "Only fear", sub: "one wing", col: 0, row: 0 },
    { id: "both", name: "Both wings", sub: "hope and fear", col: 1, row: 0 },
    { id: "hope", name: "Only hope", sub: "one wing", col: 2, row: 0 },
    { id: "despair", name: "Despair", sub: "stops asking", col: 0, row: 1 },
    { id: "steady", name: "Steady, acting", sub: "dua and honest work", col: 1, row: 1 },
    { id: "careless", name: "Careless", sub: "wrongs ignored", col: 2, row: 1 },
  ],
  edges: [
    { from: "fear", to: "despair", label: "so" },
    { from: "hope", to: "careless", label: "so" },
    { from: "fear", to: "both", label: "add hope" },
    { from: "hope", to: "both", label: "add fear" },
    { from: "both", to: "steady", label: "so" },
  ],
  steps: [
    {
      state: "both",
      title: "Two wings",
      note: "The scholar Ibn al-Qayyim said the heart on its way to Allah is like a bird: love is its head, and fear and hope are its two wings. Allah tells us to call on Him with fear and hope (Quran 7:56).",
      chips: ["Quran 7:56", "Quran 17:57"],
    },
    {
      state: "fear",
      title: "Monday: only fear",
      note: "A bakery chose another designer. Ahmad thinks of his past mistakes and decides: Allah will not open a door for someone like me. The lost client is not a punishment; the problem is what he has decided about Allah's mercy.",
      chips: ["fear with no hope"],
    },
    {
      state: "despair",
      edge: 0,
      tone: "bad",
      outcome: "one wing",
      title: "Despair",
      note: "He makes no dua that night and does not send the pitch he planned. Allah says to those who have wronged themselves: do not despair of Allah's mercy (Quran 39:53).",
      chips: ["Quran 39:53", "Quran 15:56"],
    },
    {
      state: "hope",
      title: "Thursday: only hope",
      note: "He tells a cafe owner the menu is 'almost finished' when he has not started, and thinks: Allah is merciful; a small untruth to a client is nothing.",
      chips: ["hope with no fear"],
    },
    {
      state: "careless",
      edge: 1,
      tone: "bad",
      outcome: "one wing",
      title: "Carelessness",
      note: "This is hope with no care about his own wrong choice. The verse that tells us to call on Allah with hope also says His mercy is near to those who do good (Quran 7:56).",
    },
    {
      state: "both",
      edge: 2,
      title: "Monday, mended: add hope",
      note: "Ahmad remembers that Allah says: I am as My servant thinks of Me (Sahih al-Bukhari 7405). His mistakes are not bigger than Allah's mercy. He makes dua that night.",
      chips: ["Sahih al-Bukhari 7405"],
    },
    {
      state: "both",
      edge: 3,
      title: "Thursday, mended: add fear",
      note: "The unease he feels about his message is the fear wing working. Fear here is about his own choice, not about events. He writes to the cafe owner with the truth and a real date: Sunday at noon.",
      chips: ["own choices, not events"],
    },
    {
      state: "steady",
      edge: 4,
      tone: "good",
      outcome: "both wings",
      title: "Steady and acting",
      note: "By the end of the week: one dua, one pitch sent, one honest correction and one menu delivered on Sunday at 11:00, an hour early. Neither wing alone would have done it.",
      chips: ["dua", "pitch sent", "truth told", "menu delivered"],
    },
  ],
  tryThis: [
    "At step 3, check the prediction you made above the canvas: what did Ahmad's heart need on Monday night, more hope or more fear?",
    "Compare steps 6 and 7. Each cure adds the missing wing, never more of the wing he already had. Which wing do you most often lose?",
  ],
  limits:
    "The two wings are a picture from a scholar, used to make a Quranic balance easy to see; they are not a measurement, and the canvas does not score anyone's hope, fear or faith. Fear here means care about your own choices only; the canvas never reads a hardship as a punishment.",
};
