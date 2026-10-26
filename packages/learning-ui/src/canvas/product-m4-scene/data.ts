import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 4.1: Maryam posts the group page of Halaqa
// (fictional) in the fellows' chat. Huda says it looks fine and Saeed says it
// looks cheap. Version A is the page as the fellows saw it; version B has the
// same facts with different choices, so the reader can find what changed.

export const SCENE_AS_BUILT: SpecScreen = {
  alt: "Halaqa's group page as built: a title, three plain lines of equal weight, three small chips for chat, files and polls, and a small Join button.",
  blocks: [
    { kind: "nav", title: "Study group", back: true },
    { kind: "text", text: "Data structures, exam Thursday", size: 16, weight: 600 },
    { kind: "text", text: "Tonight 8 pm", size: 13 },
    { kind: "text", text: "Library room 2", size: 13 },
    { kind: "text", text: "2 seats left", size: 13 },
    { kind: "pills", items: [{ text: "Chat" }, { text: "Files" }, { text: "Polls" }] },
    { kind: "button", label: "Join", size: 12 },
  ],
};

export const SCENE_CHANGED: SpecScreen = {
  alt: "The same group page with other choices: a larger title, the number of seats left as the biggest figure, one wide Join button, and one short line about chat, files and polls.",
  blocks: [
    { kind: "nav", title: "Study group", back: true },
    { kind: "text", text: "Data structures, exam Thursday", size: 20, weight: 700 },
    { kind: "stat", value: "2", label: "seats left", tone: "accent" },
    { kind: "text", text: "Tonight 8 pm, library room 2", size: 14, tone: "muted" },
    { kind: "button", label: "Join this group", full: true, size: 16 },
    { kind: "text", text: "Chat, files and polls open after you join.", size: 12, tone: "muted" },
  ],
};

export const productM4Scene: CustomCanvasSpec = {
  kind: "custom",
  title: "Same page, two versions",
  purpose: "Switch between two versions of the Halaqa group page and find what changed between the one Huda and Saeed argued about and a version with other choices.",
  limits:
    "A picture cannot show how a page feels in someone's hand, and two versions are not a test with people. Halaqa, Huda and Saeed are fictional.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "Version",
    versions: [
      { id: "a", label: "Version A", screen: SCENE_AS_BUILT, verdict: { text: "Huda: fine. Saeed: cheap.", tone: "accent" } },
      { id: "b", label: "Version B", screen: SCENE_CHANGED, verdict: { text: "Same page. What changed?", tone: "accent" } },
    ],
    hint: "Switch between the two versions and look for what changed.",
    start: "a",
  }),
};
