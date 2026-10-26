import type { CustomCanvasSpec } from "../registry";
import type { CardSlot, SlotChip } from "../models/slot-card";
import { makeSlotCardCanvas } from "../primitives/canvas-factories";
import type { SlotCardConfig } from "../primitives/slot-card";

// Course 16 (career-brand), module 3, chapter 3.2 beat 3: Fill the claim card.
// A number becomes a claim a reader can check only when it has its parts: what was measured, before, after, over what window, from what source, and who did what. A number that belongs to the whole team is not yours alone.
// Tawfiq is a fictional fellow; his numbers are illustrative (canon scene 3.1). The seventh part of a
// claim card, what else changed, is carried by beat 4 and sits in the "Your share" chip.

export const CLAIM_SLOTS: CardSlot[] = [
  {
    "id": "metric",
    "label": "Metric"
  },
  {
    "id": "before",
    "label": "Before"
  },
  {
    "id": "after",
    "label": "After"
  },
  {
    "id": "window",
    "label": "Window"
  },
  {
    "id": "source",
    "label": "Source"
  },
  {
    "id": "share",
    "label": "Your share"
  }
];

export const CLAIM_CHIPS: SlotChip[] = [
  {
    "id": "metric",
    "text": "Run time of the join step in the nightly run",
    "slot": "metric",
    "why": "This names what was measured: the Metric."
  },
  {
    "id": "before",
    "text": "50 minutes",
    "slot": "before",
    "why": "This is the run time before the change."
  },
  {
    "id": "after",
    "text": "20 minutes",
    "slot": "after",
    "why": "This is the run time after the change."
  },
  {
    "id": "window",
    "text": "The nights before and after my change",
    "slot": "window",
    "why": "This says how long it was measured: the Window."
  },
  {
    "id": "source",
    "text": "The nightly job logs",
    "slot": "source",
    "why": "This says where the numbers come from: the Source."
  },
  {
    "id": "share",
    "text": "I rewrote the join step; new machines helped",
    "slot": "share",
    "why": "This says who did what: Your share."
  },
  {
    "id": "team-number",
    "text": "70 percent, 5 hours down to 1.5 hours",
    "slot": null,
    "why": "New machines helped too. It is not only his."
  },
  {
    "id": "felt",
    "text": "It felt much faster",
    "slot": null,
    "why": "A feeling is not a measurement."
  },
  {
    "id": "ai-estimate",
    "text": "About 70 percent, the AI estimated",
    "slot": null,
    "why": "A tool's guess is not a source."
  }
];

export const CLAIM_CARD_CONFIG: SlotCardConfig = {
  cardTitle: "Tawfiq's claim card",
  claim: "Made the nightly pipeline 70 percent faster",
  slots: CLAIM_SLOTS,
  chips: CLAIM_CHIPS,
  assembled:
    "Cut the run time of the join step in the nightly run from 50 to 20 minutes (nightly job logs, the nights before and after my change); I rewrote the join step, and new machines helped the whole run that week.",
  hint: "Tap a chip, then the slot it fills. Or drag the chip onto the slot.",
  endNote: "The 70 percent was real for the whole run. This card claims only what the logs show was his, and names the help.",
};

export const careerM3ClaimCard: CustomCanvasSpec = {
  kind: "custom",
  title: "Fill the claim card",
  purpose: "Fill Tawfiq's claim card (metric, before, after, window, source, your share) from snippets; a feeling, a tool's guess and the team's 70 percent are refused with a reason, and the finished card reads as one checkable sentence.",
  limits:
    "A real claim card can need more parts, such as what else changed in the same weeks (the next picture). The window here is described, not counted, because the story gives no number of nights. Tawfiq, his team and the numbers are fictional and illustrative.",
  component: makeSlotCardCanvas(CLAIM_CARD_CONFIG),
};
