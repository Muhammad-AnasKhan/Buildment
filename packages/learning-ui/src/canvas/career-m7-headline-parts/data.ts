import type { CustomCanvasSpec } from "../registry";
import type { CardSlot, SlotChip } from "../models/slot-card";
import { makeSlotCardCanvas } from "../primitives/canvas-factories";
import type { SlotCardConfig } from "../primitives/slot-card";

// Course 16 (career-brand), module 7, chapter 7.2 beat 2: build Amjad's new
// headline from three parts (role, stack, proof habit) and refuse four of his
// old phrases with a reason. No number is invented for him: the headline
// promises to show them. No character count is given; the learner reads the
// counter on their own screen (checked 2026-10). Amjad is fictional.

export const HEADLINE_SLOTS: CardSlot[] = [
  { id: "role", label: "Role" },
  { id: "stack", label: "Stack" },
  { id: "habit", label: "Proof habit" },
];

export const HEADLINE_CHIPS: SlotChip[] = [
  { id: "role", text: "Freelance web developer", slot: "role", why: "This is the role, in the first words." },
  { id: "stack", text: "(Laravel, WordPress)", slot: "stack", why: "This names the tools he uses." },
  { id: "habit", text: "I fix slow client sites and show the numbers", slot: "habit", why: "This says what he does and how he proves it." },
  { id: "passionate", text: "Passionate developer", slot: null, why: "An adjective. A stranger learns nothing." },
  { id: "learner", text: "Lifelong learner", slot: null, why: "Says nothing about what he does." },
  { id: "open", text: "Open to opportunities", slot: null, why: "Open to Work says this. Say what you do here." },
  { id: "rockstar", text: "Rockstar developer", slot: null, why: "A boast. Nobody can check it." },
];

export const HEADLINE_CARD_CONFIG: SlotCardConfig = {
  cardTitle: "Amjad's new headline",
  claim: "Passionate developer | Lifelong learner",
  slots: HEADLINE_SLOTS,
  chips: HEADLINE_CHIPS,
  assembled: "Freelance web developer (Laravel, WordPress). I fix slow client sites and show the numbers.",
  hint: "Tap a chip, then the part it fills. Or drag the chip onto the part.",
  endNote: "The first words now say what he does. No number is invented: the headline promises to show them.",
};

export const careerM7HeadlineParts: CustomCanvasSpec = {
  kind: "custom",
  title: "Write a headline a stranger understands",
  purpose: "Build Amjad's new headline from three parts: his role, his tools and what he does. 'Passionate', 'lifelong learner', 'open to opportunities' and 'rockstar' are refused with a reason.",
  limits:
    "Amjad is a fictional fellow. No character count is given: type your headline in the editor and read the counter on your own screen. Checked 2026-10. A headline is a summary of your About section, so write it last.",
  component: makeSlotCardCanvas(HEADLINE_CARD_CONFIG),
};
