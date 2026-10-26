import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.4: Maryam's reply to Rawan (fictional) when she
// asks for a leaderboard, in three versions: a no whose reason is about the
// builder, a later with no condition, and a no with four parts.

function reply(alt: string, blocks: SpecScreen["blocks"]): SpecScreen {
  return {
    alt,
    blocks: [
      { kind: "nav", title: "Reply to Rawan" },
      { kind: "text", text: "Rawan asked", size: 12, tone: "muted" },
      { kind: "text", text: "Please add a leaderboard.", size: 14, weight: 600 },
      { kind: "divider" },
      { kind: "text", text: "Maryam replies", size: 12, tone: "muted" },
      { kind: "box", fill: "muted", pad: 12, gap: 8, children: blocks },
    ],
  };
}

const TOO_HARD = reply(
  "Maryam's reply to Rawan: no leaderboard, because it is too hard to build. The reason is about Maryam, not about the students.",
  [{ kind: "text", text: "No. A leaderboard is too hard for me to build.", size: 14 }],
);

const LATER = reply(
  "Maryam's reply to Rawan: good idea, she will add it later when everything else is done. It gives no condition and no reason.",
  [{ kind: "text", text: "Good idea! I will add it later, when everything else is done.", size: 14 }],
);

const FOUR_PARTS = reply(
  "Maryam's reply to Rawan in four parts: the item, who it affects, what happens without it, and what she does instead.",
  [
    { kind: "text", text: "Item: the leaderboard.", size: 13.5, weight: 600 },
    { kind: "text", text: "Who it affects: students who like to compete, not students finding a group.", size: 13.5 },
    { kind: "text", text: "Without it: nothing breaks for finding a group tonight.", size: 13.5 },
    { kind: "text", text: "Instead: it stays on the later list until after the check.", size: 13.5 },
  ],
);

export const productM1SayNo: CustomCanvasSpec = {
  kind: "custom",
  title: "Three ways to say no",
  purpose: "Switch between three replies to Rawan's request for a leaderboard: a no with a reason about the builder, a later with no condition, and a no with four parts.",
  limits:
    "A four-part no is the course's own template, built on the scope hammering questions. It is not the only kind way to refuse. Rawan, Maryam and Halaqa are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Reply",
    versions: [
      { id: "hard", label: "Too hard", screen: TOO_HARD, verdict: { text: "The reason is about you", tone: "bad" } },
      { id: "later", label: "Later", screen: LATER, verdict: { text: "A promise with no condition", tone: "warn" } },
      { id: "four", label: "Four parts", screen: FOUR_PARTS, verdict: { text: "Four parts, easy to check", tone: "good" } },
    ],
    hint: "Switch between the three replies to Rawan.",
  }),
};
