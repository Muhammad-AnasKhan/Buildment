import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.2 (spec beat 2): Two or three pillars, not ten
// Data copied from canvas-specs/career-m2-ten-or-three.md. Characters and numbers are fictional and illustrative.

export const careerM2TenOrThree: SceneSpec = {
  kind: "scene",
  title: "Two or three pillars, not ten",
  purpose: "A reader is shown ten thin pillars and forgets them. Then the reader is shown three solid ones and remembers them.",
  limits: "This is the course's recommendation, not research. Three is a guide, not a law. What matters is that each pillar can be proved.",
  hint: "Watch which set the reader remembers.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "reader", label: "Reader", kind: "user", sub: "remembering", x: 210, y: 105 },
      { id: "ten", label: "Ten pillars", kind: "note", sub: "each one thin", x: 62, y: 250 },
      { id: "three", label: "Three pillars", kind: "note", sub: "each one solid", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "ten", to: "reader", label: "ten things" },
      { kind: "say", at: 1.4, actor: "ten", text: "wobbles", tone: "bad" },
      { kind: "say", at: 1.8, actor: "reader", text: "forgets them", tone: "warn" },
      { kind: "fly", at: 3, dur: 1, from: "three", to: "reader", label: "three things" },
      { kind: "say", at: 4.1, actor: "three", text: "holds", tone: "good" },
      { kind: "say", at: 4.4, actor: "reader", text: "remembers", tone: "good" },
      { kind: "verdict", at: 5, text: "Three solid pillars beat ten thin ones", tone: "good" },
    ],
    loop: 8.5,
  },
};
