import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 9.4: sort eight uses of a voice into "fine" (your own
// voice, or a stock voice, labelled), "record instead" (the use involves
// another person's voice, so the course asks you to record your own voice, or
// ask them to record it themselves) and "never" (used to deceive or take
// money). One rule everywhere: own voice only, or a labelled stock voice.
// Dossier: C25 to C28 (ElevenLabs rules), C30 to C35 (scams, FCC, FTC, banks,
// EU Article 50), C36 to C38 (platform labels).

export const VOICE_USE_BUCKETS: SortBucket[] = [
  { id: "fine", label: "Fine, labelled", sub: "yours or stock" },
  { id: "instead", label: "Record instead", sub: "no copy of others" },
  { id: "never", label: "Never", sub: "tricks for money" },
];

export const VOICE_USE_CARDS: SortCard[] = [
  {
    id: "record-own",
    text: "You record your own voice reading your demo script.",
    answer: "fine",
    why: {
      instead: "It is already your own recording. There is nothing to replace.",
      never: "Nothing here deceives anyone. It is your own recording.",
    },
  },
  {
    id: "classmate",
    text: "A classmate's voice, cloned for your group's demo video.",
    answer: "instead",
    why: {
      fine: "It is not your voice. This course clones only your own voice.",
      never: "It is not a trick. The easy fix is to ask her to record the script herself.",
    },
  },
  {
    id: "cousin-money",
    text: "A message in a cousin's voice asking for money fast.",
    answer: "never",
    why: {
      fine: "This copies a real person to get money. No label makes it fine.",
      instead: "Recording something else is not the fix. A trick for money is never fine.",
    },
  },
  {
    id: "own-clone",
    text: "Your own cloned voice reads the script. Line one says it is AI.",
    answer: "fine",
    why: {
      instead: "It is your own voice, and you say it is AI. There is nothing to replace.",
      never: "You are not tricking anyone: it is your voice and you say it is AI.",
    },
  },
  {
    id: "public-clip",
    text: "A speaker's voice cloned from a video that is public online.",
    answer: "instead",
    why: {
      fine: "It is not your voice. Being public is not the same as a yes.",
      never: "It is not a trick. Use your own voice, or ask the speaker to record it.",
    },
  },
  {
    id: "shop-owner",
    text: "A voice like a shop owner's, telling customers to pay a new account.",
    answer: "never",
    why: {
      fine: "It copies a real person to take money. A label does not fix that.",
      instead: "A different recording does not fix it. Taking money by a trick is never fine.",
    },
  },
  {
    id: "stock-voice",
    text: "A stock voice from the tool, marked 'AI voice' on your video.",
    answer: "fine",
    why: {
      instead: "A stock voice copies no real person, so there is nothing to replace.",
      never: "Nothing is copied and nothing is hidden: the video says it is AI.",
    },
  },
  {
    id: "teacher-joke",
    text: "A teacher's voice made to say a joke in the class chat.",
    answer: "instead",
    why: {
      fine: "It is not your voice, even for a joke.",
      never: "A joke is not a scam. Still, do not clone a teacher: use your own voice.",
    },
  },
];

export const voiceUseCheck: CustomCanvasSpec = {
  kind: "custom",
  title: "Whose voice, and what for?",
  purpose: "Sort eight uses of a voice into fine, record instead and never, with a short reason after each wrong try.",
  limits:
    "Real cases have more shades: platform rules and laws differ by place and by whether you publish for money, and a tool may refuse even a use you think is fine. The sort is this course's own advice, not legal advice. Every person in the cards is fictional.",
  component: makeSorterCanvas({
    buckets: VOICE_USE_BUCKETS,
    cards: VOICE_USE_CARDS,
    deckLabel: "Voice use",
    prompt: "Which bucket does this use go in?",
    hint: "Tap the bucket this use belongs in, or drag the card onto it.",
    endNote: "Your own voice, or a stock voice, with a label is fine. For anyone else, record your own voice or ask them to record it. A trick for money is never fine.",
  }),
};
