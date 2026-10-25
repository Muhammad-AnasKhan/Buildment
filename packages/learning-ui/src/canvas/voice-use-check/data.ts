import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 9.4: sort eight uses of a voice into "fine" (your own
// voice, or a stock voice, labelled), "needs a yes" (someone else's voice,
// with their explicit consent first) and "never" (used to deceive or take
// money). Dossier: C25 to C28 (ElevenLabs rules), C30 to C35 (scams, FCC,
// FTC, banks, EU Article 50), C36 to C38 (platform labels).

export const VOICE_USE_BUCKETS: SortBucket[] = [
  { id: "fine", label: "Fine", sub: "yours or stock" },
  { id: "yes", label: "Needs a yes", sub: "their clear yes" },
  { id: "never", label: "Never", sub: "tricks for money" },
];

export const VOICE_USE_CARDS: SortCard[] = [
  {
    id: "record-own",
    text: "You record your own voice reading your demo script.",
    answer: "fine",
    why: {
      yes: "It is your own voice, so nobody else has to say yes.",
      never: "Nothing here deceives anyone. It is your own recording.",
    },
  },
  {
    id: "classmate",
    text: "A classmate's voice, cloned for your group's demo video.",
    answer: "yes",
    why: {
      fine: "It is not your voice. Another person's voice needs their clear yes first.",
      never: "Not harmful in itself. With her explicit yes, and a label, it can be allowed.",
    },
  },
  {
    id: "cousin-money",
    text: "A message in a cousin's voice asking for money fast.",
    answer: "never",
    why: {
      fine: "This copies a real person to get money. No label makes it fine.",
      yes: "Even a yes from the cousin would not make a trick for money acceptable.",
    },
  },
  {
    id: "own-clone",
    text: "Your own cloned voice reads the script. Line one says it is AI.",
    answer: "fine",
    why: {
      yes: "It is your own voice, and you say it is AI. Nobody else has to say yes.",
      never: "You are not tricking anyone: it is your voice and you say it is AI.",
    },
  },
  {
    id: "public-clip",
    text: "A speaker's voice cloned from a video that is public online.",
    answer: "yes",
    why: {
      fine: "It is not your voice. Being public is not the same as saying yes.",
      never: "It could be allowed if the speaker clearly says yes. Public is not a yes.",
    },
  },
  {
    id: "shop-owner",
    text: "A voice like a shop owner's, telling customers to pay a new account.",
    answer: "never",
    why: {
      fine: "It copies a real person to take money. A label does not fix that.",
      yes: "A yes cannot make taking customers' money by a trick acceptable.",
    },
  },
  {
    id: "stock-voice",
    text: "A stock voice from the tool, marked 'AI voice' on your video.",
    answer: "fine",
    why: {
      yes: "A stock voice copies no real person, so there is nobody to ask.",
      never: "Nothing is copied and nothing is hidden: the video says it is AI.",
    },
  },
  {
    id: "teacher-joke",
    text: "A teacher's voice made to say a joke in the class chat.",
    answer: "yes",
    why: {
      fine: "It is not your voice. Even a joke needs the teacher's clear yes first.",
      never: "A joke is not a scam. It still needs the teacher's explicit yes before you make it.",
    },
  },
];

export const voiceUseCheck: CustomCanvasSpec = {
  kind: "custom",
  title: "Whose voice, and what for?",
  purpose: "Sort eight uses of a voice into fine, needs a yes and never, with a short reason after each wrong try.",
  limits:
    "Real cases have more shades: platform rules and laws differ by place and by whether you publish for money, and a tool may refuse even a use you think is fine. The sort is this course's own advice, not legal advice. Every person in the cards is fictional.",
  component: makeSorterCanvas({
    buckets: VOICE_USE_BUCKETS,
    cards: VOICE_USE_CARDS,
    deckLabel: "Voice use",
    prompt: "Which bucket does this use go in?",
    hint: "Tap the bucket this use belongs in, or drag the card onto it.",
    endNote: "Your own voice, or a stock voice, with a label is fine. Another person's voice needs their clear yes first. A trick for money is never fine.",
  }),
};
