import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 03.02 "A little Quran every day".
// Daily Quran recitation (tilawat) grows from a small, fixed amount at a fixed
// time. Allah says: recite what is easy of the Quran (Quran 73:20).
// See spec.md.
export const aPageAfterFajr: SequenceSpec = {
  kind: "sequence",
  title: "One page after Fajr",
  purpose: "Follow Hamza's Quran habit over five weeks and see how a small portion grows without breaking.",
  summary: "Hamza starts with one page after Fajr, reads slowly and struggles with some words, adds a teacher-checked correction once a week, grows to two pages in week four, and keeps one page as his minimum on hard days.",
  actors: [
    { name: "Hamza" },
    { name: "His mushaf", sub: "on the shelf" },
    { name: "His teacher", sub: "weekly" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "1 page, week 1",
      title: "Week 1: one page, same place",
      note: "After Fajr he sits in the same corner and reads one page. The mushaf stays open on the shelf with a ribbon, so starting takes one step. Allah says: recite what is easy of the Quran (Quran 73:20).",
      chips: ["Quran 73:20", "1 page"],
    },
    {
      from: 0,
      to: 0,
      label: "stumbles",
      tone: "warn",
      outcome: "two rewards",
      title: "He stumbles on words",
      note: "Some words are hard and he reads slowly. He feels embarrassed. The Prophet, peace be upon him, said: the one who is skilled in the Quran is with the noble angels, and the one who reads it with difficulty, stumbling, has two rewards (Sahih Muslim 798).",
      chips: ["Sahih Muslim 798"],
    },
    {
      from: 0,
      to: 2,
      label: "asks weekly",
      title: "Week 2: a weekly check",
      note: "Every Friday he reads ten minutes to a teacher at the mosque and corrects two or three words. The best of you are those who learn the Quran and teach it (Sahih al-Bukhari 5027).",
      chips: ["Sahih al-Bukhari 5027"],
    },
    {
      from: 0,
      to: 1,
      label: "2 pages, week 4",
      tone: "good",
      outcome: "it grew",
      title: "Week 4: two pages",
      note: "The page now feels easy most days, so he adds a second page. He grows the habit only when the smaller one feels easy, not when he feels inspired.",
    },
    {
      from: 0,
      to: 1,
      label: "hard day: 1 page",
      title: "Hard days: the minimum",
      note: "On a day he wakes late for work, he still reads his one-page minimum. Each letter read from the Book of Allah has a good deed, and a good deed is multiplied by ten (Jami' at-Tirmidhi 2910, graded sahih).",
      chips: ["Jami' at-Tirmidhi 2910", "minimum: 1 page"],
    },
  ],
  tryThis: [
    "Before step 4, predict: when should Hamza add the second page, when he feels inspired or when the first page feels easy?",
    "Find the step that keeps the habit alive on a bad day. What is its size?",
  ],
  limits: "One page is Hamza's start; yours may be five verses or a whole juz. The amount that is 'easy' differs from person to person. Learning correct recitation (tajweed) needs a real teacher; this canvas does not teach it.",
};
