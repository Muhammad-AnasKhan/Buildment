import type { CustomCanvasSpec } from "../registry";
import type { CardSlot, SlotChip } from "../models/slot-card";
import { makeSlotCardCanvas } from "../primitives/canvas-factories";
import type { SlotCardConfig } from "../primitives/slot-card";

// Course 16 (career-brand), module 2, chapter 2.3 (spec beat 2): Fill the role card
// Data copied from canvas-specs/career-m2-role-card.md. Characters and numbers are fictional and illustrative.

export const ROLE_CARD_SLOTS: CardSlot[] = [
  { id: "situation", label: "Situation" },
  { id: "did", label: "I did" },
  { id: "team", label: "Team did" },
  { id: "result", label: "Result" },
  { id: "proof", label: "Proof" },
  { id: "show", label: "May I show?" },
];

export const ROLE_CARD_CHIPS: SlotChip[] = [
  { id: "situation", text: "Sign-ups were in three shared spreadsheets", slot: "situation", why: "This is where things stood before: the Situation." },
  { id: "did", text: "Built a web form and database; moved the old data", slot: "did", why: "This is what Areej did herself: I did." },
  { id: "team", text: "Organisers chose the fields and tested it", slot: "team", why: "This is what the others did: Team did." },
  { id: "result", text: "412 rows, 57 duplicates, 355 imported; clashes 9 to 1", slot: "result", why: "This is what changed, in numbers: the Result." },
  { id: "proof", text: "Row counts per session; clash count from the group chat", slot: "proof", why: "This says where the numbers can be checked." },
  { id: "show", text: "Numbers only. No names or sign-up data", slot: "show", why: "This says what may be shown in public." },
  { id: "skill", text: "Great at databases", slot: null, why: "A skill word is not a result." },
  { id: "form-credit", text: "Double bookings fell 9 to 1, thanks to the form", slot: null, why: "Sessions also went from three to two a week." },
  { id: "led", text: "I led the whole club", slot: null, why: "She was one organiser on a team." },
];

export const ROLE_CARD_CONFIG: SlotCardConfig = {
  cardTitle: "Areej's volunteer card",
  claim: "Sign-up migration for the coding club",
  slots: ROLE_CARD_SLOTS,
  chips: ROLE_CARD_CHIPS,
  assembled: "Sign-ups were in three shared spreadsheets. I built a web form and database and moved the old data; the organisers chose the fields and tested it. 412 rows, 57 duplicates, 355 imported; clashes fell from 9 to 1, but sessions also dropped from three to two a week. Proof: row counts per session and the group chat count. In public: numbers only, no names.",
  hint: "Tap a chip, then the field it fills. Or drag the chip onto the field.",
  endNote: "Every field now holds something a reader can ask about, and the caveat about fewer sessions is part of the honest card.",
};

export const careerM2RoleCard: CustomCanvasSpec = {
  kind: "custom",
  title: "Fill the role card",
  purpose: "Fill Areej's volunteer role card (situation, what I did, what the team did, result, proof, may I show it) from snippets; a skill word, a boast and a number that credits the wrong cause are refused with a reason.",
  limits: "A real role card can have more fields. The numbers come from Areej's notes and are illustrative. 'Where the proof lives' may honestly be 'unknown' until module 3. Areej and the club are fictional.",
  component: makeSlotCardCanvas(ROLE_CARD_CONFIG),
};
