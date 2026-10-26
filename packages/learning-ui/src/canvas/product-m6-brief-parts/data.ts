import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.2: a one-line prompt against a five-part brief for
// Halaqa's home screen (fictional). The picture is a page of five slots. In
// the one-line prompt every slot reads "the tool guesses"; in the five-part
// brief every slot holds a fact. Nothing here is tool output.

const PARTS = ["Who and where", "Real content", "Type and one colour", "Sections and main action", "A reference"] as const;

const FACTS: Record<(typeof PARTS)[number], string> = {
  "Who and where": "A student, on a phone, the night before an exam.",
  "Real content": "Three real groups, with times and seats left.",
  "Type and one colour": "One font, body 16 px. One accent, on Join only.",
  "Sections and main action": "One list. The one main action is Join.",
  "A reference": "A bus timetable: time first, no decoration.",
};

function slot(part: (typeof PARTS)[number], filled: boolean): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 9,
    gap: 4,
    children: [
      { kind: "text", text: part, size: 11.5, weight: 700, tone: "muted" },
      filled ? { kind: "text", text: FACTS[part], size: 12.5 } : { kind: "pill", text: "The tool guesses", tone: "warn" },
    ],
  };
}

function page(alt: string, prompt: string, filled: boolean): SpecScreen {
  return {
    alt,
    frame: "none",
    background: "card",
    gap: 8,
    blocks: [
      { kind: "box", fill: "muted", pad: 10, children: [{ kind: "text", text: prompt, size: 13, weight: 600 }] },
      ...PARTS.map((p) => slot(p, filled)),
    ],
  };
}

export const productM6BriefParts: CustomCanvasSpec = {
  kind: "custom",
  title: "One line or five parts",
  purpose: "Switch between a one-line prompt and a five-part brief for Halaqa's home screen, and see which places the tool must guess in each.",
  limits:
    "The five parts are the course's own template, shaped from vendor guidance and one research test. They are not a recipe that real tools follow every time. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Prompt",
    versions: [
      {
        id: "line",
        label: "One line",
        screen: page("A one-line prompt, Make a study group app, above five slots that all read: the tool guesses.", "Prompt: Make a study group app.", false),
        verdict: { text: "5 places the tool guesses", tone: "bad" },
      },
      {
        id: "parts",
        label: "Five parts",
        screen: page("A five-part brief for Halaqa's home screen, with a fact in each of the five slots.", "Prompt: the five-part brief.", true),
        verdict: { text: "Each place has a fact", tone: "good" },
      },
    ],
    hint: "Switch between the two prompts and read the five slots.",
    start: "line",
  }),
};
