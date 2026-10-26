import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 12.02 "Parents and relatives".
// After Allah's rights, the Quran places parents. The Sunnah adds ties of
// kinship as a daily and weekly habit.
// See spec.md.
export const parentsFirst: SequenceSpec = {
  kind: "sequence",
  title: "A week of honouring parents",
  purpose: "See small daily and weekly actions for parents and relatives, each with its source.",
  summary: "Hamza listens to his mother without looking at his phone, lowers his voice in a disagreement, helps without being asked, makes dua for his parents after prayer, and calls an aunt every Sunday.",
  actors: [
    { name: "Hamza" },
    { name: "His mother" },
    { name: "Relatives" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "she talks",
      title: "Listen fully",
      note: "His mother tells a long story. He puts the phone face down and listens to the end. Who most deserves my good company? Your mother, your mother, your mother, then your father (Sahih al-Bukhari 5971).",
      chips: ["Sahih al-Bukhari 5971"],
    },
    {
      from: 0,
      to: 1,
      label: "no 'uff'",
      tone: "warn",
      title: "A lowered voice",
      note: "Do not say to them even 'uff', do not repel them, and speak to them a noble word (Quran 17:23). In a disagreement he lowers his voice.",
      chips: ["Quran 17:23"],
    },
    {
      from: 0,
      to: 1,
      label: "helps unasked",
      title: "Help without being asked",
      note: "He carries the shopping, fixes her phone, takes her to the doctor. Lower to them the wing of humility out of mercy (Quran 17:24).",
      chips: ["Quran 17:24"],
    },
    {
      from: 0,
      to: 0,
      label: "dua for them",
      tone: "good",
      title: "Dua for parents",
      note: "My Lord, have mercy on them as they raised me when I was small (Quran 17:24). He says it after one prayer each day, and for his late father too.",
    },
    {
      from: 0,
      to: 2,
      label: "Sunday call",
      tone: "good",
      outcome: "kinship",
      title: "Kinship ties",
      note: "Whoever wants his provision increased and his life extended, let him keep ties of kinship (Sahih al-Bukhari 5986). He calls one relative every Sunday.",
      chips: ["Sahih al-Bukhari 5986"],
    },
  ],
  tryThis: [
    "Before step 2, predict: what is the smallest word of impatience the Quran forbids to parents?",
    "Which relative have you not called for a long time?",
  ],
  limits: "Honouring parents does not include obeying them in sin, and some families are hard or harmful places; if that is your situation, talk to a scholar or a counsellor you trust. Kinship ties take different forms in different families.",
};
