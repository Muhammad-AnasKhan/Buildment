import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.2: every screen has four states. Halaqa's study
// groups screen (fictional) for the course "Data structures", drawn as empty,
// loading, error and full. Each state says what is happening; only the full
// state is the one most apps draw.

const TOP: SpecBlock[] = [
  { kind: "nav", title: "Study groups" },
  { kind: "text", text: "Showing: Data structures", size: 12.5, tone: "muted" },
];

const EMPTY: SpecScreen = {
  alt: "Halaqa's study groups screen with no groups for Data structures yet, a line about what a group is, and a Start a group button.",
  blocks: [
    ...TOP,
    {
      kind: "box",
      border: true,
      gap: 10,
      pad: 14,
      children: [
        { kind: "icon", glyph: "search", tile: true, size: 18 },
        { kind: "text", text: "No groups for Data structures yet", size: 15, weight: 700 },
        { kind: "text", text: "A group has a time, a place and seats. You can start one in a minute.", size: 12.5, tone: "muted" },
        { kind: "button", label: "Start a group" },
      ],
    },
  ],
};

const LOADING: SpecScreen = {
  alt: "Halaqa's study groups screen while loading: a spinner, the words Finding groups, a bar showing 3 of 8 loaded, and a line that the search is kept.",
  blocks: [
    ...TOP,
    { kind: "spinner", label: "Finding groups..." },
    { kind: "progress", label: "Loaded 3 of 8 groups", value: 3 / 8 },
    { kind: "text", text: "Your connection is slow. Your search is kept.", size: 12.5, tone: "muted" },
  ],
};

const ERROR: SpecScreen = {
  alt: "Halaqa's study groups screen after a failed load: a message that groups did not load because the connection dropped, that the search is kept, and a Try again button.",
  blocks: [
    ...TOP,
    {
      kind: "box",
      border: true,
      gap: 10,
      pad: 14,
      children: [
        { kind: "icon", glyph: "wifi", tile: true, size: 18, tone: "bad" },
        { kind: "text", text: "Groups did not load", size: 15, weight: 700 },
        { kind: "text", text: "The connection dropped before the list arrived. Your search is kept.", size: 12.5, tone: "muted" },
        { kind: "button", label: "Try again" },
      ],
    },
  ],
};

function group(name: string, when: string, seats: string): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 10,
    gap: 4,
    children: [
      { kind: "text", text: name, size: 14, weight: 600 },
      { kind: "text", text: when, size: 12.5, tone: "muted" },
      { kind: "text", text: seats, size: 12, weight: 600, tone: "accent" },
    ],
  };
}

const FULL: SpecScreen = {
  alt: "Halaqa's study groups screen with two groups for Data structures, each with a time, a place and seats left.",
  blocks: [
    ...TOP,
    group("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left"),
    group("Data structures problem set", "Tomorrow 5 pm, online", "4 seats left"),
  ],
};

export const productM3FourStates: CustomCanvasSpec = {
  kind: "custom",
  title: "Four states of one screen",
  purpose: "Switch Halaqa's study groups screen between its four states and see what each one tells the person.",
  limits:
    "The wording and the numbers are for this fictional screen. A real app needs its own words and its own loading times. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "State",
    versions: [
      { id: "empty", label: "Empty", screen: EMPTY, verdict: { text: "Says why and how to start", tone: "good" } },
      { id: "loading", label: "Loading", screen: LOADING, verdict: { text: "Shows it is working", tone: "good" } },
      { id: "error", label: "Error", screen: ERROR, verdict: { text: "Names the cause, gives a step", tone: "good" } },
      { id: "full", label: "Full", screen: FULL, verdict: { text: "The state most apps draw", tone: "accent" } },
    ],
    hint: "Tap each state and read what it says to the person.",
    start: "empty",
  }),
};
