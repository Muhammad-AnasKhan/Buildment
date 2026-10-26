import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.2: five signals that put one thing first, added to
// a Halaqa group page (fictional) one at a time: size, weight, contrast,
// position and grouping. With none, every line is equal and the group's name
// is the second line. Each signal alone is a small hint; together they decide.

type Signals = { size: boolean; weight: boolean; contrast: boolean; position: boolean; grouping: boolean };

function screen(s: Signals, alt: string): SpecScreen {
  const tone = s.contrast ? ("muted" as const) : ("fg" as const);
  const name: SpecBlock = { kind: "text", text: "Data structures, exam Thursday", size: s.size ? 22 : 14, weight: s.weight ? 700 : 400 };
  const when: SpecBlock = { kind: "text", text: "Tonight 8 pm, library room 2", size: 14, tone };
  const seats: SpecBlock = { kind: "text", text: "2 seats left", size: 14, tone };
  const about: SpecBlock = { kind: "text", text: "We solve past exam questions together.", size: 14, tone };
  let blocks: SpecBlock[];
  if (s.grouping) {
    blocks = [name, { kind: "space", height: 12 }, { kind: "box", fill: "none", pad: 0, gap: 4, children: [when, seats, about] }];
  } else if (s.position) {
    blocks = [name, when, seats, about];
  } else {
    blocks = [when, name, seats, about];
  }
  return { alt, blocks };
}

const STEPS = [
  { s: { size: false, weight: false, contrast: false, position: false, grouping: false }, text: "None: all lines equal", tone: "bad" as const, value: "No signals", alt: "A group page with four lines of the same size, weight and colour. The group's name is the second line." },
  { s: { size: true, weight: false, contrast: false, position: false, grouping: false }, text: "Size: a first hint", tone: "warn" as const, value: "Size added", alt: "The same page with the group's name larger than the other lines." },
  { s: { size: true, weight: true, contrast: false, position: false, grouping: false }, text: "Weight: a stronger hint", tone: "warn" as const, value: "Weight added", alt: "The group's name is larger and bold." },
  { s: { size: true, weight: true, contrast: true, position: false, grouping: false }, text: "Contrast: the rest is grey", tone: "good" as const, value: "Contrast added", alt: "The group's name is large, bold and dark. The other lines are in grey." },
  { s: { size: true, weight: true, contrast: true, position: true, grouping: false }, text: "Position: it is read first", tone: "good" as const, value: "Position added", alt: "The group's name is now the top line, large, bold and dark, above grey details." },
  { s: { size: true, weight: true, contrast: true, position: true, grouping: true }, text: "Grouping: a clear order", tone: "good" as const, value: "Grouping added", alt: "The name sits at the top with extra space below it. The three grey details are close together as one group." },
];

export const productM2Signals: CustomCanvasSpec = {
  kind: "custom",
  title: "Five signals add up",
  purpose: "Drag to add size, weight, contrast, position and grouping to a group's name, one at a time, and watch a hint become a clear first thing.",
  limits:
    "The five signals are a guideline from experts, not a measured recipe. Weight and position are common practice that the course adds to the NN/g list. The sizes are drawn units. Halaqa is fictional.",
  component: makeSpecimenLadderCanvas({
    label: "Signals added",
    steps: STEPS.map((x) => ({ screen: screen(x.s, x.alt), verdict: { text: x.text, tone: x.tone }, valueText: x.value })),
    ends: ["none", "all five"],
    caption: "Signals added",
    hint: "Drag across the picture to add one signal at a time.",
    start: 0,
  }),
};
