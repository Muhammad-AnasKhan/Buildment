import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.2: the same Halaqa group page (fictional) written
// two ways. In the first the key facts come last, after a long welcome. In
// the second the first words of the heading and of every line carry the
// meaning, and the extras are cut. It shows the fix for the F-shaped scan:
// a page that gives the reader cues.

const BURIED: SpecScreen = {
  alt: "A group page with a vague heading, About this study group, and one long paragraph. The time, the place and the seats left come at the very end of the paragraph.",
  blocks: [
    { kind: "text", text: "About this study group", size: 18, weight: 700 },
    {
      kind: "text",
      text: "Welcome to our circle. We are students who like to revise together because it keeps us on track before exams. Everyone is kind and everyone gets a turn. This week we cover lists and trees, and we meet tonight at 8 pm in library room 2. Two seats are left.",
      size: 14,
      lineHeight: 1.5,
    },
    { kind: "button", label: "Join this group", full: true, size: 14 },
  ],
};

const FRONT: SpecScreen = {
  alt: "The same page. The heading is the group's name. The next lines give the time and place, then the seats left, then one short sentence. The long welcome is cut.",
  blocks: [
    { kind: "text", text: "Data structures, exam Thursday", size: 20, weight: 700 },
    { kind: "text", text: "Tonight 8 pm, library room 2", size: 16 },
    { kind: "text", text: "2 seats left", size: 16, weight: 600 },
    { kind: "text", text: "Bring your notes and past exam questions.", size: 14, tone: "muted" },
    { kind: "button", label: "Join this group", full: true, size: 14 },
  ],
};

export const productM2FrontLoad: CustomCanvasSpec = {
  kind: "custom",
  title: "Key point first",
  purpose: "Switch between a group page that buries the time and seats in a paragraph and the same page with the key facts first.",
  limits:
    "Two pages cannot show how a real reader scans, and the scan depends on the page. NN/g's advice is a guideline, not a test result. The group and its words are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Page",
    versions: [
      { id: "buried", label: "Buried", screen: BURIED, verdict: { text: "The key facts come last", tone: "bad" } },
      { id: "first", label: "Up front", screen: FRONT, verdict: { text: "The key facts come first", tone: "good" } },
    ],
    hint: "Switch between the two pages and read only the first words of each line.",
    start: "buried",
  }),
};
