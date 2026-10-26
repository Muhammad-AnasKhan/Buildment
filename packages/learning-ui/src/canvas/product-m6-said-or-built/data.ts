import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.2: what a tool says it built against what a check
// finds. The page is a made-up first draft of Halaqa's home screen (fictional);
// the tool's list and the measurements are invented for the case. The hint
// grey is one from the 2.5 table: grey 949494 on white is 3.03 to 1.

const CLAIMS = [
  { said: "Body text is 16 px.", found: "Measured 14 px", ok: false },
  { said: "Hint text passes 4.5 to 1.", found: "Measured 3.03 to 1", ok: false },
  { said: "Join buttons are 44 px tall.", found: "Measured 44 px", ok: true },
] as const;

function claimRow(c: (typeof CLAIMS)[number], measured: boolean): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 9,
    gap: 5,
    children: [
      { kind: "text", text: c.said, size: 13, weight: 600 },
      measured ? { kind: "pill", text: c.found, tone: c.ok ? "good" : "bad" } : { kind: "text", text: "Stated by the tool", size: 11.5, tone: "muted" },
    ],
  };
}

function listScreen(alt: string, title: string, measured: boolean): SpecScreen {
  return {
    alt,
    frame: "none",
    background: "card",
    gap: 8,
    blocks: [{ kind: "text", text: title, size: 13, weight: 700 }, ...CLAIMS.map((c) => claimRow(c, measured))],
  };
}

export const productM6SaidOrBuilt: CustomCanvasSpec = {
  kind: "custom",
  title: "What the tool said, what the page has",
  purpose: "Switch between a tool's own list of what it built and the measurements of the page, and see which claims hold.",
  limits:
    "The list and the measurements are invented for this lesson, not output from a real tool. One study found about a quarter of stated reasons missing, which is no rate for any one tool. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "View",
    versions: [
      {
        id: "said",
        label: "Tool said",
        screen: listScreen("The tool's own list of three things it says it built into Halaqa's home screen.", "The tool says it built:", false),
        verdict: { text: "Three claims from the tool", tone: "accent" },
      },
      {
        id: "found",
        label: "Measured",
        screen: listScreen("The same three claims, each with a measurement from the finished page: two do not hold.", "You open the page and measure:", true),
        verdict: { text: "2 of 3 claims did not hold", tone: "bad" },
      },
    ],
    hint: "Switch to see what a check finds for each claim.",
    start: "said",
  }),
};
