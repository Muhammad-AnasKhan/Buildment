import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenSkimCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.3: ten seconds on the first screen of Maryam's
// rewritten case study page for Halaqa (fictional). The result and the job are
// at the top, so the skim passes. The pair of this canvas is
// product-m7-skim-before.

const FIRST_SCREEN: SpecScreen = {
  alt: "The first screen of a case study page: the result 4 of 5 classmates joined a study group in their first visit, one sentence about the job, Maryam's role and a Try it as a guest button.",
  frame: "browser",
  blocks: [
    { kind: "nav", title: "Halaqa case study" },
    { kind: "stat", value: "4 of 5", label: "classmates joined a study group in their first visit. Before: 2 of 5.", tone: "good" },
    { kind: "text", text: "Halaqa helps a student with an exam coming up find a study group for tonight.", size: 13, weight: 600 },
    { kind: "pills", items: [{ text: "My role: design and build", tone: "neutral" }, { text: "12 hours, 2 weeks", tone: "neutral" }] },
    { kind: "button", label: "Try it as a guest", full: true },
    { kind: "divider" },
    { kind: "text", text: "Next: the problem, my choices and what I gave up", size: 12, tone: "muted" },
  ],
};

export const productM7SkimAfter: CustomCanvasSpec = {
  kind: "custom",
  title: "Ten seconds on the new page",
  purpose: "Look at the first screen of Maryam's rewritten case study for ten or twenty seconds, then say what the page told you first.",
  limits:
    "The picture shows only the first screen. The number comes from a check with five classmates, which finds problems and does not prove the design is good. Maryam and Halaqa are fictional.",
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
    answer: "result",
    why: {
      result: "Right. The biggest thing on the page is the result: 4 of 5 joined, up from 2 of 5. The job and her role follow in the same screen.",
      author: "Her role is on the page, in a small tag. The page leads with the result, not with who she is.",
      problem: "The job is there in one sentence, but it comes second. The first thing is the number at the top.",
      none: "Choose 20 seconds and try again. The big number at the top is the first thing to read, which is what the rewrite is for.",
    },
    hint: "Choose 10 or 20 seconds, then press Start.",
  }),
};
