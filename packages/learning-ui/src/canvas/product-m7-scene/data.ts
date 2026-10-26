import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.1 (set the scene): what Dalia saw when she opened
// Maryam's work, against what was there. Halaqa and both people are fictional.

const LOGIN_WALL: SpecScreen = {
  alt: "A sign-up page for Halaqa that asks for an email and a password before it shows anything else.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    { kind: "text", text: "Create your account to see study groups", size: 20, weight: 700 },
    { kind: "field", label: "Email", placeholder: "you@example.com" },
    { kind: "field", label: "Password", placeholder: "At least 8 characters" },
    { kind: "button", label: "Sign up", full: true },
    { kind: "text", text: "Already have an account? Log in", size: 12, tone: "muted" },
  ],
};

const SILENT_VIDEO: SpecScreen = {
  alt: "A demo video paused at 14 seconds, showing a settings page, with the sound off and no words or captions on the screen.",
  blocks: [
    { kind: "nav", title: "Halaqa demo" },
    { kind: "image", art: "list", height: 120, caption: "Settings page, shown for 30 seconds" },
    { kind: "progress", value: 0.11, label: "0:14 of 2:10" },
    { kind: "pill", text: "Sound off", tone: "warn" },
    { kind: "text", text: "A voice explains each screen. There are no captions.", size: 12, tone: "muted" },
  ],
};

const THE_WORK: SpecScreen = {
  alt: "The Halaqa screen behind the wall: the result of Maryam's check, then tonight's groups with seats left and a Join button.",
  blocks: [
    { kind: "nav", title: "Tonight's groups" },
    { kind: "stat", value: "4 of 5", label: "classmates joined a group in their first visit", tone: "good" },
    {
      kind: "box",
      border: true,
      pad: 10,
      gap: 6,
      children: [
        { kind: "text", text: "Data structures, exam Thursday", size: 14, weight: 600 },
        { kind: "text", text: "Tonight 8 pm, library room 2", size: 12.5, tone: "muted" },
        { kind: "text", text: "2 seats left", size: 12, weight: 600, tone: "accent" },
        { kind: "button", label: "Join", full: true },
      ],
    },
  ],
};

export const productM7Scene: CustomCanvasSpec = {
  kind: "custom",
  title: "Three things Dalia met",
  purpose: "Switch between the sign-up page Dalia met, the silent video she played and the screen that was behind them, and see what each one showed her.",
  limits: "Halaqa, Maryam and Dalia are fictional. Real people open links in many ways; this is one morning.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "What Dalia met",
    versions: [
      { id: "wall", label: "Login wall", screen: LOGIN_WALL, verdict: { text: "Dalia stops here", tone: "bad" } },
      { id: "video", label: "No sound", screen: SILENT_VIDEO, verdict: { text: "A silent video says nothing", tone: "bad" } },
      { id: "work", label: "The work", screen: THE_WORK, verdict: { text: "The good part she never saw", tone: "good" } },
    ],
    hint: "Touch each name to see what Dalia met.",
  }),
};
