import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.5, beat 3: the five-user model as a picture. The
// model says the share of one group's problems found by n testers is
// 1 - (1 - L)^n, and in the authors' projects L (what one tester finds) was
// about 31 percent [A20]. With L = 0.31: 1 tester 31.0, 2 testers 52.4,
// 3 testers 67.1, 5 testers 84.4, 8 testers 94.9, 12 testers 98.8 percent.
// The picture shows the curve flattening; it is a model, not a measurement of
// any one page.

const STEPS = [
  { n: 1, pct: 31, note: "One tester meets about a third.", text: "Finds about a third", tone: "accent" as const },
  { n: 2, pct: 52, note: "Two overlap, so it is less than double.", text: "Less than double", tone: "accent" as const },
  { n: 3, pct: 67, note: "Each new tester repeats more.", text: "Each one adds less", tone: "accent" as const },
  { n: 5, pct: 84, note: "Fix these, then test again.", text: "Five: most big problems", tone: "good" as const },
  { n: 8, pct: 95, note: "Few new problems appear.", text: "Few new problems appear", tone: "warn" as const },
  { n: 12, pct: 99, note: "Almost all repeats now.", text: "Mostly repeats now", tone: "warn" as const },
];

function screen(n: number, pct: number, note: string): SpecScreen {
  return {
    alt: `The model with ${n} ${n === 1 ? "tester" : "testers"}: about ${pct} percent of one user group's problems found. ${note}`,
    blocks: [
      { kind: "nav", title: "One user group" },
      { kind: "stat", value: `${pct}%`, label: "of the problems found", tone: "accent" },
      { kind: "progress", value: pct / 100, label: `${n} ${n === 1 ? "tester" : "testers"}` },
      { kind: "text", text: note, size: 13, tone: "muted" },
    ],
  };
}

export const productM4FiveTesters: CustomCanvasSpec = {
  kind: "custom",
  title: "What more testers find",
  purpose: "Drag from one tester to twelve and watch the share of one group's problems found by the model grow fast and then flatten.",
  limits:
    "This is the five-user model with one tester finding about 31 percent, a figure from the authors' own projects. It is not a measurement of your page. It covers one user group and does not prove a design is good.",
  component: makeSpecimenLadderCanvas({
    label: "Number of testers",
    steps: STEPS.map((s) => ({
      screen: screen(s.n, s.pct, s.note),
      verdict: { text: s.text, tone: s.tone },
      valueText: `${s.n} ${s.n === 1 ? "tester" : "testers"}, about ${s.pct} percent found`,
    })),
    ends: ["fewer", "more"],
    caption: "Number of testers",
    hint: "Drag across the picture to add testers to one round.",
    start: 0,
  }),
};
