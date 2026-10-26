import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 06.03 "A bedtime routine that holds".
// Reciting al-Mulk from memory frees the habit from the mushaf and the light.
// Thirty verses, learned a few at a time, take about six weeks.
// See spec.md.
export const alMulkByHeart: SequenceSpec = {
  kind: "sequence",
  title: "Al-Mulk by heart, five verses a week",
  purpose: "Follow Hamza's six weeks of learning Surah al-Mulk by heart and see how the review keeps old verses from slipping.",
  summary: "Hamza learns five new verses of al-Mulk each week after Fajr, recites everything he has learned so far at night, adds no new verses in a week when the old ones are shaky, and recites the whole surah from memory by week seven.",
  actors: [
    { name: "Hamza" },
    { name: "New verses", sub: "after Fajr" },
    { name: "Night review", sub: "after Isha" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "verses 1 to 5",
      title: "Week 1: five verses",
      note: "After Fajr, he reads verses 1 to 5 several times while looking, then without looking. Five verses are small enough to fit his morning.",
    },
    {
      from: 0,
      to: 2,
      label: "recite at night",
      title: "Review at night",
      note: "At night he recites the five from memory, then reads the rest of the surah from the mushaf. The new habit sits inside the old one.",
    },
    {
      from: 1,
      to: 0,
      label: "6 to 10, 11 to 15",
      tone: "good",
      title: "Weeks 2 and 3: five more each",
      note: "Each week, five more verses. Each night, he recites everything learned so far before reading on.",
    },
    {
      from: 0,
      to: 0,
      label: "shaky: no new",
      tone: "warn",
      outcome: "review week",
      title: "Week 4: a review week",
      note: "Verses 11 to 15 keep slipping. He adds nothing new this week and only reviews. The most beloved deeds to Allah are the most consistent, even if small (Sahih al-Bukhari 6465).",
      chips: ["Sahih al-Bukhari 6465"],
    },
    {
      from: 0,
      to: 2,
      label: "all 30, week 7",
      tone: "good",
      outcome: "by heart",
      title: "Week 7: the whole surah",
      note: "By week seven he recites all thirty verses from memory, in the dark, during a power cut. The habit no longer needs a light or a book.",
    },
  ],
  tryThis: [
    "Before step 4, predict: when the old verses slip, should Hamza push on with new ones or stop and review?",
    "Count: at five verses a week with one review week, how many weeks for thirty verses?",
  ],
  limits: "Five verses a week is one person's pace; some learn faster or slower, and both are fine. Correct pronunciation needs a teacher. Memorising is a bonus, not a condition: reading al-Mulk from the mushaf is the same surah and the same habit.",
};
