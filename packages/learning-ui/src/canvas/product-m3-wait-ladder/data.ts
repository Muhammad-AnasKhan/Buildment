import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.2: how long the wait is decides what to show.
// Four waits on Halaqa (fictional): 0.4 seconds, 3 seconds, 12 seconds and a
// 40 second file upload. Under a second shows nothing special; two to ten
// seconds shows that something is happening; over ten seconds says how long.

const TOP: SpecBlock[] = [
  { kind: "nav", title: "Study groups" },
  { kind: "text", text: "Showing: Data structures", size: 12.5, tone: "muted" },
];

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

const STEPS: { seconds: string; screen: SpecScreen; text: string; tone: "good" }[] = [
  {
    seconds: "0.4",
    text: "Show nothing special",
    tone: "good",
    screen: {
      alt: "The list of groups appears at once, with no spinner.",
      blocks: [...TOP, group("Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left"), group("Data structures problem set", "Tomorrow 5 pm, online", "4 seats left")],
    },
  },
  {
    seconds: "3",
    text: "Show that it is working",
    tone: "good",
    screen: {
      alt: "A spinner with the words Finding groups, and nothing else to read yet.",
      blocks: [...TOP, { kind: "spinner", label: "Finding groups..." }, { kind: "space", height: 90 }],
    },
  },
  {
    seconds: "12",
    text: "Say how long it will take",
    tone: "good",
    screen: {
      alt: "A bar showing 3 of 8 groups loaded and a line that this takes about 12 seconds on a slow connection.",
      blocks: [
        ...TOP,
        { kind: "progress", label: "Loading groups: 3 of 8", value: 3 / 8 },
        { kind: "text", text: "This takes about 12 seconds on a slow connection.", size: 12.5, tone: "muted" },
        { kind: "space", height: 70 },
      ],
    },
  },
  {
    seconds: "40",
    text: "Use a bar for uploads",
    tone: "good",
    screen: {
      alt: "A file upload for notes.pdf with a bar at 45 percent and a line that about 20 seconds are left.",
      blocks: [
        { kind: "nav", title: "Share notes" },
        { kind: "text", text: "notes.pdf, 6 MB", size: 12.5, tone: "muted" },
        { kind: "progress", label: "Uploading: 45%", value: 0.45 },
        { kind: "text", text: "About 20 seconds left.", size: 12.5, tone: "muted" },
        { kind: "space", height: 70 },
      ],
    },
  },
];

export const productM3WaitLadder: CustomCanvasSpec = {
  kind: "custom",
  title: "How long the wait is",
  purpose: "Drag along four waits, from 0.4 seconds to a 40 second upload, and see what the screen should show at each length.",
  limits:
    "The limits come from Nielsen's guidance and from NN/g, which are rules of thumb, not new measurements. Between 1 and 2 seconds the sources give no firm rule. The numbers on this fictional screen are made up.",
  component: makeSpecimenLadderCanvas({
    label: "Length of the wait",
    steps: STEPS.map((s) => ({ screen: s.screen, verdict: { text: s.text, tone: s.tone }, valueText: `Wait of ${s.seconds} seconds` })),
    ends: ["short", "long"],
    caption: "Length of the wait",
    hint: "Drag across the picture to make the wait longer.",
    start: 0,
  }),
};
