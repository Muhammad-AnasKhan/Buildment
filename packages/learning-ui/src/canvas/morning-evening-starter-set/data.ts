import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 04.02 "What to say, morning and evening".
// The morning and evening adhkar (subah aur sham ke azkar) are words of
// remembrance the Prophet, peace be upon him, taught for the start and end of
// the day. Start with a small set you can keep, then add.
// See spec.md.
export const morningEveningStarterSet: SequenceSpec = {
  kind: "sequence",
  title: "A starter set, morning and evening",
  purpose: "See Hamza's small starter set of morning and evening adhkar, each with its source, and how it grows.",
  summary: "Hamza starts with three sourced adhkar after Fajr: the master of seeking forgiveness, 'Bismillahilladhi' three times, and SubhanAllahi wa bihamdihi; when the evening adhkar join his ladder he says the same three after Asr, and when the three are easy he adds the morning and evening words reported by Ibn Mas'ud.",
  actors: [
    { name: "Hamza" },
    { name: "Morning", sub: "after Fajr" },
    { name: "Evening", sub: "after Asr" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "1. forgiveness",
      title: "The master of seeking forgiveness",
      note: "Sayyid al-istighfar: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant...' Whoever says it in the day with firm faith and dies before evening is of the people of Paradise, and the same for the night (Sahih al-Bukhari 6306).",
      chips: ["Sahih al-Bukhari 6306"],
    },
    {
      from: 0,
      to: 1,
      label: "2. Bismillah x3",
      title: "'Bismillahilladhi' three times",
      note: "'In the name of Allah, with whose name nothing on earth or in the heaven can harm, and He is the All-Hearing, the All-Knowing', three times in the morning and three in the evening (Jami' at-Tirmidhi 3388, graded hasan sahih).",
      chips: ["Jami' at-Tirmidhi 3388"],
    },
    {
      from: 0,
      to: 1,
      label: "3. SubhanAllah",
      title: "SubhanAllahi wa bihamdihi",
      note: "Whoever says 'SubhanAllahi wa bihamdihi' a hundred times in the morning and evening, no one brings anything better on the Day of Judgement except someone who said the same or more (Sahih Muslim 2692). Hamza starts with 33 and grows to 100.",
      chips: ["Sahih Muslim 2692", "33, then 100"],
    },
    {
      from: 0,
      to: 2,
      label: "same 3, evening",
      title: "The same set in the evening",
      note: "When the evening adhkar join his ladder later in his plan, he does not learn a new list. After Asr he says the same three. Allah says: glorify Him morning and evening (Quran 33:42). One set, two anchors, so it is learned twice as fast.",
      chips: ["Quran 33:42"],
    },
    {
      from: 0,
      to: 2,
      label: "then: add one",
      tone: "good",
      outcome: "it grew",
      title: "When the three are easy: one more",
      note: "When the three feel easy on most days, he adds the words the Prophet said every evening: 'We have reached the evening, and the dominion belongs to Allah...', and 'We have reached the morning...' in the morning (Sahih Muslim 2723).",
      chips: ["Sahih Muslim 2723"],
    },
  ],
  tryThis: [
    "Before step 4, predict: should the evening set be a new list, or the same words?",
    "Which of the three is shortest to say? Which would you keep on your hardest day?",
  ],
  limits: "This is a starter set of a few sound adhkar, not the full collection. There are many more in the books of adhkar. Learn the Arabic from a trusted teacher or a reliable book. Scholars differ on the exact times of morning and evening; the times here are one common practice.",
};
