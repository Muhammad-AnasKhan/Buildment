import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenSkimCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.3: ten seconds on the first screen of Maryam's first
// case study page for Halaqa (fictional). The result is in the last section,
// below this screen, so the skim fails. The pair of this canvas is
// product-m7-skim-after.

const FIRST_SCREEN: SpecScreen = {
  alt: "The first screen of a case study page: a greeting, three paragraphs about the author and the app, and a line saying the next section is the tech stack.",
  frame: "browser",
  blocks: [
    { kind: "nav", title: "Maryam's portfolio" },
    { kind: "text", text: "Hi, I am Maryam", size: 22, weight: 800 },
    { kind: "text", text: "I study software on my own and I love building things. Since I was young, I have been curious about how apps work.", size: 12.5, tone: "muted" },
    { kind: "text", text: "In two weekends I built Halaqa with an AI tool. It has 14 features, from group search to a leaderboard.", size: 12.5 },
    { kind: "text", text: "This page tells the story of how I built it, step by step.", size: 12.5, tone: "muted" },
    { kind: "divider" },
    { kind: "text", text: "Next: the tech stack, my tools and my process", size: 12, tone: "muted" },
  ],
};

export const productM7SkimBefore: CustomCanvasSpec = {
  kind: "custom",
  title: "Ten seconds on the old page",
  purpose: "Look at the first screen of Maryam's first case study for ten seconds, then say what the page told you first.",
  limits:
    "The picture shows only the first screen of the page. The result is further down, which is the point. A real reader might scroll, but a busy one often does not. Maryam and Halaqa are fictional.",
  component: makeSpecimenSkimCanvas({
    screen: FIRST_SCREEN,
    seconds: 10,
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
      author: "Right. The page starts with Maryam and her 14 features. The result, the problem and the choices come later, out of a ten-second view.",
      problem: "The page never says the problem or the job on this screen. It only says she built a study app.",
      none: "Ten seconds were enough to read it. The trouble is what the page chose to say first, not how fast you read.",
    },
    hint: "Press Start. You get 10 seconds to look at the page.",
    rightVerdict: "Right, but it hid the result",
  }),
};
