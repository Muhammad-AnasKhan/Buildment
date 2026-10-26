import type { CustomCanvasSpec } from "../registry";
import type { CardSlot, SlotChip } from "../models/slot-card";
import { makeSlotCardCanvas } from "../primitives/canvas-factories";
import type { SlotCardConfig } from "../primitives/slot-card";

// Course 16 (career-brand), module 6, chapter 6.3 beat 2: Build a bullet from a claim card.

export const BULLET_SLOTS: CardSlot[] = [
  {
    "id": "owned",
    "label": "Owned"
  },
  {
    "id": "change",
    "label": "Change"
  },
  {
    "id": "window",
    "label": "Window"
  },
  {
    "id": "how",
    "label": "How"
  },
  {
    "id": "share",
    "label": "My share"
  }
];

export const BULLET_CHIPS: SlotChip[] = [
  {
    "id": "owned",
    "text": "Cut the p95 of a daily orders report",
    "slot": "owned",
    "why": "This is what she owned, with a strong verb."
  },
  {
    "id": "change",
    "text": "from 4.6 s to 0.41 s",
    "slot": "change",
    "why": "This is the change: the before and the after."
  },
  {
    "id": "window",
    "text": "(14 days before and after)",
    "slot": "window",
    "why": "This says how long it was measured: the Window."
  },
  {
    "id": "how",
    "text": "by finding a full-table scan and adding a composite index",
    "slot": "how",
    "why": "This says how she did it."
  },
  {
    "id": "share",
    "text": "my lead reviewed and scheduled the release",
    "slot": "share",
    "why": "This says the team's part, so hers is believable."
  },
  {
    "id": "worked-on",
    "text": "Worked on backend performance",
    "slot": null,
    "why": "No change, no number, no window."
  },
  {
    "id": "ninety",
    "text": "Improved speed by 90%",
    "slot": null,
    "why": "90 percent of what, over which days?"
  },
  {
    "id": "leveraging",
    "text": "Leveraging cutting-edge technologies",
    "slot": null,
    "why": "An empty phrase. Nothing to check."
  }
];

export const BULLET_CARD_CONFIG: SlotCardConfig = {
  slots: BULLET_SLOTS,
  chips: BULLET_CHIPS,
  cardTitle: "Areej's resume bullet",
  claim: "Worked on backend performance",
  assembled: "Cut the p95 of a daily orders report from 4.6 s to 0.41 s (14 days before and after) by finding a full-table scan and adding a composite index; my lead reviewed and scheduled the release.",
  hint: "Tap a chip, then the part it fills. Or drag the chip onto the part.",
  endNote: "A reader can now ask how it was measured and what her part was, and every answer is already in the bullet or the ledger.",
};

export const careerM6BuildABullet: CustomCanvasSpec = {
  kind: "custom",
  title: "Build a bullet from a claim card",
  purpose: "Fill Areej's resume bullet (owned, change, window, how, my share) from snippets of her claim card. Her old lines, 'worked on backend performance', 'improved speed by 90%' and an empty phrase, are refused with a reason.",
  limits: "A real bullet may need a source in brackets and a shorter wording for a one-page resume. The numbers are from Areej's notes and are illustrative.",
  component: makeSlotCardCanvas(BULLET_CARD_CONFIG),
};
