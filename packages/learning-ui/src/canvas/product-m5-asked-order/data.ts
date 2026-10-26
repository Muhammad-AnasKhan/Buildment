import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecGlyph, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 5.4: an editorial layout answers the questions in the
// order a person asks them. Halaqa's first page (Maryam's study group app) in
// template order, where the one real fact comes last, and in asked order.

function tile(glyph: SpecGlyph, label: string): SpecBlock {
  return {
    kind: "box",
    border: true,
    pad: 8,
    gap: 6,
    children: [{ kind: "icon", glyph, tile: true, size: 14 }, { kind: "text", text: label, size: 12, weight: 600 }],
  };
}

const TEMPLATE: SpecScreen = {
  alt: "Halaqa's first page in template order: a glow with an AI badge, the headline Supercharge your studying, three icon cards and a Get started button. A small grey line about exam groups comes last.",
  background: "card",
  blocks: [
    {
      kind: "box",
      fill: "glow",
      radius: 14,
      pad: 14,
      gap: 8,
      children: [
        { kind: "pill", text: "AI-powered", tone: "accent" },
        { kind: "text", text: "Supercharge your studying", size: 21, weight: 800, tone: "onGlow" },
        { kind: "text", text: "Connect, collaborate, succeed.", size: 13, tone: "onGlow" },
      ],
    },
    { kind: "row", gap: 8, children: [tile("user", "Connect"), tile("bolt", "Share"), tile("star", "Succeed")] },
    { kind: "button", label: "Get started", full: true },
    { kind: "text", text: "Groups for exams, tonight or tomorrow.", size: 12, tone: "muted" },
  ],
};

const ASKED: SpecScreen = {
  alt: "Halaqa's first page in asked order: a headline that says its purpose, two real groups with time, place and seats left, and a Find a group button.",
  background: "card",
  blocks: [
    { kind: "text", text: "Find a study group for your exam, tonight or tomorrow.", size: 20, weight: 700, font: "serif" },
    {
      kind: "box",
      border: true,
      pad: 10,
      gap: 3,
      children: [
        { kind: "text", text: "Data structures, exam Thursday", size: 13.5, weight: 600 },
        { kind: "text", text: "Tonight 8 pm, library room 2", size: 12.5, tone: "muted" },
        { kind: "text", text: "2 seats left", size: 12, weight: 600, tone: "warn" },
      ],
    },
    {
      kind: "box",
      border: true,
      pad: 10,
      gap: 3,
      children: [
        { kind: "text", text: "Statistics 101 revision", size: 13.5, weight: 600 },
        { kind: "text", text: "Tomorrow 5 pm, online", size: 12.5, tone: "muted" },
        { kind: "text", text: "4 seats left", size: 12, weight: 600, tone: "good" },
      ],
    },
    { kind: "button", label: "Find a group", full: true },
  ],
};

export const productM5AskedOrder: CustomCanvasSpec = {
  kind: "custom",
  title: "Facts in the order a person asks",
  purpose: "Switch between Halaqa's first page in template order, where the one real fact comes last, and the same page in the order a student asks.",
  limits:
    "Four questions (what is this, which groups, when, how do I start) are the course's template for a small app, not a standard. Halaqa and its groups are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Order",
    hint: "Switch between the two orders and find where the groups are.",
    versions: [
      { id: "template", label: "Template", screen: TEMPLATE, verdict: { text: "The real fact comes last", tone: "bad" } },
      { id: "asked", label: "Asked", screen: ASKED, verdict: { text: "What, which, when, start", tone: "good" } },
    ],
  }),
};
