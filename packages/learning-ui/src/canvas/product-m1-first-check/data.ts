import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 1.5: Maryam's two checks of Halaqa (fictional). The
// goal is "a student joins a study group for an upcoming exam". The signal is
// how many of five classmates join a group in their first visit, and how long
// it takes. First check: 2 of 5. After the redesign, with five new
// classmates: 4 of 5, in about 2 minutes. These are the course canon numbers.

const FIRST: SpecScreen = {
  alt: "Maryam's notes from the first check of the current app: 2 of 5 classmates joined a group in their first visit, and 2 pressed Back twice and closed the app.",
  blocks: [
    { kind: "nav", title: "Check 1: current app" },
    { kind: "text", text: "Task: find a group for Thursday's exam and join it.", size: 13 },
    {
      kind: "row",
      gap: 12,
      children: [
        { kind: "stat", value: "2 of 5", label: "joined in their first visit", tone: "bad" },
        { kind: "stat", value: "2 of 5", label: "pressed Back twice and left" },
      ],
    },
    { kind: "divider" },
    { kind: "text", text: "Where they stopped: the search screen.", size: 13, tone: "muted" },
  ],
};

const AFTER: SpecScreen = {
  alt: "Maryam's notes from the second check after the redesign, with five new classmates: 4 of 5 joined a group in their first visit, in about 2 minutes.",
  blocks: [
    { kind: "nav", title: "Check 2: redesign" },
    { kind: "text", text: "Same task, five new classmates.", size: 13 },
    {
      kind: "row",
      gap: 12,
      children: [
        { kind: "stat", value: "4 of 5", label: "joined in their first visit", tone: "good" },
        { kind: "stat", value: "2 min", label: "about, to join" },
      ],
    },
    { kind: "divider" },
    { kind: "text", text: "One person still asked where the Join button was.", size: 13, tone: "muted" },
  ],
};

export const productM1FirstCheck: CustomCanvasSpec = {
  kind: "custom",
  title: "Maryam's two checks",
  purpose: "Switch between the notes from Maryam's first check of Halaqa and her second check after the redesign, each with five classmates and one task.",
  limits:
    "Five people can show the biggest problems of one group. They do not prove the design is good, and another group of students may meet other problems. Maryam, Halaqa and the numbers are a fictional case.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Check",
    versions: [
      { id: "first", label: "Check 1", screen: FIRST, verdict: { text: "2 of 5 joined: fix first", tone: "bad" } },
      { id: "after", label: "Check 2", screen: AFTER, verdict: { text: "A good sign, not proof", tone: "good" } },
    ],
    hint: "Switch between Maryam's two checks.",
  }),
};
