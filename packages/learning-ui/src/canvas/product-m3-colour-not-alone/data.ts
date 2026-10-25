import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 3.4: never colour alone. Three study groups on
// Halaqa (fictional) whose seats left are shown first only as a coloured bar,
// then with words. WCAG 1.4.1 (level A) asks for more than colour.

const GROUPS = [
  { name: "Data structures", fill: "goodSoft" as const, pill: { text: "4 seats left", tone: "good" as const } },
  { name: "Statistics 101", fill: "warnSoft" as const, pill: { text: "1 seat left", tone: "warn" as const } },
  { name: "Arabic literature", fill: "badSoft" as const, pill: { text: "Full", tone: "bad" as const } },
];

const COLOUR_ONLY: SpecScreen = {
  alt: "Three study groups, each with a green, amber or red bar beside its name and no words about seats.",
  blocks: [
    { kind: "nav", title: "Tonight's groups" },
    ...GROUPS.map(
      (g): SpecBlock => ({
        kind: "row",
        gap: 10,
        weights: [1, 12],
        children: [
          { kind: "box", fill: g.fill, border: true, pad: 0, radius: 4, children: [{ kind: "space", height: 30 }] },
          { kind: "text", text: g.name, size: 14, weight: 600 },
        ],
      })
    ),
    { kind: "space", height: 40 },
  ],
};

const WITH_WORDS: SpecScreen = {
  alt: "The same three study groups, each with the same colour and the words 4 seats left, 1 seat left or Full.",
  blocks: [
    { kind: "nav", title: "Tonight's groups" },
    ...GROUPS.map(
      (g): SpecBlock => ({
        kind: "row",
        gap: 10,
        weights: [1, 12],
        children: [
          { kind: "box", fill: g.fill, border: true, pad: 0, radius: 4, children: [{ kind: "space", height: 46 }] },
          {
            kind: "box",
            fill: "none",
            pad: 0,
            gap: 6,
            children: [
              { kind: "text", text: g.name, size: 14, weight: 600 },
              { kind: "pill", text: g.pill.text, tone: g.pill.tone },
            ],
          },
        ],
      })
    ),
  ],
};

export const productM3ColourNotAlone: CustomCanvasSpec = {
  kind: "custom",
  title: "Never colour alone",
  purpose: "Switch between three study groups that show their seats only as a colour and the same groups with words beside the colour.",
  limits:
    "Colour can still help: it is the extra cue, not the only one. The picture cannot show how the colours look to a person with colour-blindness, so the lesson is about adding words, not about choosing colours. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Groups",
    versions: [
      { id: "colour", label: "Colour", screen: COLOUR_ONLY, verdict: { text: "Colour alone says too little", tone: "bad" } },
      { id: "words", label: "With words", screen: WITH_WORDS, verdict: { text: "Words carry the meaning", tone: "good" } },
    ],
    hint: "Switch between colour alone and colour with words.",
    start: "colour",
  }),
};
