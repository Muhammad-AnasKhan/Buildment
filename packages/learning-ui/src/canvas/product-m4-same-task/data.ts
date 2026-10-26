import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.4: one task, "book a group room for tomorrow at
// 4 pm", in three made-up room-booking apps. The reader compares the first
// screen of each on the same task before writing a critique. The facts here
// are the ones the critique sorter's cards use.

export const APP_A: SpecScreen = {
  alt: "App A, first screen: a form with five fields that have placeholders only (full name, ID number, date, time, reason) and a small Submit button.",
  blocks: [
    { kind: "nav", title: "Reservations" },
    { kind: "field", placeholder: "Full name" },
    { kind: "field", placeholder: "ID number" },
    { kind: "field", placeholder: "Date" },
    { kind: "field", placeholder: "Time" },
    { kind: "field", placeholder: "Reason" },
    { kind: "button", label: "Submit", size: 11 },
  ],
};

export const APP_B: SpecScreen = {
  alt: "App B, first screen: tomorrow's free hours as chips with 4 pm chosen, a summary of Room 2 from 4 pm to 5 pm, and one wide button to book it.",
  blocks: [
    { kind: "nav", title: "Rooms" },
    { kind: "text", text: "Tomorrow", size: 16, weight: 700 },
    { kind: "pills", items: [{ text: "2 pm" }, { text: "3 pm" }, { text: "4 pm", tone: "accent" }, { text: "5 pm" }] },
    {
      kind: "box",
      border: true,
      pad: 10,
      gap: 4,
      children: [
        { kind: "text", text: "Room 2, 4 pm to 5 pm", size: 14, weight: 600 },
        { kind: "text", text: "Seats 6", size: 13, tone: "muted" },
      ],
    },
    { kind: "button", label: "Book Room 2", full: true, size: 16 },
  ],
};

export const APP_C: SpecScreen = {
  alt: "App C, first screen: a floor map of the library with a line that says to tap a room, and a note that times appear after you pick a room.",
  blocks: [
    { kind: "nav", title: "Find a room" },
    { kind: "text", text: "Tap a room on the map", size: 14, weight: 600 },
    { kind: "image", art: "map", height: 130 },
    { kind: "text", text: "Times appear after you pick a room.", size: 12, tone: "muted" },
  ],
};

export const productM4SameTask: CustomCanvasSpec = {
  kind: "custom",
  title: "One task, three apps",
  purpose: "Switch between the first screens of three made-up apps for the same task, booking a group room for tomorrow at 4 pm, and note what you can see in each.",
  limits:
    "A first screen is not a whole flow. A real comparison opens every step of the task and dates what it saw. These three apps are made up for the chapter.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "App",
    versions: [
      { id: "a", label: "App A", screen: APP_A, verdict: { text: "5 fields, placeholders only", tone: "accent" } },
      { id: "b", label: "App B", screen: APP_B, verdict: { text: "Free hours first, then confirm", tone: "accent" } },
      { id: "c", label: "App C", screen: APP_C, verdict: { text: "Map first, times come later", tone: "accent" } },
    ],
    hint: "Switch between the apps. Note what you see before you judge anything.",
    start: "a",
  }),
};
