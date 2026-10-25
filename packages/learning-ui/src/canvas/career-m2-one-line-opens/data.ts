import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.3 (spec beat 1): One line hides a whole role
// Data copied from canvas-specs/career-m2-one-line-opens.md. Characters and numbers are fictional and illustrative.

export const careerM2OneLineOpens: SceneSpec = {
  kind: "scene",
  title: "One line hides a whole role",
  purpose: "'Intern, 2025' opens into what sits behind it: the report fix with her lead's review, the numbers, and the permission to show them.",
  limits: "Areej is a fictional fellow and her numbers are illustrative. In public she writes 'a parcel delivery company's back office'; the company name stays in the private arc.",
  hint: "Watch one line open.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "line", label: "Resume line", kind: "note", sub: "Intern, 2025", x: 210, y: 105 },
      { id: "fix", label: "The fix", kind: "note", sub: "lead reviewed", x: 62, y: 250 },
      { id: "numbers", label: "The numbers", kind: "note", sub: "4.6 s to 0.41 s", x: 210, y: 250 },
      { id: "permission", label: "Permission", kind: "note", sub: "names removed", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "line", to: "fix", label: "what I did" },
      { kind: "fly", at: 1.5, dur: 1, from: "line", to: "numbers", label: "what changed" },
      { kind: "fly", at: 2.7, dur: 1, from: "line", to: "permission", label: "may I show it?" },
      { kind: "say", at: 3.9, actor: "line", text: "one short line", tone: "accent" },
      { kind: "verdict", at: 4.4, text: "One line hides a whole role", tone: "accent" },
    ],
    loop: 8,
  },
};
