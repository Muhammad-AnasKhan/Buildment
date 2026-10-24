import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 2.3 "Reverse cause, chance and the drift
// back to normal". The app company gave the app free to the 10 students with
// the lowest midterm marks, and 8 of 10 did better on the final. In the other
// section, the 10 lowest students got no app and 7 of 10 also did better.
// See spec.md.
export const driftBackToNormal: SequenceSpec = {
  kind: "sequence",
  title: "Did the free app lift the weakest students?",
  purpose: "Follow two groups picked for their low marks, one with the app and one without, and see how both move back toward normal.",
  summary:
    "The 10 students with the lowest midterm marks in Basel's class get the app free, and 8 of them do better on the final. Rawan says the app lifts weak students. Basel finds the 10 lowest midterm students in the other section, who got no app: 7 of them also do better. Most of the rise would have happened anyway, and one student's difference in groups of ten is within luck.",
  actors: [
    { name: "Rawan", sub: "app company" },
    { name: "Basel", sub: "checks" },
    { name: "App group", sub: "lowest 10" },
    { name: "Other section", sub: "lowest 10" },
  ],
  steps: [
    {
      from: 0,
      to: 2,
      label: "free app",
      title: "Picked for their low marks",
      note: "After the midterm, the company gives the app free to the 10 students in Basel's class with the lowest marks. Some of them are always weak in this subject. Some had a bad day.",
      chips: ["lowest 10 midterm marks"],
    },
    {
      from: 2,
      to: 2,
      label: "final exam",
      title: "The app group on the final",
      note: "Eight of the 10 do better on the final than on the midterm.",
      chips: ["8 of 10 improved"],
    },
    {
      from: 0,
      to: 1,
      label: "the app works",
      title: "Rawan's claim",
      note: "Rawan writes: 'The app lifts weak students.' Basel asks what would have happened without the app.",
    },
    {
      from: 1,
      to: 3,
      label: "find a match",
      title: "A group that started in the same place",
      note: "The same course has a second section, with the same teacher and the same exams. Its 10 lowest midterm students did not get the app.",
      chips: ["same teacher", "same exams", "no app"],
    },
    {
      from: 3,
      to: 3,
      label: "final exam",
      tone: "warn",
      outcome: "7 of 10 improved",
      title: "The group without the app",
      note: "Seven of these 10 students also do better on the final. Their midterm marks had bad luck in them, and the luck did not repeat.",
      chips: ["7 of 10 improved"],
    },
    {
      from: 1,
      to: 0,
      label: "compare",
      tone: "warn",
      outcome: "effect not shown",
      title: "Compare the two groups",
      note: "Eight of 10 against 7 of 10 is a difference of one student. Most of the rise would have happened anyway: a drift back to normal. With groups this small, the app's own effect is not known.",
      chips: ["8 of 10 against 7 of 10"],
    },
  ],
  tryThis: [
    "Before step 5, predict what happened on the final to the 10 lowest students in the other section, who had no app.",
    "At step 6, say what Basel can honestly tell Rawan, and what he cannot.",
  ],
  limits:
    "Each group has only 10 students, so one student either way is within luck. The two sections are alike but not the same. A fair test, where chance decides who gets the app, would show the app's real effect better; module 3 teaches it.",
};
