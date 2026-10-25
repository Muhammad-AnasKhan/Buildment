import type { CustomCanvasSpec } from "../registry";
import type { SpecBlock, SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 6.1 (set the scene): Maryam's create-group screen in
// Halaqa (fictional) and the screen that each of three AI critiques would
// make. The three critiques are invented for the case. All four verdicts are
// neutral on purpose: the chapter asks who decides, not which one is right.

const COURSE: SpecBlock = { kind: "field", label: "Course", value: "Data structures" };
const WHEN: SpecBlock = { kind: "field", label: "When", value: "Tonight, 8 pm" };
const WHERE: SpecBlock = { kind: "field", label: "Where", value: "Library room 2", hint: "Library, online or cafe" };
const SEATS: SpecBlock = { kind: "field", label: "Seats", value: "4" };

const NOW: SpecScreen = {
  alt: "Halaqa's create-group screen as it is now: four labelled fields and a Create group button.",
  blocks: [{ kind: "nav", title: "New group" }, COURSE, WHEN, WHERE, SEATS, { kind: "button", label: "Create group" }],
};

const ONE: SpecScreen = {
  alt: "Tool one's version: only the Course and When fields are left, with the Create group button.",
  blocks: [{ kind: "nav", title: "New group" }, COURSE, WHEN, { kind: "button", label: "Create group" }],
};

const TWO: SpecScreen = {
  alt: "Tool two's version: the same four fields, with the hint under Where in darker, larger text.",
  blocks: [
    { kind: "nav", title: "New group" },
    COURSE,
    WHEN,
    { kind: "field", label: "Where", value: "Library room 2" },
    { kind: "text", text: "Library, online or cafe", size: 13 },
    SEATS,
    { kind: "button", label: "Create group" },
  ],
};

const THREE: SpecScreen = {
  alt: "Tool three's version: a purple glowing header, the same four fields, and a glowing button that says Get started.",
  blocks: [
    { kind: "box", fill: "glow", radius: 12, pad: 14, children: [{ kind: "text", text: "New group", size: 20, weight: 800, tone: "onGlow" }] },
    COURSE,
    WHEN,
    WHERE,
    SEATS,
    { kind: "button", label: "Get started", variant: "glow" },
  ],
};

export const productM6Scene: CustomCanvasSpec = {
  kind: "custom",
  title: "Three AI opinions on one screen",
  purpose: "Switch between Maryam's create-group screen and the screen each of three AI critiques would make, to see that the three answers pull in different directions.",
  limits:
    "The three critiques are invented for this case, not the output of a real tool. The picture does not say which one is right: that is the question of the chapter. Halaqa is a fictional app.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    versions: [
      { id: "now", label: "Now", screen: NOW, verdict: { text: "Now: four fields", tone: "accent" } },
      { id: "one", label: "AI 1", screen: ONE, verdict: { text: "AI 1: two fields only", tone: "accent" } },
      { id: "two", label: "AI 2", screen: TWO, verdict: { text: "AI 2: darker, larger hint", tone: "accent" } },
      { id: "three", label: "AI 3", screen: THREE, verdict: { text: "AI 3: glow, Get started", tone: "accent" } },
    ],
    hint: "Tap a version to see the screen that critique would make.",
    start: "now",
  }),
};
