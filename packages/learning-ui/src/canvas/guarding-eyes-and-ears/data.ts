import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 10.03 "Eyes, ears and haya".
// The eyes and the ears take in everything in a day. The Quran commands
// lowering the gaze, and the Sunnah treats haya as part of faith.
// See spec.md.
export const guardingEyesAndEars: SequenceSpec = {
  kind: "sequence",
  title: "What comes in through the eyes and ears",
  purpose: "See moments in one day when eyes and ears are tested, and the planned response for each.",
  summary: "Musa turns away from an image after the first glance, scrolls past a video, leaves a group where jokes turn crude, does not listen to backbiting, and explains to a friend that haya is part of who he is.",
  actors: [
    { name: "Musa", sub: "age 12" },
    { name: "Screen" },
    { name: "Friends" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "sudden glance",
      title: "The first glance",
      note: "Jarir asked the Prophet, peace be upon him, about the sudden glance, and he told him to turn his eyes away (Sahih Muslim 2159). Tell the believing men and women to lower their gaze (Quran 24:30 to 31).",
      chips: ["Sahih Muslim 2159", "Quran 24:30-31"],
    },
    {
      from: 0,
      to: 1,
      label: "scrolls past",
      title: "Do not take the second look",
      note: "The zina of the eyes is looking (Sahih Muslim 2657). The first glance was not his choice; the second would be.",
      chips: ["Sahih Muslim 2657"],
    },
    {
      from: 2,
      to: 0,
      label: "crude jokes",
      tone: "warn",
      title: "Talk that turns crude",
      note: "When they hear ill speech, they turn away from it and say: to us our deeds and to you yours, peace be upon you (Quran 28:55). Musa leaves the group chat.",
      chips: ["Quran 28:55"],
    },
    {
      from: 2,
      to: 0,
      label: "backbiting",
      title: "Not listening to backbiting",
      note: "Hearing, sight and the heart, each will be questioned (Quran 17:36). He changes the subject.",
      chips: ["Quran 17:36"],
    },
    {
      from: 0,
      to: 2,
      label: "haya is me",
      tone: "good",
      outcome: "identity",
      title: "Haya as identity",
      note: "Haya is a branch of faith (Sahih Muslim 35). If you have no shame, do as you wish (Sahih al-Bukhari 6120).",
      chips: ["Sahih Muslim 35", "Sahih al-Bukhari 6120"],
    },
  ],
  tryThis: [
    "Before step 2, predict: which glance is the habit about, the first or the second?",
    "Where do your eyes and ears get tested most: the street, the screen or friends?",
  ],
  limits: "This uses a boy's day, but the same applies to men and women of every age. Practical help such as content filters is taking the means; it does not replace the habit of the heart.",
};
