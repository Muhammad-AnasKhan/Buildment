import type { CustomCanvasSpec } from "../registry";
import type { SpecScreen } from "../models/ui-specimen";
import { makeSpecimenCompareCanvas } from "../primitives/canvas-factories";

// Product Sense, chapter 7.4: the same Halaqa link (fictional) behind a login
// wall, behind a guest button, and when the live demo is down and a video and
// screenshots take its place.

const LOGIN_WALL: SpecScreen = {
  alt: "A sign-in page for Halaqa that asks for an email and a password before it shows anything else.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    { kind: "text", text: "Sign in to continue", size: 20, weight: 700 },
    { kind: "field", label: "Email", placeholder: "you@example.com" },
    { kind: "field", label: "Password", placeholder: "Your password" },
    { kind: "button", label: "Log in", full: true },
    { kind: "text", text: "No account? Sign up with your university email.", size: 12, tone: "muted" },
  ],
};

const GUEST: SpecScreen = {
  alt: "Halaqa in guest mode: a note that the data is a sample, tonight's groups with seats left, and a Join button that works at once.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    { kind: "pill", text: "Guest mode: sample groups", tone: "accent" },
    { kind: "text", text: "Tonight's groups", size: 18, weight: 700 },
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
    { kind: "text", text: "Nothing you do here is saved.", size: 11.5, tone: "muted" },
  ],
};

const FALLBACK: SpecScreen = {
  alt: "A page that says the live demo is paused, with a 70 second demo video, a link to screenshots and a link to the README.",
  blocks: [
    { kind: "nav", title: "Halaqa" },
    { kind: "text", text: "The live demo is paused", size: 18, weight: 700 },
    { kind: "text", text: "The host paused it. You can still see the work.", size: 12.5, tone: "muted" },
    { kind: "image", art: "photo", height: 90, caption: "Demo video, 70 seconds, with captions" },
    { kind: "button", label: "Watch the demo", full: true },
    { kind: "button", label: "See the screenshots", full: true, variant: "secondary" },
    { kind: "text", text: "README: how to run it yourself", size: 12, tone: "muted" },
  ],
};

export const productM7OneClickAccess: CustomCanvasSpec = {
  kind: "custom",
  title: "Three ways a link can open",
  purpose: "Switch between a login wall, a guest button and a fallback page for a paused demo, and see what a reviewer gets from each.",
  limits:
    "These are three designs, not a ranking of hosting tools. Any live demo can go down, which is why the fallback matters. Halaqa is fictional, and guest mode shows sample data, never real students.",
  component: makeSpecimenCompareCanvas({
    choiceLabel: "How the link opens",
    versions: [
      { id: "wall", label: "Login wall", screen: LOGIN_WALL, verdict: { text: "A reviewer stops here", tone: "bad" } },
      { id: "guest", label: "Guest", screen: GUEST, verdict: { text: "The core opens in one tap", tone: "good" } },
      { id: "fallback", label: "Fallback", screen: FALLBACK, verdict: { text: "A down demo still shows value", tone: "good" } },
    ],
    hint: "Touch each way. Ask what a busy reviewer sees.",
  }),
};
