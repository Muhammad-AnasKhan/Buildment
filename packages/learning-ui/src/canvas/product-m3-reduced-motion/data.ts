import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.5: what a page does when the reader asks for less
// motion. After a join on Halaqa (fictional) the seats go from 2 to 1. With
// only a pulsing tick, nothing says it worked once the pulse is gone. With the
// reduced-motion version, the tick stays still and words say the same thing.

const HEAD: SpecBlock[] = [
  { kind: "text", text: "Data structures, exam Thursday", size: 15, weight: 700 },
  { kind: "text", text: "Tonight 8 pm, library room 2", size: 12.5, tone: "muted" },
];

const MOTION_ONLY: SpecScreen = {
  alt: "A group page after Join is tapped. A green tick tile pulses beside the title and nothing else says that the join worked. Take the pulse away and only a small icon remains.",
  blocks: [
    { kind: "nav", title: "Study group" },
    ...HEAD,
    { kind: "icon", glyph: "check", tile: true, tone: "good", size: 18, motion: "pulse" },
    { kind: "space", height: 60 },
  ],
};

const IN_WORDS: SpecScreen = {
  alt: "The same page when the reader asks for reduced motion. The tick is still and the words You joined, 1 seat left sit beside it.",
  blocks: [
    { kind: "nav", title: "Study group" },
    ...HEAD,
    {
      kind: "row",
      gap: 10,
      weights: [1, 5],
      children: [
        { kind: "icon", glyph: "check", tile: true, tone: "good", size: 18 },
        {
          kind: "box",
          fill: "none",
          pad: 0,
          gap: 2,
          children: [
            { kind: "text", text: "You joined", size: 14, weight: 700 },
            { kind: "text", text: "1 seat left", size: 12.5, weight: 600, tone: "accent" },
          ],
        },
      ],
    },
    { kind: "space", height: 40 },
  ],
};

export const productM3ReducedMotion: CustomCanvasSpec = {
  kind: "custom",
  title: "Less motion, same news",
  purpose: "Switch between a join that is confirmed only by a pulse and the version for a reader who asked for less motion, where words say the same thing.",
  limits:
    "A reader who asked for reduced motion sees no pulse on either screen. The first screen is drawn to show what would be left. Reduced motion means less non-essential movement, not no feedback. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Page",
    versions: [
      { id: "motion", label: "Pulse only", screen: MOTION_ONLY, verdict: { text: "Only a pulse says it worked", tone: "warn" } },
      { id: "words", label: "In words", screen: IN_WORDS, verdict: { text: "Words say it worked", tone: "good" } },
    ],
    hint: "Switch between the two pages, then imagine the pulse switched off.",
    start: "motion",
  }),
};
