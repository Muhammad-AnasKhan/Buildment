import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 04.03 "Making adhkar stick".
// Adhkar need no book, no light and no internet once you know them. That makes
// them easy to tie to moments you already have: the walk home from Fajr, the
// commute, the minutes after Asr.
// See spec.md.
export const adhkarOnTheWay: SequenceSpec = {
  kind: "sequence",
  title: "Adhkar on the way",
  purpose: "Follow Hamza's day and see where his adhkar fit without adding time.",
  summary: "Hamza reads his morning set from a card on the walk back from Fajr, says the evening set on the walk back from Asr or on his commute, uses a bookmarked page on days he forgets the words, and on a busy day says only the shortest item.",
  actors: [
    { name: "Hamza" },
    { name: "His card", sub: "in his pocket" },
    { name: "The walk", sub: "mosque to home" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "writes a card",
      title: "A card in his pocket",
      note: "He writes his three adhkar on a small card, Arabic and meaning, and keeps it in his wallet. On his phone the same words are bookmarked in his Quran and hadith app, for days when the card is at home.",
    },
    {
      from: 0,
      to: 2,
      label: "Fajr walk home",
      tone: "good",
      outcome: "no extra time",
      title: "Morning: the walk back from Fajr",
      note: "The walk home from Fajr takes six minutes. That is enough for his morning set. The cue is stepping out of the mosque door.",
    },
    {
      from: 0,
      to: 2,
      label: "Asr walk home",
      title: "Evening: after Asr",
      note: "On office days he says the evening set on the bus home after Asr. Remembering Allah does not need stillness: Allah praises those who remember Him standing, sitting and lying on their sides (Quran 3:191).",
      chips: ["Quran 3:191"],
    },
    {
      from: 0,
      to: 0,
      label: "forgot words",
      title: "When the words go",
      note: "Week three, he forgets a line. He reads from the card instead of skipping. Reading from a card is not cheating; it is how most people learn.",
    },
    {
      from: 0,
      to: 0,
      label: "busy: shortest",
      tone: "warn",
      outcome: "minimum kept",
      title: "A busy day: the minimum",
      note: "On a day of back-to-back meetings he says only 'Bismillahilladhi' three times. The habit stays alive. The example of one who remembers his Lord and one who does not is like the living and the dead (Sahih al-Bukhari 6407).",
      chips: ["Sahih al-Bukhari 6407", "minimum"],
    },
  ],
  tryThis: [
    "Before step 2, predict: does Hamza need to find ten free minutes for his morning adhkar?",
    "Name a six-minute moment in your own day that happens every day and needs your hands but not your mind.",
  ],
  limits: "This shows one man's walk to the mosque. Your moment may be making tea, a bus ride or folding the prayer mat. Some adhkar are best said with full attention, and saying them while driving should never take attention from the road.",
};
