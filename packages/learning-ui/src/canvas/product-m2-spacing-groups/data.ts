import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.4: space does the grouping. Maryam's Halaqa list
// of study groups (fictional) at five amounts of space between the groups,
// while the space inside each group stays at 6. Drag to see the groups appear,
// then drift so far apart that a phone shows only one.

const GROUPS = [
  { name: "Data structures, exam Thursday", when: "Tonight 8 pm, library room 2", seats: "2 seats left" },
  { name: "Statistics 101 revision", when: "Tomorrow 5 pm, online", seats: "4 seats left" },
  { name: "Arabic literature reading", when: "Saturday 10 am, cafe", seats: "Full" },
];

function group(g: (typeof GROUPS)[number], inner: number): SpecBlock {
  return {
    kind: "box",
    fill: "none",
    pad: 0,
    gap: inner,
    children: [
      { kind: "text", text: g.name, size: 14, weight: 600 },
      { kind: "text", text: g.when, size: 12.5, tone: "muted" },
      { kind: "text", text: g.seats, size: 12, weight: 600, tone: g.seats === "Full" ? "muted" : "accent" },
    ],
  };
}

function screen(between: number): SpecScreen {
  return {
    alt: `Three study groups, with ${between} units of space between groups and 6 inside each group.`,
    gap: between,
    blocks: [{ kind: "nav", title: "Study groups" }, ...GROUPS.map((g) => group(g, 6))],
  };
}

const STEPS = [
  { between: 6, text: "Nine lines, no groups", tone: "bad" as const },
  { between: 12, text: "Groups start to show", tone: "warn" as const },
  { between: 22, text: "Each group reads as one", tone: "good" as const },
  { between: 36, text: "Clear, but fewer fit", tone: "warn" as const },
  { between: 56, text: "Groups drift apart", tone: "bad" as const },
];

export const productM2SpacingGroups: CustomCanvasSpec = {
  kind: "custom",
  title: "Space does the grouping",
  purpose: "Change the space between Maryam's study groups while the space inside each group stays the same, and watch the groups appear and then drift apart.",
  limits:
    "Real screens group with more than space: lines, cards and type size help too. The amounts are viewBox units, not pixels on your phone. Halaqa and its groups are fictional.",
  component: makeSpecimenLadderCanvas({
    label: "Space between groups",
    steps: STEPS.map((s) => ({ screen: screen(s.between), verdict: { text: s.text, tone: s.tone }, valueText: `${s.between} between groups, 6 inside` })),
    ends: ["less", "more"],
    caption: "Space between groups",
    hint: "Drag across the picture to change the space between groups.",
    start: 0,
  }),
};
