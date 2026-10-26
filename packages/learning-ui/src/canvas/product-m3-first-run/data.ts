import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.6: three first screens for a new student opening
// Halaqa (fictional). A four-step tour before any value, an empty first screen
// with no way to start, and a first screen that shows tonight's groups with
// one Join button and a hint beside it.

const TOUR: SpecScreen = {
  alt: "Halaqa's first screen is step 1 of a 4 step tour that lists groups, chat, files, polls, voice rooms and more, with Skip and Next buttons and no groups to see.",
  blocks: [
    { kind: "pill", text: "Step 1 of 4", tone: "accent" },
    { kind: "icon", glyph: "spark", tile: true, size: 22 },
    { kind: "text", text: "Welcome to Halaqa", size: 20, weight: 700 },
    { kind: "text", text: "Groups, chat, files, polls, voice rooms and more.", size: 13, tone: "muted" },
    { kind: "space", height: 40 },
    {
      kind: "row",
      gap: 10,
      weights: [1, 3],
      children: [
        { kind: "button", label: "Skip", variant: "ghost", full: true },
        { kind: "button", label: "Next", full: true },
      ],
    },
  ],
};

const EMPTY: SpecScreen = {
  alt: "Halaqa's first screen titled My groups with the words Nothing here and no way to start.",
  blocks: [
    { kind: "nav", title: "My groups" },
    { kind: "space", height: 90 },
    { kind: "text", text: "Nothing here", size: 14, tone: "muted", align: "center" },
    { kind: "space", height: 90 },
  ],
};

function group(name: string, when: string, seats: string, join: boolean): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 10,
    gap: 6,
    children: [
      { kind: "text", text: name, size: 14, weight: 600 },
      { kind: "text", text: when, size: 12.5, tone: "muted" },
      { kind: "text", text: seats, size: 12, weight: 600, tone: "accent" },
      ...(join ? ([{ kind: "button", label: "Join", full: true }, { kind: "text", text: "Tap Join to hold a seat. You can leave any time.", size: 11.5, tone: "muted" }] as SpecBlock[]) : []),
    ],
  };
}

const VALUE: SpecScreen = {
  alt: "Halaqa's first screen shows tonight's groups at the student's university, with the time, place and seats left, one Join button and a short hint beside it.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    { kind: "text", text: "Tonight at your university", size: 15, weight: 700 },
    group("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left", true),
    group("Statistics 101 revision", "Tomorrow 5 pm, online", "4 seats left", false),
  ],
};

export const productM3FirstRun: CustomCanvasSpec = {
  kind: "custom",
  title: "Three first screens",
  purpose: "Switch between three first screens a new student could meet: a tour, an empty screen, and tonight's groups with one Join button.",
  limits:
    "Tutorials can help with a new kind of interaction, and NN/g's evidence on first-run help is expert judgment, not a controlled test. The best first screen depends on the job. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "First screen",
    versions: [
      { id: "tour", label: "Tour", screen: TOUR, verdict: { text: "Four steps before any value", tone: "bad" } },
      { id: "empty", label: "Empty", screen: EMPTY, verdict: { text: "Empty, and no way to start", tone: "bad" } },
      { id: "value", label: "Value", screen: VALUE, verdict: { text: "Value now, help in place", tone: "good" } },
    ],
    hint: "Switch between the three first screens and ask what you can do on each.",
    start: "tour",
  }),
};
