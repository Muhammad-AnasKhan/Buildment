import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.4 beat 1: Start with the result.
// Frame one of the demo is the low-stock warning, not a logo.

export const careerM5StartWithResult: SceneSpec = {
  kind: "scene",
  title: "Start with the result",
  purpose: "A viewer opens Areej's 90-second demo. The first frame shows the low-stock warning, the payoff. A logo intro would have shown nothing yet.",
  limits: "Areej is a fictional fellow. Starting with the result is this course's method, not a research finding. The 60 to 120 second range is also a course rule.",
  hint: "Frame one is the payoff.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "viewer",
        label: "Viewer",
        kind: "user",
        sub: "first frame",
        x: 62,
        y: 110
      },
      {
        id: "frame",
        label: "Frame 1",
        kind: "note",
        sub: "low-stock alert",
        x: 358,
        y: 110
      },
      {
        id: "logo",
        label: "Logo intro",
        kind: "note",
        sub: "skip it",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "viewer",
        to: "frame",
        label: "watch"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "frame",
        text: "the payoff",
        tone: "good"
      },
      {
        kind: "say",
        at: 2.2,
        actor: "logo",
        text: "no payoff",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 3,
        text: "Start with the result",
        tone: "good"
      }
    ],
    loop: 7
  },
};
