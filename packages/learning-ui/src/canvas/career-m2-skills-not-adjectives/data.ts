import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.3 (spec beat 4): Four kinds of skill, each with an example
// Data copied from canvas-specs/career-m2-skills-not-adjectives.md. Characters and numbers are fictional and illustrative.

export const careerM2SkillsNotAdjectives: SceneSpec = {
  kind: "scene",
  title: "Four kinds of skill, each with an example",
  purpose: "Four skill cards each start as an adjective and turn into an example from Areej's work: query plans, writing for her lead, training two organisers, and finding the slow query without being asked.",
  limits: "The four kinds are this course's way to sort material, not a research model. Areej is a fictional fellow and her examples are illustrative.",
  hint: "Watch each adjective turn into an example.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "hard", label: "Hard skill", kind: "note", sub: "skilled", x: 62, y: 110 },
      { id: "soft", label: "Soft skill", kind: "note", sub: "friendly", x: 358, y: 110 },
      { id: "lead", label: "Leadership", kind: "note", sub: "a leader", x: 62, y: 240 },
      { id: "init", label: "Initiative", kind: "note", sub: "proactive", x: 358, y: 240 },
    ],
    events: [
      { kind: "say", at: 1.2, actor: "hard", text: "query plans", tone: "good" },
      { kind: "say", at: 2.2, actor: "soft", text: "wrote for lead", tone: "good" },
      { kind: "say", at: 3.2, actor: "lead", text: "trained two", tone: "good" },
      { kind: "say", at: 4.2, actor: "init", text: "found the query", tone: "good" },
      { kind: "verdict", at: 5, text: "An example beats an adjective", tone: "good" },
    ],
    loop: 8.5,
  },
};
