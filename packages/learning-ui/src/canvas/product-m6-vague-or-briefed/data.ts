import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.2: the same request for Halaqa's home screen
// (fictional) at three levels of detail. The screens are drawn by hand for
// the lesson; they are not the output of a real tool. A prompt made only of
// style words gets the common look, a brief gets the right shape with filler
// words, and real content makes the screen Halaqa's own.

const VAGUE: SpecScreen = {
  alt: "A first draft from a prompt of style words only: a purple glow, an AI badge, a hype headline, three icon cards and a Get started button.",
  background: "card",
  blocks: [
    {
      kind: "box",
      fill: "glow",
      radius: 14,
      pad: 16,
      gap: 10,
      children: [
        { kind: "pill", text: "AI-powered", tone: "accent" },
        { kind: "text", text: "Find your perfect study group", size: 21, weight: 800, tone: "onGlow" },
        { kind: "text", text: "Seamless, powerful and effortless.", size: 13, tone: "onGlow" },
        { kind: "button", label: "Get started", variant: "glow" },
      ],
    },
    {
      kind: "row",
      gap: 8,
      children: [
        { kind: "box", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "user", tile: true, size: 14 }, { kind: "text", text: "Connect", size: 12, weight: 600 }] },
        { kind: "box", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "chart", tile: true, size: 14 }, { kind: "text", text: "Learn", size: 12, weight: 600 }] },
        { kind: "box", border: true, pad: 8, gap: 6, children: [{ kind: "icon", glyph: "rocket", tile: true, size: 14 }, { kind: "text", text: "Grow", size: 12, weight: 600 }] },
      ],
    },
  ],
};

const BRIEFED: SpecScreen = {
  alt: "A first draft from a detailed brief: a plain title, one list of groups, a Join button on each, but filler words for names, times and places.",
  blocks: [
    { kind: "nav", title: "Study groups tonight" },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 6,
      children: [
        { kind: "text", text: "Study group", size: 14, weight: 600 },
        { kind: "text", text: "Time and place", size: 12.5, tone: "muted" },
        { kind: "text", text: "Seats left", size: 12, weight: 600, tone: "accent" },
        { kind: "button", label: "Join", size: 12 },
      ],
    },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 6,
      children: [
        { kind: "text", text: "Study group", size: 14, weight: 600 },
        { kind: "text", text: "Time and place", size: 12.5, tone: "muted" },
        { kind: "text", text: "Seats left", size: 12, weight: 600, tone: "accent" },
        { kind: "button", label: "Join", size: 12 },
      ],
    },
  ],
};

const REAL: SpecScreen = {
  alt: "The same layout with real content: two real study groups with their times, places and seats left, a Join button on each, and a full group at the bottom.",
  blocks: [
    { kind: "nav", title: "Study groups tonight" },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 6,
      children: [
        { kind: "text", text: "Data structures, exam Thursday", size: 14, weight: 600 },
        { kind: "text", text: "Tonight 8 pm, library room 2", size: 12.5, tone: "muted" },
        { kind: "text", text: "2 seats left", size: 12, weight: 600, tone: "accent" },
        { kind: "button", label: "Join", size: 12 },
      ],
    },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 6,
      children: [
        { kind: "text", text: "Statistics 101 revision", size: 14, weight: 600 },
        { kind: "text", text: "Tomorrow 5 pm, online", size: 12.5, tone: "muted" },
        { kind: "text", text: "4 seats left", size: 12, weight: 600, tone: "accent" },
        { kind: "button", label: "Join", size: 12 },
      ],
    },
    { kind: "text", text: "Arabic literature reading, Saturday 10 am, cafe: full", size: 12, tone: "muted" },
  ],
};

export const productM6VagueOrBriefed: CustomCanvasSpec = {
  kind: "custom",
  title: "Vague prompt or brief",
  purpose: "Switch between three drafts of Halaqa's home screen: from style words only, from a brief, and from a brief plus real content. See how far each is from the default.",
  limits:
    "The three screens are drawn by hand for the lesson. Real tools differ from each other and from run to run, and even a good first draft can have weak hierarchy and spacing. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Prompt",
    versions: [
      { id: "vague", label: "Style only", screen: VAGUE, verdict: { text: "Style words: the common look", tone: "bad" } },
      { id: "brief", label: "Brief", screen: BRIEFED, verdict: { text: "Brief: right shape, no facts", tone: "warn" } },
      { id: "real", label: "Real data", screen: REAL, verdict: { text: "Real content: it is Halaqa", tone: "good" } },
    ],
    hint: "Tap a prompt to see the first draft it would get.",
    start: "vague",
  }),
};
