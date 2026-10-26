import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.2 beat 2: one trial, 52 mostly junior engineers; the AI group scored lower on a quiz straight after (direction only, no percentages).
// Fictional people; the picture is a story, not data.
export const careerM4SpeedVsUnderstanding: SceneSpec = {
  kind: "scene",
  title: "Speed is not understanding",
  purpose: "Two groups of engineers learn a new library, one with AI help and one without. A quiz straight after gives the AI group a lower score than the other group. The AI group was a little faster, but not by a margin that counted.",
  limits: "One small trial with 52 mostly junior engineers, an immediate quiz, a chat sidebar rather than an agent, and one library. Subgroup results are tiny and not causal. It does not show that AI help always hurts learning.",
  hint: "Same quiz, two groups.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "ai", label: "With AI help", kind: "user", sub: "a bit faster", x: 62, y: 110 },
      { id: "no-ai", label: "No AI help", kind: "user", sub: "coded by hand", x: 358, y: 110 },
      { id: "quiz", label: "Quiz", kind: "note", sub: "right after", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "ai", to: "quiz", label: "answers" },
      { kind: "say", at: 1.4, actor: "ai", text: "lower score", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 1, from: "no-ai", to: "quiz", label: "answers" },
      { kind: "say", at: 3.5, actor: "no-ai", text: "higher score", tone: "good" },
      { kind: "say", at: 4, actor: "quiz", text: "gap: debugging", tone: "accent" },
      { kind: "verdict", at: 4.8, text: "Faster did not mean understood", tone: "warn" },
    ],
    loop: 8.5,
  },
};
