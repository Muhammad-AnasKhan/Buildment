import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 2.2: Maryam's Halaqa "Find a group" screen (fictional)
// as she built it, with every line bold and the same size, and after she made
// one thing come first. Each version also shows as a blur, the squint test:
// blurred, a screen keeps only its strong shapes.

const AS_BUILT: SpecScreen = {
  alt: "Halaqa's Find a group screen as built. Five lines of bold text in one size, three identical outlined buttons and a row of feature names.",
  blocks: [
    { kind: "text", text: "Halaqa", size: 14, weight: 700 },
    { kind: "text", text: "Study groups for tonight", size: 14, weight: 700 },
    { kind: "text", text: "Data structures, exam Thursday", size: 14, weight: 700 },
    { kind: "text", text: "Tonight 8 pm, library room 2", size: 14, weight: 700 },
    { kind: "text", text: "2 seats left", size: 14, weight: 700 },
    { kind: "button", label: "Join", variant: "secondary", size: 14 },
    { kind: "button", label: "Create group", variant: "secondary", size: 14 },
    { kind: "button", label: "Chat", variant: "secondary", size: 14 },
    { kind: "pills", items: [{ text: "Polls" }, { text: "Voice rooms" }, { text: "Streaks" }] },
  ],
};

const FIXED: SpecScreen = {
  alt: "Halaqa's Find a group screen after the fix. The group's name is large and bold, its time, place and seats are smaller, and one filled Join button follows. Other actions are small and plain.",
  blocks: [
    { kind: "text", text: "Data structures, exam Thursday", size: 22, weight: 700 },
    { kind: "text", text: "Tonight 8 pm, library room 2", size: 16, tone: "muted" },
    { kind: "text", text: "2 seats left", size: 16, weight: 600 },
    { kind: "button", label: "Join this group", full: true, size: 16 },
    { kind: "button", label: "Create group", variant: "ghost", size: 13 },
    { kind: "text", text: "Chat, polls and voice rooms are in the menu.", size: 13, tone: "muted" },
  ],
};

export const productM2SquintTest: CustomCanvasSpec = {
  kind: "custom",
  title: "The squint test",
  purpose: "Switch between Maryam's screen as built and fixed, each shown sharp and then blurred, and see which shapes survive a squint.",
  limits:
    "A blur shows size, weight and contrast, not meaning: a screen can pass the squint test and still put the wrong thing first. The blur is drawn, not your eyes. Halaqa is fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    versions: [
      { id: "built", label: "As built", screen: AS_BUILT, verdict: { text: "Same size, same weight", tone: "bad" } },
      { id: "built-blur", label: "Squint 1", screen: AS_BUILT, blur: true, verdict: { text: "Nothing stands out", tone: "bad" } },
      { id: "fixed", label: "Fixed", screen: FIXED, verdict: { text: "One group first, then Join", tone: "good" } },
      { id: "fixed-blur", label: "Squint 2", screen: FIXED, blur: true, verdict: { text: "Two clear shapes survive", tone: "good" } },
    ],
    hint: "Switch between the sharp screens and the squints.",
    start: "built",
  }),
};
