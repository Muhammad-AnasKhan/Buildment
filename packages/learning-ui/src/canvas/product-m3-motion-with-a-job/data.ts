import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.5: motion with a job. The same Halaqa group page
// (fictional) three ways: four decorative loops, one motion that shows that
// the join is in progress, and the reduced-motion version where the same
// change is said in words. Motion is turned off by the reader's setting, so
// the third version has none of its own to switch off.

const HEAD: SpecBlock[] = [
  { kind: "text", text: "Data structures, exam Thursday", size: 15, weight: 700 },
  { kind: "text", text: "Tonight 8 pm, library room 2", size: 12.5, tone: "muted" },
  { kind: "text", text: "2 seats left", size: 12.5, weight: 600, tone: "accent" },
];

const BUSY: SpecScreen = {
  alt: "A group page where a New pill bounces, a star and a bolt spin and ping beside the title, and the Join button pulses, all in loops.",
  blocks: [
    { kind: "nav", title: "Study group" },
    { kind: "pill", text: "New", tone: "accent", motion: "bounce" },
    ...HEAD,
    {
      kind: "row",
      gap: 10,
      weights: [1, 1, 6],
      children: [
        { kind: "icon", glyph: "star", tile: true, size: 14, motion: "spin" },
        { kind: "icon", glyph: "bolt", tile: true, size: 14, motion: "ping" },
        { kind: "space", height: 1 },
      ],
    },
    { kind: "button", label: "Join", full: true, motion: "pulse" },
  ],
};

const SHOWS_CHANGE: SpecScreen = {
  alt: "The same group page after Join is tapped: a spinner turns beside the words Joining the group, and nothing else moves.",
  blocks: [
    { kind: "nav", title: "Study group" },
    ...HEAD,
    {
      kind: "row",
      gap: 10,
      weights: [1, 9],
      children: [
        // The motion belongs on the spinner alone, so the words beside it stay still.
        { kind: "spinner", motion: "spin" },
        { kind: "box", fill: "none", pad: 0, gap: 0, children: [{ kind: "space", height: 4 }, { kind: "text", text: "Joining the group...", size: 12.5, tone: "muted" }] },
      ],
    },
    { kind: "space", height: 60 },
  ],
};

const REDUCED: SpecScreen = {
  alt: "The same page when the reader asks for reduced motion: nothing moves, a Joining pill and a line of words say that the join is in progress and what the line will say when it is done.",
  blocks: [
    { kind: "nav", title: "Study group" },
    ...HEAD,
    { kind: "pill", text: "Joining", tone: "accent" },
    { kind: "text", text: "You are being added to the group. This line says You joined when it is done.", size: 12.5, tone: "muted" },
    { kind: "space", height: 30 },
  ],
};

export const productM3MotionWithAJob: CustomCanvasSpec = {
  kind: "custom",
  title: "Motion with a job",
  purpose: "Switch between a page where everything moves, a page where one motion shows that a join is in progress, and the reduced-motion version where words say the same thing.",
  limits:
    "The loops here repeat so you can see them. In a real app, a motion that shows a change plays once and stops. Reduced motion means less non-essential motion, not no feedback. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Motion",
    versions: [
      { id: "busy", label: "All move", screen: BUSY, verdict: { text: "Four loops, no job", tone: "bad" } },
      { id: "change", label: "One change", screen: SHOWS_CHANGE, verdict: { text: "One motion, one job", tone: "good" } },
      { id: "reduced", label: "Reduced", screen: REDUCED, verdict: { text: "The change is said in words", tone: "good" } },
    ],
    hint: "Switch between the three pages and watch what moves.",
    start: "busy",
  }),
};
