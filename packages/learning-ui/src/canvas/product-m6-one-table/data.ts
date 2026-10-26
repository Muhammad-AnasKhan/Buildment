import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.3: the points from three AI critiques of Maryam's
// create-group screen (fictional; the points are invented, not tool output),
// first as three separate lists and then merged into one table with the tools
// that said each point and the check each one needs.

const LISTS: { tool: string; points: string[] }[] = [
  { tool: "Tool one", points: ["Too many fields", "Hint too light", "Button too small"] },
  { tool: "Tool two", points: ["Hint too light", "Button too small", "Seats unclear"] },
  { tool: "Tool three", points: ["Button too small", "Rename the button", "Purple header"] },
];

const TABLE: { point: string; tools: string[]; check: string }[] = [
  { point: "Button too small", tools: ["T1", "T2", "T3"], check: "Check: measure its height" },
  { point: "Hint too light", tools: ["T1", "T2"], check: "Check: measure the contrast" },
  { point: "Rename the button", tools: ["T3"], check: "Check: does it say what happens?" },
  { point: "Too many fields", tools: ["T1"], check: "Ask: watch a student" },
  { point: "Seats unclear", tools: ["T2"], check: "Ask: watch a student" },
  { point: "Purple header", tools: ["T3"], check: "Drop: no problem named" },
];

const SEPARATE: SpecScreen = {
  alt: "Three separate lists of three points each. The button and the hint appear in more than one list.",
  frame: "none",
  background: "card",
  gap: 8,
  blocks: LISTS.map((l): SpecBlock => ({
    kind: "box",
    border: true,
    pad: 9,
    gap: 4,
    children: [{ kind: "text", text: l.tool, size: 11.5, weight: 700, tone: "muted" }, ...l.points.map((p): SpecBlock => ({ kind: "text", text: p, size: 12.5 }))],
  })),
};

const MERGED: SpecScreen = {
  alt: "One table of six points. Each row names the tools that said it and the check it needs: measure, ask a person, or drop.",
  frame: "none",
  background: "card",
  gap: 6,
  blocks: TABLE.map((r): SpecBlock => ({
    kind: "box",
    border: true,
    pad: 8,
    gap: 3,
    children: [
      {
        kind: "row",
        gap: 6,
        weights: [1, 1],
        children: [
          { kind: "text", text: r.point, size: 12.5, weight: 600 },
          { kind: "pills", items: r.tools.map((t) => ({ text: t, tone: "accent" as const })) },
        ],
      },
      { kind: "text", text: r.check, size: 11.5, tone: "muted" },
    ],
  })),
};

export const productM6OneTable: CustomCanvasSpec = {
  kind: "custom",
  title: "Three lists or one table",
  purpose: "Switch between three separate AI lists and one merged table that shows who said each point and which check it needs.",
  limits:
    "The points are invented for this lesson, not output from a real tool. Several tools saying the same thing is a reason to check it first, not a result. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "View",
    versions: [
      { id: "lists", label: "3 lists", screen: SEPARATE, verdict: { text: "Three lists, repeated points", tone: "warn" } },
      { id: "table", label: "1 table", screen: MERGED, verdict: { text: "One table, one check each", tone: "good" } },
    ],
    hint: "Switch between the three lists and the merged table.",
    start: "lists",
  }),
};
