import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 9, chapter 9.2 beat 3: one change to the kit.
// Areej's capstone feedback flagged "vague ownership" on "we deployed it". She fixes the kit line to
// "my lead deployed it after my migration passed review" and updates the ledger row to match.
// Card register. Areej is a fictional fellow; the picture is a story, not data.
export const careerM9OneChange: SceneSpec = {
  kind: "scene",
  title: "One change to the kit",
  purpose: "The interviewer flags 'we deployed it' for vague ownership. Areej changes the kit line to name her part and her lead's, and updates the ledger row so the two match.",
  limits: "Areej is a fictional fellow. A flag is feedback, not a pass or a fail. Fixing only the spoken answer would leave the kit saying the old thing.",
  hint: "Fix the line and the row.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "flag", label: "Flag", kind: "note", sub: "vague ownership", x: 62, y: 110 },
      { id: "line", label: "Kit line", kind: "note", sub: "we deployed it", x: 358, y: 110 },
      { id: "ledger", label: "Ledger row", kind: "note", sub: "share to fix", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "flag", to: "line", label: "fix the line" },
      { kind: "say", at: 1.4, actor: "line", text: "names her part", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1.0, from: "line", to: "ledger", label: "fix the source" },
      { kind: "say", at: 3.5, actor: "ledger", text: "share updated", tone: "good" },
      { kind: "verdict", at: 4.2, text: "Fix the source, not just the words", tone: "good" },
    ],
    loop: 8,
  },
};
