import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenLadderCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.3: a Halaqa group page in Arabic (fictional), with
// the body text at five sizes from 12 to 20 and the line height held at 1.5.
// No source we opened gives Arabic text sizes, so no step is marked right or
// wrong: the learner, who is the native reader, reads each size for a minute
// and decides. The screen is right to left (dir: "rtl").

const BODY = "نحلّ أسئلة الامتحانات السابقة معًا. أحضروا دفاتركم وقلمًا. نتوقف عشر دقائق في المنتصف.";

function screen(size: number): SpecScreen {
  return {
    alt: `A study group page in Arabic, right to left, with the description in ${size} unit text and a line height of 1.5. The group is the Statistics 101 revision, tomorrow at 5 pm, online.`,
    dir: "rtl",
    blocks: [
      { kind: "text", text: "مراجعة الإحصاء 101", size: 20, weight: 700 },
      { kind: "text", text: BODY, size, lineHeight: 1.5 },
      { kind: "text", text: "غدًا الساعة 5 مساءً، عبر الإنترنت", size: 13, tone: "muted" },
      { kind: "button", label: "انضم إلى الحلقة", full: true, size: 14 },
    ],
  };
}

const SIZES = [12, 14, 16, 18, 20];

export const productM2ArabicSize: CustomCanvasSpec = {
  kind: "custom",
  title: "Arabic body text size",
  purpose: "Drag the size of Arabic body text on a study group page from 12 to 20, read each size for a minute, and decide for yourself which one is comfortable.",
  limits:
    "No source we opened gives a body size or a line height for Arabic, so no size here is marked right or wrong. The sizes are drawn units, not pixels on your phone, and the letters are drawn in your reader's font. Check on a real phone. Halaqa is fictional.",
  component: makeSpecimenLadderCanvas({
    label: "Arabic body text size",
    steps: SIZES.map((size) => ({ screen: screen(size), verdict: { text: `${size}: is it easy to read?`, tone: "accent" as const }, valueText: `Arabic body text ${size}` })),
    ends: ["small", "large"],
    caption: "Size of Arabic text",
    hint: "Drag across the picture and read the paragraph at each size.",
    start: 2,
  }),
};
