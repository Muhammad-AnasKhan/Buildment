import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 13.02 "Discipline and time".
// Free time and health are blessings many people lose. Discipline is not
// harshness; it is a plan that puts the important thing first.
// See spec.md.
export const aDayWithAPlan: SequenceSpec = {
  kind: "sequence",
  title: "A day with a plan",
  purpose: "Follow one study day and see how a plan protects time, with the source behind each choice.",
  summary: "Musa writes three tasks the night before, does the hardest first after Fajr, keeps his phone away during study blocks, says no to a game that would make him miss a promise, and reviews his day.",
  actors: [
    { name: "Musa" },
    { name: "His plan" },
    { name: "Distractions" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "3 tasks",
      title: "Plan the night before",
      note: "Two blessings many people lose: health and free time (Sahih al-Bukhari 6412). He writes three tasks for tomorrow.",
      chips: ["Sahih al-Bukhari 6412"],
    },
    {
      from: 1,
      to: 0,
      label: "hardest first",
      title: "The hard task first",
      note: "The strong believer is better and more beloved to Allah than the weak; be eager for what benefits you, seek Allah's help and do not give up (Sahih Muslim 2664).",
      chips: ["Sahih Muslim 2664"],
    },
    {
      from: 2,
      to: 0,
      label: "phone buzzes",
      tone: "warn",
      title: "Distractions",
      note: "During a study block the phone is in another room. As for one who held his soul back from its desire, Paradise is the refuge (Quran 79:40 to 41).",
      chips: ["Quran 79:40-41"],
    },
    {
      from: 2,
      to: 0,
      label: "a game invite",
      title: "Commitments come first",
      note: "Friends invite him to a game at the time he promised to help his father. He keeps the promise (Sahih al-Bukhari 33) and plays later.",
      chips: ["Sahih al-Bukhari 33"],
    },
    {
      from: 0,
      to: 1,
      label: "review",
      tone: "good",
      outcome: "asked about",
      title: "Why time matters",
      note: "A servant's feet will not move on the Day of Judgement until he is asked about his life and how he spent it, his knowledge and what he did with it, his wealth, and his body (Jami' at-Tirmidhi 2417, sahih).",
      chips: ["Jami' at-Tirmidhi 2417"],
    },
  ],
  tryThis: [
    "Before step 2, predict: should the hardest task go first or last?",
    "What is the one thing that steals most of your free time?",
  ],
  limits: "Rest, family time and halal play are good uses of time, not waste. Discipline is a plan with room for them, not a day with no breaks.",
};
