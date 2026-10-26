import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.2: the same friend, Adel (fictional), answers two
// questions about voice rooms. Maryam's notes show what each answer gives her.

const NEXT_TIME: SpecScreen = {
  alt: "Maryam's notes after asking Adel about next time. She asked whether he would use voice rooms, and he said yes maybe. The notes hold no day, no place and no attempt.",
  blocks: [
    { kind: "nav", title: "Maryam's notes" },
    { kind: "text", text: "She asked", size: 12, tone: "muted" },
    { kind: "text", text: "Would you use voice rooms if Halaqa had them?", size: 14, weight: 600 },
    { kind: "text", text: "Adel said", size: 12, tone: "muted" },
    { kind: "box", fill: "muted", pad: 12, children: [{ kind: "text", text: "Yes, maybe. Sounds good.", size: 14 }] },
    { kind: "divider" },
    { kind: "text", text: "What she can use", size: 12, tone: "muted" },
    { kind: "text", text: "A polite yes. No day, no place, no attempt.", size: 14, weight: 600, tone: "warn" },
  ],
};

const LAST_TIME: SpecScreen = {
  alt: "Maryam's notes after asking Adel about the last time. She asked when he last failed to join a group. He told a story with a day, a place and what he tried.",
  blocks: [
    { kind: "nav", title: "Maryam's notes" },
    { kind: "text", text: "She asked", size: 12, tone: "muted" },
    { kind: "text", text: "When did you last fail to join a group?", size: 14, weight: 600 },
    { kind: "text", text: "Adel said", size: 12, tone: "muted" },
    {
      kind: "box",
      fill: "muted",
      pad: 12,
      children: [{ kind: "text", text: "Tuesday. The Statistics group was online. I found no way to join the call, so I gave up.", size: 14 }],
    },
    { kind: "divider" },
    { kind: "text", text: "What she can use", size: 12, tone: "muted" },
    { kind: "text", text: "A day, a place and what he tried.", size: 14, weight: 600, tone: "good" },
  ],
};

export const productM1LastTime: CustomCanvasSpec = {
  kind: "custom",
  title: "Two questions, two answers",
  purpose: "Switch between Adel's answer to a question about next time and his answer to a question about the last time, and see what Maryam's notes can use from each.",
  limits:
    "Adel, Maryam and Halaqa are fictional. Asking about the last time is the course's own habit, not a research finding, and one story is a start, not proof.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Question",
    versions: [
      { id: "next", label: "Next time", screen: NEXT_TIME, verdict: { text: "A polite yes, no facts", tone: "warn" } },
      { id: "last", label: "Last time", screen: LAST_TIME, verdict: { text: "A story that happened", tone: "good" } },
    ],
    hint: "Switch between the two questions and compare Adel's answers.",
  }),
};
