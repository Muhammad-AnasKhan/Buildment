import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.2: how long the wait is decides what to show.
// Four waits on Halaqa (fictional): 0.4 seconds, 3 seconds, 12 seconds and a
// 40 second file upload. At every stop the screen draws two columns: the
// indicator that does not fit that wait on the left, the one that does on the
// right. Under a second shows nothing special; two to ten seconds shows that
// something is happening; over ten seconds says how long.

function column(tag: "Not this" | "This", tone: "bad" | "good", children: SpecBlock[]): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 8,
    gap: 8,
    children: [{ kind: "pill", text: tag, tone }, ...children],
  };
}

function stop(alt: string, wait: string, wrong: SpecBlock[], right: SpecBlock[]): SpecScreen {
  return {
    alt,
    frame: "none",
    width: 316,
    pad: 8,
    gap: 8,
    blocks: [
      { kind: "text", text: wait, size: 13, weight: 700 },
      { kind: "row", gap: 8, children: [column("Not this", "bad", wrong), column("This", "good", right)] },
      { kind: "space", height: 20 },
    ],
  };
}

const CARD: SpecBlock[] = [
  { kind: "text", text: "Data structures, exam Thursday", size: 12, weight: 600 },
  { kind: "text", text: "Tonight 8 pm, library room 2", size: 11.5, tone: "muted" },
  { kind: "text", text: "2 seats left", size: 11.5, weight: 600, tone: "accent" },
];

const STEPS: { seconds: string; screen: SpecScreen; text: string; tone: "warn" | "bad" }[] = [
  {
    seconds: "0.4",
    text: "A spinner here only flashes",
    tone: "warn",
    screen: stop(
      "After 0.4 seconds. Left, not this: a spinner that flashes for a moment. Right: the list simply appears.",
      "After 0.4 seconds",
      [{ kind: "spinner", label: "Finding groups..." }, { kind: "space", height: 50 }],
      CARD
    ),
  },
  {
    seconds: "3",
    text: "A blank leaves people guessing",
    tone: "bad",
    screen: stop(
      "After 3 seconds. Left, not this: a blank area under the title. Right: a spinner with the words Finding groups.",
      "After 3 seconds",
      [{ kind: "text", text: "Study groups", size: 12, weight: 600 }, { kind: "space", height: 60 }],
      [{ kind: "text", text: "Study groups", size: 12, weight: 600 }, { kind: "spinner", label: "Finding groups..." }, { kind: "space", height: 30 }]
    ),
  },
  {
    seconds: "12",
    text: "A bare spinner hides the time",
    tone: "bad",
    screen: stop(
      "After 12 seconds. Left, not this: a spinner with no words. Right: a bar showing 3 of 8 groups and a line that this takes about 12 seconds.",
      "After 12 seconds",
      [{ kind: "spinner" }, { kind: "space", height: 56 }],
      [
        { kind: "progress", label: "Loaded 3 of 8 groups", value: 3 / 8 },
        { kind: "text", text: "About 12 seconds on a slow connection.", size: 11.5, tone: "muted" },
      ]
    ),
  },
  {
    seconds: "40",
    text: "An upload needs a bar",
    tone: "warn",
    screen: stop(
      "A 40 second upload of notes.pdf. Left, not this: a spinner with the word Uploading. Right: a bar at 45 percent and a line that about 20 seconds are left.",
      "A 40 second upload",
      [{ kind: "spinner", label: "Uploading..." }, { kind: "space", height: 50 }],
      [
        { kind: "progress", label: "Uploading: 45%", value: 0.45 },
        { kind: "text", text: "About 20 seconds left.", size: 11.5, tone: "muted" },
      ]
    ),
  },
];

export const productM3WaitLadder: CustomCanvasSpec = {
  kind: "custom",
  title: "How long the wait is",
  purpose: "Drag along four waits and compare, at each one, the indicator that does not fit with the one that does.",
  limits:
    "The limits come from Nielsen's guidance and from NN/g. They are practical guides, not new measurements. Between 1 and 2 seconds the sources give no firm rule. The numbers on this fictional screen are made up.",
  component: makeSpecimenLadderCanvas({
    label: "Length of the wait",
    steps: STEPS.map((s) => ({ screen: s.screen, verdict: { text: s.text, tone: s.tone }, valueText: `Wait of ${s.seconds} seconds` })),
    ends: ["short", "long"],
    caption: "Length of the wait",
    hint: "Drag across the picture to make the wait longer. Compare the two columns.",
    start: 0,
  }),
};
