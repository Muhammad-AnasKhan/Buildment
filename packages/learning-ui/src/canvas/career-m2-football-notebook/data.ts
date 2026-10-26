import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.4 (spec beat 1): One true, human detail
// Data copied from canvas-specs/career-m2-football-notebook.md. Characters and numbers are fictional and illustrative.

export const careerM2FootballNotebook: SceneSpec = {
  kind: "scene",
  title: "One true, human detail",
  purpose: "Areej has kept a notebook of football match statistics since she was 12. A reader asks what it taught her, and her answer connects to her work.",
  limits: "Areej is a fictional fellow. A human detail is a course suggestion, not research. It must be true, it is optional, and nobody is graded on it. Do not invent a hobby to look interesting.",
  hint: "Watch the reader's question.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "notebook", label: "Notebook", kind: "note", sub: "match stats", x: 62, y: 110 },
      { id: "areej", label: "Areej", kind: "user", sub: "since age 12", x: 358, y: 110 },
      { id: "reader", label: "Reader", kind: "user", sub: "curious", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "notebook", to: "areej", label: "kept for years" },
      { kind: "fly", at: 1.6, dur: 1, from: "reader", to: "areej", label: "what did it teach" },
      { kind: "fly", at: 2.9, dur: 1, from: "areej", to: "reader", label: "averages hide it" },
      { kind: "say", at: 4, actor: "reader", text: "wants more", tone: "good" },
      { kind: "verdict", at: 4.6, text: "A true detail invites a question", tone: "good" },
    ],
    loop: 8,
  },
};
