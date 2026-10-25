import type { CustomCanvasSpec } from "../registry";
import type { CardSlot, SlotChip } from "../models/slot-card";
import { makeSlotCardCanvas } from "../primitives/canvas-factories";
import type { SlotCardConfig } from "../primitives/slot-card";

// Course 16 (career-brand), module 3, chapter 3.2 beat 3: Tawfiq wrote "70
// percent faster pipeline". The learner fills his claim card from snippets;
// a feeling, a tool's guess and a superlative fit no slot. 50 to 15 minutes
// is a 70 percent cut, so the number survives once it has its parts. Tawfiq
// is fictional.

export const CLAIM_SLOTS: CardSlot[] = [
  { id: "metric", label: "Metric" },
  { id: "before", label: "Before" },
  { id: "after", label: "After" },
  { id: "window", label: "Window" },
  { id: "source", label: "Source" },
  { id: "share", label: "Your share" },
];

export const CLAIM_CHIPS: SlotChip[] = [
  { id: "metric", text: "Nightly pipeline run time", slot: "metric", why: "This names what was measured: the Metric." },
  { id: "before", text: "50 minutes, median of 14 nights", slot: "before", why: "This is the run time before the change." },
  { id: "after", text: "15 minutes, median of 14 nights", slot: "after", why: "This is the run time after the change." },
  { id: "window", text: "14 nights before and after the change", slot: "window", why: "This says how long it was measured: the Window." },
  { id: "source", text: "The scheduler's run history", slot: "source", why: "This says where the numbers come from: the Source." },
  { id: "share", text: "I rewrote the join step; a teammate added the index", slot: "share", why: "This says who did what: Your share." },
  { id: "felt", text: "It felt much faster", slot: null, why: "A feeling is not a measurement." },
  { id: "ai-estimate", text: "About 70 percent, the AI estimated", slot: null, why: "A tool's guess is not a source." },
  { id: "best-ever", text: "Best pipeline the team ever had", slot: null, why: "No one can check this." },
];

export const CLAIM_CARD_CONFIG: SlotCardConfig = {
  cardTitle: "Tawfiq's claim card",
  claim: "70 percent faster pipeline",
  slots: CLAIM_SLOTS,
  chips: CLAIM_CHIPS,
  assembled:
    "Cut the nightly pipeline's median run time from 50 to 15 minutes over 14 nights each side, from the scheduler's run history; I rewrote the join step and a teammate added the index.",
  hint: "Tap a chip, then the slot it fills. Or drag the chip onto the slot.",
  endNote: "Same 70 percent, now with its parts: a reader can ask about any one of them and get an answer.",
};

export const careerM3ClaimCard: CustomCanvasSpec = {
  kind: "custom",
  title: "Fill the claim card",
  purpose: "Fill Tawfiq's claim card (metric, before, after, window, source, your share) from snippets; a feeling, an AI estimate and a superlative are refused with a reason, and the finished card reads as one checkable sentence.",
  limits:
    "A real claim card can need more parts, such as what else changed in the same weeks. A median over 14 nights is one fair summary, not the only one. Tawfiq, his team and the numbers are fictional.",
  component: makeSlotCardCanvas(CLAIM_CARD_CONFIG),
};
