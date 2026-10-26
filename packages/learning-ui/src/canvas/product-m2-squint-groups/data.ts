import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.4: the Halaqa list from the spacing ladder
// (fictional), squinted. With 4 between groups and 4 inside, the blur leaves
// one smear. With 24 between and 4 inside, the blur leaves three groups.
// Same groups and same amounts as product-m2-spacing-groups.

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
    alt: `Three study groups with ${between} units of space between groups and 4 inside each group.`,
    gap: between,
    blocks: [{ kind: "nav", title: "Study groups" }, ...GROUPS.map((g) => group(g, 4))],
  };
}

export const productM2SquintGroups: CustomCanvasSpec = {
  kind: "custom",
  title: "Squint at the groups",
  purpose: "Switch between two blurred study group lists and see which one still shows three groups when you can no longer read the words.",
  limits:
    "The blur is drawn, not your eyes, and it hides the words on purpose. Real screens also group with lines and cards. The amounts are drawn units. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Spacing",
    versions: [
      { id: "even", label: "Even", screen: screen(4), blur: true, verdict: { text: "One smear, no groups", tone: "bad" } },
      { id: "grouped", label: "Grouped", screen: screen(24), blur: true, verdict: { text: "Three groups show", tone: "good" } },
    ],
    hint: "Switch between the two squinted lists.",
    start: "even",
  }),
};
