import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.2 beat 6: Stack Overflow's 2025 developer survey
// (A64). Each card is a task; its second line fills in with the share of
// respondents who said they do not plan to hand that task to AI. Plans, not
// ability, from people who chose to answer.
export const whoLeadsThisCallSurvey: SceneSpec = {
  kind: "scene",
  title: "Tasks developers plan to keep",
  purpose: "Five tasks fill in one by one with the share of surveyed developers who do not plan to hand them to AI, from 75.8% for deployment down to 28.9% for writing code.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits: "A self-selected survey run by a developer community in 2025. It records what developers say they plan, not what AI can do, and it says nothing about one person's future. The figures are the survey's, not the course's.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "deploy", label: "Deployment", kind: "note", sub: "who keeps it?", x: 60, y: 110 },
      { id: "planning", label: "Planning", kind: "note", sub: "who keeps it?", x: 210, y: 110 },
      { id: "review", label: "Code review", kind: "note", sub: "who keeps it?", x: 360, y: 110 },
      { id: "testing", label: "Testing", kind: "note", sub: "who keeps it?", x: 135, y: 228 },
      { id: "writing", label: "Writing code", kind: "note", sub: "who keeps it?", x: 285, y: 228 },
    ],
    events: [
      { kind: "say", at: 0.8, actor: "deploy", text: "75.8% keep it", tone: "accent" },
      { kind: "mark", at: 0.8, actor: "deploy", tone: "accent" },
      { kind: "say", at: 1.6, actor: "planning", text: "69.2% keep it", tone: "accent" },
      { kind: "say", at: 2.4, actor: "review", text: "58.7% keep it", tone: "accent" },
      { kind: "say", at: 3.2, actor: "testing", text: "44.1% keep it" },
      { kind: "say", at: 4, actor: "writing", text: "28.9% keep it" },
      { kind: "verdict", at: 5, text: "75.3% still ask a person", tone: "accent" },
    ],
    loop: 8,
  },
};
