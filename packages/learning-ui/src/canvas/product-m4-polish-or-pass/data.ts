import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.2: the same booking form for Ghurfa, a library
// group-room page that Rand built (fictional), at three amounts of care. The
// polished version looks nice and fails three checks the reader met in
// modules 2 and 3. The plain version passes them. The clear version also puts
// one thing first and cuts what the job does not need.

export const POLISHED: SpecScreen = {
  alt: "A polished booking form: a soft shadow, rounded corners, an icon tile and a big title, but pale grey hint text, fields with placeholders only and a small Book button.",
  blocks: [
    {
      kind: "box",
      shadow: true,
      radius: 18,
      pad: 14,
      gap: 10,
      children: [
        { kind: "icon", glyph: "spark", tile: true, size: 16 },
        { kind: "text", text: "Book a room", size: 22, weight: 800 },
        { kind: "text", text: "Pick a time and we do the rest", size: 12, tone: "faint" },
        { kind: "field", placeholder: "Date" },
        { kind: "field", placeholder: "Time" },
        { kind: "button", label: "Book", size: 11 },
      ],
    },
  ],
};

export const PLAIN: SpecScreen = {
  alt: "A plain booking form: every field has a label above it, a hint under the time, readable text and one wide Book button.",
  blocks: [
    { kind: "nav", title: "Book a room" },
    { kind: "field", label: "Date", value: "Tomorrow" },
    { kind: "field", label: "Time", value: "4 pm to 6 pm", hint: "Rooms are open 8 am to 8 pm." },
    { kind: "field", label: "People", value: "4" },
    { kind: "button", label: "Book a room", full: true, size: 17 },
  ],
};

export const CLEAR: SpecScreen = {
  alt: "A clear booking form: the free room and time is the largest line, there is one field for the number of people, and one wide button that names the time.",
  blocks: [
    { kind: "nav", title: "Book a room" },
    { kind: "text", text: "Room 2 is free 4 to 6 pm", size: 22, weight: 700 },
    { kind: "text", text: "Tomorrow. Seats 6.", size: 13, tone: "muted" },
    { kind: "field", label: "How many people?", value: "4" },
    { kind: "button", label: "Book 4 to 6 pm", full: true, size: 17 },
  ],
};

export const productM4PolishOrPass: CustomCanvasSpec = {
  kind: "custom",
  title: "Polished, plain and clear",
  purpose: "Switch between three versions of one booking form and see which one passes the checks, which one only looks finished, and which one puts one thing first.",
  limits:
    "A picture can show some checks, such as visible labels and button size, and not others, such as keyboard use. The units are not pixels on your phone. Ghurfa and Rand are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    versions: [
      { id: "polished", label: "Polished", screen: POLISHED, verdict: { text: "Looks nice, checks fail", tone: "warn" } },
      { id: "plain", label: "Plain", screen: PLAIN, verdict: { text: "Plain, checks pass", tone: "good" } },
      { id: "clear", label: "Clear", screen: CLEAR, verdict: { text: "Plain, one thing first", tone: "good" } },
    ],
    hint: "Switch between the three versions and compare what each one does.",
    start: "polished",
  }),
};
