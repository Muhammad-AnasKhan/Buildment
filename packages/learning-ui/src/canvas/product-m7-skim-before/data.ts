import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenSkimCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.3: ten seconds on the first screen of Maryam's first
// case study page for Halaqa (fictional). The screen is short (36 words) so a
// slow reader can still finish it, and the result is in the last section, below
// this screen, so the skim fails. The reader may choose 10 or 20 seconds. The
// pair of this canvas is product-m7-skim-after.

const FIRST_SCREEN: SpecScreen = {
  alt: "The first screen of a case study page, about 36 words: a greeting, one line about the author, one line about the app and 14 features, and a line saying the next section is the tech stack.",
  frame: "browser",
  blocks: [
    { kind: "nav", title: "Maryam's portfolio" },
    { kind: "text", text: "Hi, I am Maryam", size: 22, weight: 800 },
    { kind: "text", text: "I study software on my own.", size: 13, tone: "muted" },
    { kind: "text", text: "In two weekends I built Halaqa, a study app, with an AI tool. It has 14 features.", size: 13 },
    { kind: "divider" },
    { kind: "text", text: "Next: the tech stack and my process", size: 12, tone: "muted" },
  ],
};

export const productM7SkimBefore: CustomCanvasSpec = {
  kind: "custom",
  title: "Ten seconds on the old page",
  purpose: "Look at the first screen of Maryam's first case study for ten or twenty seconds, then say what the page told you first.",
  limits:
    "The picture shows only the first screen of the page, about 36 words. The result is further down, which is the point. A real reader might scroll, but a busy one often does not. Maryam and Halaqa are fictional.",
  component: makeSpecimenSkimCanvas({
    screen: FIRST_SCREEN,
    seconds: 10,
    slowerSeconds: 20,
    question: "What was the first thing the page told you?",
    options: [
      { id: "result", label: "That the redesign worked, with a number" },
      { id: "author", label: "Who Maryam is and what she built" },
      { id: "problem", label: "Which problem the app solves" },
      { id: "none", label: "Nothing; I could not read it in time" },
    ],
    answer: "author",
    why: {
      result: "No number or result is on this screen. It is in the last section, far below the first screen.",
      author: "Right. The page starts with Maryam and her 14 features. The result, the problem and the choices come later, out of a short view.",
      problem: "The page never says the problem or the job on this screen. It only says she built a study app.",
      none: "Reading in a second language takes longer, so choose 20 seconds and try again. The screen has about 36 words, and the trouble is what it says first, not how fast you read.",
    },
    hint: "Choose 10 or 20 seconds, then press Start.",
    rightVerdict: "Right, but it hid the result",
  }),
};
