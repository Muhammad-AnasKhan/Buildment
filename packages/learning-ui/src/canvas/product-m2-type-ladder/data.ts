import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.3: one Halaqa group page (fictional) with the body
// text at five sizes, from 11 to 26, and the line height held at 1.5. Too
// small strains, about 16 reads well, and very large leaves only a few words
// on each line of a phone.

const BODY = "We solve past exam questions together. Bring your notes and a pen. We stop for ten minutes halfway.";

function screen(size: number): SpecScreen {
  return {
    alt: `A study group page with the description in ${size} unit text and a line height of 1.5.`,
    blocks: [
      { kind: "nav", title: "Study group", back: true },
      { kind: "text", text: "Statistics 101 revision", size: 20, weight: 700 },
      { kind: "text", text: BODY, size, lineHeight: 1.5 },
      { kind: "text", text: "Tomorrow 5 pm, online", size: 13, tone: "muted" },
      { kind: "button", label: "Join this group", full: true, size: 14 },
    ],
  };
}

const STEPS = [
  { size: 11, text: "Too small: it strains", tone: "bad" as const },
  { size: 13, text: "Small: under the 16 start", tone: "warn" as const },
  { size: 16, text: "Reads well", tone: "good" as const },
  { size: 20, text: "Still reads, longer page", tone: "good" as const },
  { size: 26, text: "Too large: few words a line", tone: "bad" as const },
];

export const productM2TypeLadder: CustomCanvasSpec = {
  kind: "custom",
  title: "Body text size",
  purpose: "Drag the size of the body text on a study group page from 11 to 26 and see where it strains, reads well or pushes the page apart.",
  limits:
    "Sizes are drawn units, close to but not the same as pixels on your phone, and the line height stays at 1.5 for every step. The sizes in the sources are for Latin letters. For Arabic, check with a native reader on a real phone. Halaqa is fictional.",
  component: makeSpecimenLadderCanvas({
    label: "Body text size",
    steps: STEPS.map((s) => ({ screen: screen(s.size), verdict: { text: s.text, tone: s.tone }, valueText: `Body text ${s.size}` })),
    ends: ["small", "large"],
    caption: "Size of the body text",
    hint: "Drag across the picture to change the size of the body text.",
    start: 0,
  }),
};
