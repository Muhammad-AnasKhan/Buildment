import type { CustomCanvasSpec } from "../registry";
import type { CardSlot, SlotChip } from "../models/slot-card";
import { makeSlotCardCanvas } from "../primitives/canvas-factories";
import type { SlotCardConfig } from "../primitives/slot-card";

// Course 16 (career-brand), 8.4 beat 3: build Areej's home page from five specifics and refuse four generic parts.
// Fictional people only. No dashes.

export const SWAP_GENERIC_SLOTS: CardSlot[] = [
  {
    id: "photo",
    label: "Photo"
  },
  {
    id: "intro",
    label: "Intro line"
  },
  {
    id: "dates",
    label: "Dates"
  },
  {
    id: "number",
    label: "A number"
  },
  {
    id: "mistake",
    label: "A mistake"
  }
];

export const SWAP_GENERIC_CHIPS: SlotChip[] = [
  {
    id: "photo",
    text: "A real screenshot of the dashboard",
    slot: "photo",
    why: "Real screenshots show real work."
  },
  {
    id: "intro",
    text: "I measure before and after, and write it down",
    slot: "intro",
    why: "This is her own line, in her own words."
  },
  {
    id: "dates",
    text: "Every post has a date",
    slot: "dates",
    why: "Dates show when it was true."
  },
  {
    id: "number",
    text: "p95 820 ms to 95 ms, same test",
    slot: "number",
    why: "A number with its test, which a reader can check."
  },
  {
    id: "mistake",
    text: "I tested only on seeded data (made up on purpose), not production data",
    slot: "mistake",
    why: "An honest limit makes the rest believable."
  },
  {
    id: "stock",
    text: "A stock photo of a laptop",
    slot: null,
    why: "A stock photo says nothing about you."
  },
  {
    id: "slogan",
    text: "I am passionate and love solving problems",
    slot: null,
    why: "The template line. Anyone could write it."
  },
  {
    id: "nodates",
    text: "No dates, so it never looks old",
    slot: null,
    why: "No date hides when it was true."
  },
  {
    id: "humaniser",
    text: "Run the text through a humaniser",
    slot: null,
    why: "It changes style, not facts."
  }
];

export const SWAP_GENERIC_CONFIG: SlotCardConfig = {
  cardTitle: "Areej's home page",
  claim: "A page that could be anyone's",
  slots: SWAP_GENERIC_SLOTS,
  chips: SWAP_GENERIC_CHIPS,
  assembled: "A real screenshot of the dashboard. I measure before and after, and write it down. Every post has a date. p95 820 ms to 95 ms, same test. I tested only on seeded data (made up on purpose), not production data.",
  hint: "Tap a chip, then the part it fills. Or drag the chip onto the part.",
  endNote: "Each part is something only the writer could add. The generic ones are easy to write and tell a visitor nothing.",
};

export const careerM8SwapGeneric: CustomCanvasSpec = {
  kind: "custom",
  title: "Swap generic for specific",
  purpose: "Build Areej's home page from five specifics: a real screenshot, her own line, dates, a number and an honest mistake. A stock photo, a slogan, hidden dates and a humaniser are refused with a reason.",
  limits: "A real home page has more than five parts. Her numbers are illustrative. Detectors misjudge second-language English, so beating one is not a goal.",
  component: makeSlotCardCanvas(SWAP_GENERIC_CONFIG),
};
