import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.3 (spec beat 3): "I did" and "the team did"
// Data copied from canvas-specs/career-m2-found-vs-team.md. Characters and numbers are fictional and illustrative.

export const careerM2FoundVsTeam: SceneSpec = {
  kind: "scene",
  title: "\"I did\" and \"the team did\"",
  purpose: "The slow report fix has seven steps. Areej found the query, ran the plan, chose the index and wrote the migration. Her lead reviewed, scheduled and deployed it. The sentence about the result should name both.",
  limits: "Areej is a fictional fellow and the steps are simplified. Researchers measure three kinds of resume deception: fabrication, embellishment and omission. Leaving out the team's part to look bigger is embellishment.",
  hint: "Watch who does what.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "areej", label: "Areej", kind: "user", sub: "my part", x: 62, y: 105 },
      { id: "lead", label: "Her lead", kind: "user", sub: "the team's part", x: 358, y: 105 },
      { id: "report", label: "Report fix", kind: "note", sub: "orders report", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "areej", to: "report", label: "found the query" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "areej", to: "report", label: "ran the plan" },
      { kind: "fly", at: 2.3, dur: 0.8, from: "areej", to: "report", label: "chose the index" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "areej", to: "report", label: "wrote migration" },
      { kind: "fly", at: 4.4, dur: 0.8, from: "lead", to: "report", label: "reviewed" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "lead", to: "report", label: "scheduled" },
      { kind: "fly", at: 6.4, dur: 0.8, from: "lead", to: "report", label: "deployed" },
      { kind: "say", at: 7.3, actor: "report", text: "both named", tone: "good" },
      { kind: "verdict", at: 7.8, text: "Name your part and the team's", tone: "good" },
    ],
    loop: 11,
  },
};
