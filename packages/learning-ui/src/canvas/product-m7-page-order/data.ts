import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.3: the same five sections of Maryam's case study
// page for Halaqa (fictional) in two orders. A marker shows where a phone's
// first screen ends. Sections above the marker are shaded.

function section(n: number, text: string, seen: boolean): SpecBlock {
  return {
    kind: "box",
    border: true,
    fill: seen ? "accentSoft" : "none",
    pad: 9,
    radius: 8,
    children: [{ kind: "text", text: `${n}. ${text}`, size: 13, weight: seen ? 600 : 400 }],
  };
}

const MARK: SpecBlock = { kind: "pill", text: "First screen ends here", tone: "warn" };

const STORY_FIRST: SpecScreen = {
  alt: "A case study page in story order. Above the line where a phone's first screen ends: 1 About me, 2 Tools and tech stack. Below it: 3 How I built it, 4 Screens, 5 The result, 4 of 5 joined.",
  gap: 8,
  blocks: [
    section(1, "About me", true),
    section(2, "Tools and tech stack", true),
    MARK,
    section(3, "How I built it, week by week", false),
    section(4, "Screens", false),
    section(5, "The result: 4 of 5 joined", false),
  ],
};

const RESULT_FIRST: SpecScreen = {
  alt: "The same case study page with the result first. Above the line where a phone's first screen ends: 1 The result, 4 of 5 joined, up from 2 of 5, 2 The problem and the job. Below it: 3 My role, 4 Choices and what I gave up, 5 Before and after, and how I know.",
  gap: 8,
  blocks: [
    section(1, "The result: 4 of 5 joined, up from 2 of 5", true),
    section(2, "The problem and the job", true),
    MARK,
    section(3, "My role", false),
    section(4, "Choices and what I gave up", false),
    section(5, "Before and after, and how I know", false),
  ],
};

export const productM7PageOrder: CustomCanvasSpec = {
  kind: "custom",
  title: "Two orders for one page",
  purpose: "Switch between a case study in story order and the same sections with the result first, and see which sections fall on the first screen.",
  limits:
    "The line is drawn after two sections, which is about what a phone shows. A real first screen depends on the phone and the text size. Maryam and Halaqa are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Order of the page",
    versions: [
      { id: "story", label: "Story", screen: STORY_FIRST, verdict: { text: "The result is out of sight", tone: "bad" } },
      { id: "result", label: "Result", screen: RESULT_FIRST, verdict: { text: "The result is on screen one", tone: "good" } },
    ],
    hint: "Switch the order. Look at what falls above the line.",
  }),
};
