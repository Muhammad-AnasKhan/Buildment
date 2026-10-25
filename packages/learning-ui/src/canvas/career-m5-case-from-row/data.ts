import type { CustomCanvasSpec } from "../registry";
import type { CardSlot, SlotChip } from "../models/slot-card";
import { makeSlotCardCanvas } from "../primitives/canvas-factories";
import type { SlotCardConfig } from "../primitives/slot-card";

// Course 16 (career-brand), module 5, chapter 5.5 beat 2: Build it from a ledger row.
// Fill the six sections of Areej's case study from her ledger rows R1 and R2; a boast, a vague percentage and a 'we' are refused.

export const CASE_SLOTS: CardSlot[] = [
  {
    id: "problem",
    label: "Problem"
  },
  {
    id: "before",
    label: "Before"
  },
  {
    id: "did",
    label: "What I did"
  },
  {
    id: "after",
    label: "After"
  },
  {
    id: "changed",
    label: "Changed too"
  },
  {
    id: "differently",
    label: "Differently"
  }
];

export const CASE_CHIPS: SlotChip[] = [
  {
    id: "problem",
    text: "Operations staff open a slow report many times a day",
    slot: "problem",
    why: "This is the problem and who felt it."
  },
  {
    id: "before",
    text: "p95 4.6 s over 14 days (team dashboard); plan 3,840 ms",
    slot: "before",
    why: "These are the numbers before, with their source."
  },
  {
    id: "did",
    text: "I found the scan and added an index; my lead reviewed and scheduled it",
    slot: "did",
    why: "This splits my part from the team's part."
  },
  {
    id: "after",
    text: "p95 0.41 s over 14 days, same dashboard; plan 46 ms",
    slot: "after",
    why: "These are the numbers after, same source and window."
  },
  {
    id: "changed",
    text: "A 20 May front-end release; requests 6,300 then 6,100",
    slot: "changed",
    why: "This says what else changed in the window."
  },
  {
    id: "differently",
    text: "Add a slow-query alert so the next one is found sooner",
    slot: "differently",
    why: "This is what she would do differently."
  },
  {
    id: "best",
    text: "The best fix of the year",
    slot: null,
    why: "No one can check this."
  },
  {
    id: "ninety",
    text: "Performance improved 90 percent",
    slot: null,
    why: "No metric, window or source."
  },
  {
    id: "we",
    text: "We fixed the whole platform",
    slot: null,
    why: "'We' hides who did what."
  }
];

export const CASE_STUDY_CONFIG: SlotCardConfig = {
  cardTitle: "Areej's case study",
  claim: "Fixing a slow report with one index",
  assembled: "Operations staff open a slow report many times a day. Before: p95 4.6 s over 14 days (team dashboard); plan 3,840 ms. I found the scan and added an index; my lead reviewed and scheduled it. After: p95 0.41 s over 14 days, same dashboard; plan 46 ms. Also changed: a 20 May front-end release; requests 6,300 then 6,100. Differently: add a slow-query alert so the next one is found sooner.",
  hint: "Tap a chip, then the section it fills. Or drag the chip onto the section.",
  endNote: "Every section comes from a ledger row. A reader can ask about any of them and find the answer.",
  slots: CASE_SLOTS,
  chips: CASE_CHIPS,
};

export const careerM5CaseFromRow: CustomCanvasSpec = {
  kind: "custom",
  title: "Build it from a ledger row",
  purpose: "Fill the six sections of Areej's case study from her ledger rows: problem, before, what I did, after, what else changed, and what she would do differently. A boast and a vague percentage are refused.",
  limits: "A real case study has a title, images and a link to the proof. The numbers are from Areej's notes and are illustrative. Names are removed in public; the company is 'a parcel delivery company'. Areej is a fictional fellow.",
  component: makeSlotCardCanvas(CASE_STUDY_CONFIG),
};
