import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.5: the grey of the secondary text on a Halaqa
// group card (fictional), from #999999 to black, on a white page. The ratios
// come from the WCAG formula (contrastRatio() in models/ui-specimen.ts):
// #999999 2.85, #777777 4.48, #767676 4.54, #595959 7.00, #000000 21.
// The screen uses background "paper" (white in both themes) and literal
// colours on the text, so the ratio stays true in dark mode.

function screen(grey: string): SpecScreen {
  return {
    alt: `A study group card on a white page. The title is near black. The description and the time are in grey ${grey}.`,
    background: "paper",
    blocks: [
      { kind: "text", text: "Statistics 101 revision", size: 17, weight: 700, color: "#111111" },
      { kind: "text", text: "We solve past exam questions together. Bring your notes and a pen.", size: 15, lineHeight: 1.5, color: grey },
      { kind: "text", text: "Tomorrow 5 pm, online", size: 13, color: grey },
      { kind: "text", text: "4 seats left", size: 13, weight: 600, color: grey },
    ],
  };
}

const STEPS = [
  { grey: "#999999", text: "2.85:1 fails 4.5 and 3", tone: "bad" as const },
  { grey: "#777777", text: "4.48:1 fails: under 4.5", tone: "bad" as const },
  { grey: "#767676", text: "4.54:1 passes AA", tone: "good" as const },
  { grey: "#595959", text: "7.00:1 passes with room", tone: "good" as const },
  { grey: "#000000", text: "21:1 the highest possible", tone: "good" as const },
];

const RATIO: Record<string, string> = { "#999999": "2.85", "#777777": "4.48", "#767676": "4.54", "#595959": "7.00", "#000000": "21" };

export const productM2ContrastLadder: CustomCanvasSpec = {
  kind: "custom",
  title: "Grey text on white",
  purpose: "Drag the grey of the secondary text from light to black on a study group card and read the contrast ratio, measured with the WCAG formula, at each step.",
  limits:
    "The page is white and the colours are exact, so the ratios hold in both light and dark mode. Real screens have other backgrounds, and passing a ratio does not make a design good. Small text needs 4.5 to 1; large text needs 3 to 1. Halaqa is fictional.",
  component: makeSpecimenLadderCanvas({
    label: "Grey of the text",
    steps: STEPS.map((s) => ({ screen: screen(s.grey), verdict: { text: s.text, tone: s.tone }, valueText: `${s.grey}, ${RATIO[s.grey]} to 1` })),
    ends: ["lighter", "darker"],
    caption: "Grey of the body text",
    hint: "Drag across the picture to darken the grey text.",
    start: 0,
  }),
};
