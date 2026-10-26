import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.3: the same request to an AI tool asked two ways,
// for a verdict and for questions you can check. Both replies are invented
// for the lesson (fictional Halaqa create-group screen), not tool output.

const VERDICT: SpecScreen = {
  alt: "A chat where the question is: is this screen good? The reply is a score of 7 out of 10 and a mood: more modern, a bold header.",
  frame: "none",
  background: "card",
  gap: 8,
  blocks: [
    { kind: "box", fill: "muted", pad: 10, children: [{ kind: "text", text: "You: Is this screen good?", size: 12.5, weight: 600 }] },
    {
      kind: "box",
      border: true,
      pad: 10,
      gap: 6,
      children: [
        { kind: "text", text: "Tool: 7 out of 10.", size: 14, weight: 700 },
        { kind: "text", text: "It looks clean but could be more modern. Add a bold header and make the button stand out.", size: 12.5 },
      ],
    },
  ],
};

const QUESTIONS: SpecScreen = {
  alt: "A chat where the request names five checks and asks for no score. The reply lists points, each with the rule it uses and a way to check it.",
  frame: "none",
  background: "card",
  gap: 8,
  blocks: [
    { kind: "box", fill: "muted", pad: 10, children: [{ kind: "text", text: "You: Use my five checks. For each point: what you see, the rule, how I can check. No score.", size: 12.5, weight: 600 }] },
    {
      kind: "box",
      border: true,
      pad: 10,
      gap: 5,
      children: [
        { kind: "text", text: "1. The hint under Where may be hard to read.", size: 12.5, weight: 700 },
        { kind: "text", text: "Rule: text contrast, 4.5 to 1. Check: measure the two colours.", size: 12, tone: "muted" },
        { kind: "divider" },
        { kind: "text", text: "2. A student may not know what Seats counts.", size: 12.5, weight: 700 },
        { kind: "text", text: "Rule: none. Check: watch a student fill it in.", size: 12, tone: "muted" },
        { kind: "divider" },
        { kind: "text", text: "I am not sure about the number of fields.", size: 12.5, weight: 700 },
      ],
    },
  ],
};

export const productM6VerdictOrQuestions: CustomCanvasSpec = {
  kind: "custom",
  title: "Ask for a verdict or for questions",
  purpose: "Switch between a reply to Is this screen good? and a reply to a request for checkable points, and see which one you can act on.",
  limits:
    "Both replies are invented for this lesson, not output from a real tool. A real tool may still answer a careful request with a verdict, so read each reply for what you can check. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Ask for",
    versions: [
      { id: "verdict", label: "A verdict", screen: VERDICT, verdict: { text: "A score and a mood to follow", tone: "bad" } },
      { id: "questions", label: "Questions", screen: QUESTIONS, verdict: { text: "Points you can check", tone: "good" } },
    ],
    hint: "Switch between the two requests and read each reply.",
    start: "verdict",
  }),
};
