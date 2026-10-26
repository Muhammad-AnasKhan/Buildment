import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.3: the same two critiques shown to an AI judge in
// two orders. The critiques and the judge's answers are invented for the
// lesson (fictional Halaqa screen), not tool output. The two critiques are
// close in quality on purpose, so order is the only difference.

const A = { name: "Critique A", text: "The Join button looks small. Check its height." };
const B = { name: "Critique B", text: "The hint text looks light. Check its contrast." };

function card(c: { name: string; text: string }, place: string): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 10,
    gap: 4,
    children: [
      { kind: "pill", text: place, tone: "neutral" },
      { kind: "text", text: c.name, size: 12, weight: 700 },
      { kind: "text", text: c.text, size: 12.5 },
    ],
  };
}

function screen(first: typeof A, second: typeof A, winner: string, alt: string): SpecScreen {
  return {
    alt,
    frame: "none",
    background: "card",
    gap: 8,
    blocks: [
      { kind: "text", text: "You: Which critique is better?", size: 12.5, weight: 600 },
      card(first, "Shown first"),
      card(second, "Shown second"),
      { kind: "box", fill: "accentSoft", pad: 10, children: [{ kind: "text", text: `Judge: ${winner} is better.`, size: 13, weight: 700, tone: "accent" }] },
    ],
  };
}

export const productM6OrderSwap: CustomCanvasSpec = {
  kind: "custom",
  title: "Same two critiques, two orders",
  purpose: "Switch the order in which an AI judge sees two critiques, and watch which one it prefers.",
  limits:
    "The critiques and the answers are invented for this lesson, not output from a real tool. In the research, swapping the order can flip a judge's ranking; it does not always do so. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Order",
    versions: [
      {
        id: "ab",
        label: "A first",
        screen: screen(A, B, "A", "Critique A is shown first and critique B second. The judge says A is better."),
        verdict: { text: "A first: judge picks A", tone: "accent" },
      },
      {
        id: "ba",
        label: "B first",
        screen: screen(B, A, "B", "Critique B is shown first and critique A second. The judge says B is better."),
        verdict: { text: "B first: judge picks B", tone: "warn" },
      },
    ],
    hint: "Switch the order. The two critiques stay the same.",
    start: "ab",
  }),
};
