import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.4: right to left. Halaqa's group card (fictional)
// in English (left to right) and in Arabic (right to left, dir "rtl"). The
// layout mirrors: the text starts on the right, and the Join button, which
// sat at the end of the row on the right, now sits at the end on the left.
// The Arabic is written in Arabic script: "حلقة" is Halaqa; the card reads
// "Data structures, exam Thursday", "Tonight 8 pm, library room 2",
// "2 seats left" and the button "Join". A native reader should check it.

function card(title: string, heading: string, name: string, when: string, seats: string, join: string): SpecBlock[] {
  return [
    { kind: "nav", title },
    { kind: "text", text: heading, size: 13, weight: 700 },
    {
      kind: "box",
      border: true,
      pad: 12,
      gap: 8,
      children: [
        {
          kind: "row",
          gap: 10,
          weights: [3, 1],
          children: [
            {
              kind: "box",
              fill: "none",
              pad: 0,
              gap: 4,
              children: [
                { kind: "text", text: name, size: 14, weight: 600 },
                { kind: "text", text: when, size: 12.5, tone: "muted" },
                { kind: "text", text: seats, size: 12, weight: 600, tone: "accent" },
              ],
            },
            { kind: "button", label: join, full: true },
          ],
        },
      ],
    },
    { kind: "space", height: 40 },
  ];
}

const ENGLISH: SpecScreen = {
  alt: "Halaqa's group card in English. The text starts on the left: Data structures, exam Thursday, Tonight 8 pm, library room 2, 2 seats left. The Join button sits at the right end of the card.",
  dir: "ltr",
  blocks: card("Halaqa", "Tonight at your university", "Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left", "Join"),
};

const ARABIC: SpecScreen = {
  alt: "The same card in Arabic, written right to left. The Arabic text starts on the right and is aligned to the right. The Join button, which was at the right end in English, is now at the left end.",
  dir: "rtl",
  blocks: card("حلقة", "الليلة في جامعتك", "هياكل البيانات، اختبار الخميس", "الليلة 8 مساءً، غرفة المكتبة 2", "بقي مقعدان", "انضم"),
};

export const productM3RtlCard: CustomCanvasSpec = {
  kind: "custom",
  title: "Halaqa's card in Arabic",
  purpose: "Switch between Halaqa's group card in English and in Arabic and see what moves when a page reads from right to left.",
  limits:
    "This is one card, not a full right-to-left check. The Arabic is short and should be read by a native reader on a real phone. The sources give no rule for which icons to mirror. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Language",
    versions: [
      { id: "en", label: "English", screen: ENGLISH, verdict: { text: "Text left, Join on the right", tone: "accent" } },
      { id: "ar", label: "Arabic", screen: ARABIC, verdict: { text: "Text right, Join moved left", tone: "good" } },
    ],
    hint: "Switch between English and Arabic and watch where the text and the Join button go.",
    start: "en",
  }),
};
