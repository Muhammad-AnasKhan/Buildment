import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.4: how big a finger target should be. Three icon
// buttons on Halaqa's group page (fictional), from 16 to 48 units. The picture
// draws the phone 300 units wide, so one unit is one pixel of that phone. The
// icon stays 16 units; only the target around it grows, as in Material's
// advice that an icon can look small while its touch target is larger.

const CONTENT_WIDTH = 268; // phone width 300 minus 2 x 16 padding

function target(size: number, glyph: "inbox" | "clock" | "heart"): SpecBlock {
  return {
    kind: "box",
    fill: "accentSoft",
    border: "accent",
    radius: size >= 32 ? 8 : 4,
    pad: (size - 16) / 2,
    gap: 0,
    children: [{ kind: "icon", glyph, size: 16, tone: "accent" }],
  };
}

function screen(size: number, gap: number): SpecScreen {
  const used = size * 3 + gap * 2;
  const weights = gap > 0 ? [size, gap, size, gap, size, CONTENT_WIDTH - used] : [size, size, size, CONTENT_WIDTH - used];
  const space: SpecBlock = { kind: "space", height: 1 };
  const children: SpecBlock[] =
    gap > 0
      ? [target(size, "inbox"), space, target(size, "clock"), space, target(size, "heart"), space]
      : [target(size, "inbox"), target(size, "clock"), target(size, "heart"), space];
  return {
    alt: `Halaqa's group page with three icon buttons for messages, calendar and save, each ${size} by ${size} units${gap > 0 ? ` with ${gap} units between them` : " and touching"}.`,
    blocks: [
      { kind: "nav", title: "Data structures" },
      { kind: "text", text: "Exam Thursday. Tonight 8 pm, library room 2.", size: 12.5, tone: "muted" },
      { kind: "text", text: "Messages, calendar, save", size: 12, weight: 600 },
      { kind: "row", gap: 0, weights, children },
      { kind: "text", text: `Each target is ${size} by ${size}. Space between: ${gap}.`, size: 12, tone: "muted" },
      { kind: "space", height: 60 },
    ],
  };
}

const STEPS: { size: number; gap: number; text: string; tone: "good" | "warn" | "bad" }[] = [
  { size: 16, gap: 0, text: "Too small and too close", tone: "bad" },
  { size: 16, gap: 12, text: "Passes AA only by spacing", tone: "warn" },
  { size: 24, gap: 8, text: "At the AA floor", tone: "warn" },
  { size: 32, gap: 8, text: "Above the floor, under 44", tone: "warn" },
  { size: 44, gap: 8, text: "Good: about 44", tone: "good" },
  { size: 48, gap: 8, text: "Good: about 48", tone: "good" },
];

export const productM3TapTargets: CustomCanvasSpec = {
  kind: "custom",
  title: "How big should a finger target be?",
  purpose: "Drag along six sizes of three icon buttons, from 16 to 48 units, and see which sizes fall below the WCAG AA floor and which are comfortable for a finger.",
  limits:
    "The phone in the picture is 300 units wide, a little narrower than many phones, so one unit is one pixel of that phone and sizes on your phone differ a little. WCAG 2.5.8 has exceptions this picture does not draw. Halaqa is a fictional app.",
  component: makeSpecimenLadderCanvas({
    label: "Target size",
    steps: STEPS.map((s) => ({
      screen: screen(s.size, s.gap),
      verdict: { text: s.text, tone: s.tone },
      valueText: `Target ${s.size}, space ${s.gap}`,
    })),
    ends: ["small", "large"],
    caption: "Size of each target",
    hint: "Drag across the picture to make the targets bigger.",
    start: 0,
  }),
};
