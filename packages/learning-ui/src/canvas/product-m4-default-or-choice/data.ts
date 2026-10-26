import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.3: Ghurfa's room list (fictional) as a framework
// leaves it, then with three changes made one at a time, each with a job:
// type, colour and real content. Every version keeps the earlier changes.

function room(opts: {
  name: string;
  nameSize: number;
  status: { text: string; tone: "accent" | "good" | "neutral" };
  detail: string;
  button?: { label: string; variant: "primary" | "secondary" };
}): SpecBlock {
  const children: SpecBlock[] = [
    { kind: "text", text: opts.name, size: opts.nameSize, weight: 600 },
    { kind: "pill", text: opts.status.text, tone: opts.status.tone },
    { kind: "text", text: opts.detail, size: 13 },
  ];
  if (opts.button) children.push({ kind: "button", label: opts.button.label, variant: opts.button.variant, size: 12 });
  return { kind: "box", border: true, pad: 10, gap: 6, children };
}

export const DEFAULTS: SpecScreen = {
  alt: "A room list left on framework defaults: a plain title, three accent-coloured category pills, and two room boxes that each have an accent status pill and an accent Book button.",
  blocks: [
    { kind: "text", text: "Welcome to Library Booking", size: 16, weight: 600 },
    { kind: "pills", items: [{ text: "Quiet", tone: "accent" }, { text: "Group", tone: "accent" }, { text: "Online", tone: "accent" }] },
    room({ name: "Room 1", nameSize: 14, status: { text: "Free", tone: "accent" }, detail: "Seats 6", button: { label: "Book", variant: "primary" } }),
    room({ name: "Room 2", nameSize: 14, status: { text: "Taken", tone: "accent" }, detail: "Seats 4", button: { label: "Book", variant: "primary" } }),
  ],
};

export const TYPE_CHOSEN: SpecScreen = {
  alt: "The same room list with a chosen type: the title is larger and is the only serif line, and the room names and details use two sans sizes.",
  blocks: [
    { kind: "text", text: "Welcome to Library Booking", size: 22, weight: 700, font: "serif" },
    { kind: "pills", items: [{ text: "Quiet", tone: "accent" }, { text: "Group", tone: "accent" }, { text: "Online", tone: "accent" }] },
    room({ name: "Room 1", nameSize: 15, status: { text: "Free", tone: "accent" }, detail: "Seats 6", button: { label: "Book", variant: "primary" } }),
    room({ name: "Room 2", nameSize: 15, status: { text: "Taken", tone: "accent" }, detail: "Seats 4", button: { label: "Book", variant: "primary" } }),
  ],
};

export const COLOUR_CHOSEN: SpecScreen = {
  alt: "The same room list with colour that has a job: category pills are neutral, Free is green, Taken is neutral, and only the Book button for the free room uses the accent.",
  blocks: [
    { kind: "text", text: "Welcome to Library Booking", size: 22, weight: 700, font: "serif" },
    { kind: "pills", items: [{ text: "Quiet" }, { text: "Group" }, { text: "Online" }] },
    room({ name: "Room 1", nameSize: 15, status: { text: "Free", tone: "good" }, detail: "Seats 6", button: { label: "Book", variant: "primary" } }),
    room({ name: "Room 2", nameSize: 15, status: { text: "Taken", tone: "neutral" }, detail: "Seats 4", button: { label: "Book", variant: "secondary" } }),
  ],
};

export const CONTENT_CHOSEN: SpecScreen = {
  alt: "The same room list with real content: the title says free rooms tonight, each room shows its free hours, and the button names the time it books.",
  blocks: [
    { kind: "text", text: "Free rooms tonight", size: 22, weight: 700, font: "serif" },
    room({ name: "Room 2", nameSize: 15, status: { text: "Free", tone: "good" }, detail: "Seats 6. Free 4 to 6 pm.", button: { label: "Book 4 to 6 pm", variant: "primary" } }),
    room({ name: "Room 4", nameSize: 15, status: { text: "Taken", tone: "neutral" }, detail: "Seats 4. Free from 7 pm.", button: { label: "Book from 7 pm", variant: "secondary" } }),
  ],
};

export const productM4DefaultOrChoice: CustomCanvasSpec = {
  kind: "custom",
  title: "Defaults and three choices",
  purpose: "Switch from a room list on framework defaults to the same list with a type choice, a colour choice and a content choice, each with a reason.",
  limits:
    "Three changes are not a recipe. A different product needs different choices, and a choice still has to pass the checks. The units are not pixels on your phone. Ghurfa is a fictional page.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    versions: [
      { id: "defaults", label: "Defaults", screen: DEFAULTS, verdict: { text: "Framework defaults, unchanged", tone: "accent" } },
      { id: "type", label: "Type", screen: TYPE_CHOSEN, verdict: { text: "Choice 1: type with a job", tone: "good" } },
      { id: "colour", label: "Colour", screen: COLOUR_CHOSEN, verdict: { text: "Choice 2: colour with a job", tone: "good" } },
      { id: "content", label: "Content", screen: CONTENT_CHOSEN, verdict: { text: "Choice 3: real content", tone: "good" } },
    ],
    hint: "Switch through the four versions. Each one keeps the changes before it.",
    start: "defaults",
  }),
};
