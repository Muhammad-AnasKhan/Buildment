import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.2 beat 5: Areej's classmate says her post back; the gap is what she fixes.
// Fictional people only. No dashes.

export const careerM8SayItBack: SceneSpec = {
  kind: "scene",
  title: "The say-it-back test",
  purpose: "Areej's classmate reads her post and says it back: she made the list faster by keeping a copy for 30 seconds, and proved it with the same test before and after. One thing is missing: why the copy can be stale. She adds a sentence.",
  limits: "Areej is a fictional fellow. The test needs a person, not a tool. One listener is a small sample, so test at least twice. Plain-language guidance, not a trial.",
  hint: "Say it back, then fix the gap.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "areej",
        label: "Areej",
        kind: "user",
        sub: "wrote the post",
        x: 62,
        y: 110
      },
      {
        id: "classmate",
        label: "Classmate",
        kind: "user",
        sub: "says it back",
        x: 358,
        y: 110
      },
      {
        id: "gap",
        label: "The gap",
        kind: "note",
        sub: "what was lost",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "areej",
        to: "classmate",
        label: "reads the post"
      },
      {
        kind: "fly",
        at: 1.6,
        dur: 1,
        from: "classmate",
        to: "areej",
        label: "kept a copy 30 s"
      },
      {
        kind: "say",
        at: 2.8,
        actor: "gap",
        text: "stale? missing",
        tone: "warn"
      },
      {
        kind: "say",
        at: 3.4,
        actor: "areej",
        text: "adds a line",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "If they cannot say it back, rewrite",
        tone: "good"
      }
    ],
    loop: 8
  }
};
