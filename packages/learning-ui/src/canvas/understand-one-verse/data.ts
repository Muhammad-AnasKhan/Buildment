import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 03.04 "Understanding, tajweed and hifz".
// Reading is the first habit. Understanding, correct recitation and memorising
// are three more, each built small and attached to the daily page.
// See spec.md.
export const understandOneVerse: SequenceSpec = {
  kind: "sequence",
  title: "One page, three small additions",
  purpose: "Follow Hamza's daily page and see where understanding, tajweed and memorising fit without a new block of time.",
  summary: "After his page Hamza reads the meaning of one verse, writes one question, reads to his teacher on Friday for one correction, learns two verses by heart, and reviews old ones before new ones.",
  actors: [
    { name: "Hamza" },
    { name: "His mushaf", sub: "with meaning" },
    { name: "His teacher", sub: "Fridays" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "meaning of a verse",
      title: "One verse, understood",
      note: "After his page he reads the meaning of one verse from it in Urdu. A blessed Book, sent down so that people reflect on its verses (Quran 38:29).",
      chips: ["Quran 38:29"],
    },
    {
      from: 0,
      to: 0,
      label: "one question",
      title: "One question in a notebook",
      note: "When a verse puzzles him, he writes one line. Jibril came and asked the Prophet, peace be upon him, questions, and the Prophet said: that was Jibril, who came to teach people their religion (Sahih al-Bukhari 50).",
      chips: ["Sahih al-Bukhari 50"],
    },
    {
      from: 0,
      to: 2,
      label: "one correction",
      title: "Tajweed, a little at a time",
      note: "Recite the Quran with measured recitation (Quran 73:4). His teacher corrects at most two things a week, so each correction sticks.",
      chips: ["Quran 73:4"],
    },
    {
      from: 1,
      to: 0,
      label: "2 verses by heart",
      title: "Hifz in small pieces",
      note: "He learns two verses by heart after his page.",
    },
    {
      from: 0,
      to: 0,
      label: "review first",
      tone: "good",
      outcome: "kept",
      title: "Review before new",
      note: "Keep up the Quran, for it slips away faster than a camel from its tether (Sahih al-Bukhari 5033). So each morning he reviews what he has learned before adding anything new.",
      chips: ["Sahih al-Bukhari 5033"],
    },
  ],
  tryThis: [
    "Before step 4, predict: is memorising mainly about learning new verses or about keeping old ones?",
    "Which of the three additions would cost you the least time tomorrow?",
  ],
  limits: "These are one learner's sizes. Meaning in a translation is a help, not a full tafsir; for deeper study, learn from a qualified teacher. Correct recitation needs a teacher's ear.",
};
