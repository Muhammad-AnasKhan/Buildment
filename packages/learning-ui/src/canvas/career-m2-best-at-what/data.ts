import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.1 (spec beat 1): "What are you best at?"
// Data copied from canvas-specs/career-m2-best-at-what.md. Characters and numbers are fictional and illustrative.

export const careerM2BestAtWhat: SceneSpec = {
  kind: "scene",
  title: "\"What are you best at?\"",
  purpose: "On a first call a founder asks Ruqaya what she is best at and how anyone would know. She answers with a row of tools. The founder is still unsure.",
  limits: "Ruqaya is a fictional fellow and the call is a story. The picture does not say tools are unimportant; it says a list of tools does not show what you are best at.",
  hint: "Watch the question and the answer.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "founder", label: "Founder", kind: "user", sub: "on a call", x: 62, y: 110 },
      { id: "ruqaya", label: "Ruqaya", kind: "user", sub: "designer", x: 358, y: 110 },
      { id: "tools", label: "Tool logos", kind: "note", sub: "a long row", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "founder", to: "ruqaya", label: "best at what?" },
      { kind: "fly", at: 1.6, dur: 1, from: "founder", to: "ruqaya", label: "how would I know?" },
      { kind: "say", at: 2.8, actor: "ruqaya", text: "lists tools", tone: "accent" },
      { kind: "fly", at: 3.1, dur: 1, from: "tools", to: "founder", label: "a row of logos" },
      { kind: "say", at: 4.3, actor: "founder", text: "still unsure", tone: "warn" },
      { kind: "verdict", at: 5, text: "A list of tools does not answer it", tone: "warn" },
    ],
    loop: 9,
  },
};
