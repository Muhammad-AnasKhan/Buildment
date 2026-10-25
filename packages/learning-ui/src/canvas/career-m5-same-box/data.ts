import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.2 beat 2: A deployable unit runs the same anywhere.
// One container moves from a laptop to a server unchanged, so the README needs one start command.

export const careerM5SameBox: SceneSpec = {
  kind: "scene",
  title: "A deployable unit runs the same anywhere",
  purpose: "The same container, built on a laptop, runs on a cloud server without changes. The README carries one command to start it.",
  limits: "A simplified picture. Containers need a runtime on each machine and are not a promise that nothing can differ. The course asks only for a one-command start in the README. Checked 2026-10.",
  hint: "The same box, two places.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "laptop",
        label: "Laptop",
        kind: "server",
        sub: "builds the box",
        x: 62,
        y: 110
      },
      {
        id: "cloud",
        label: "Cloud server",
        kind: "server",
        sub: "runs the box",
        x: 358,
        y: 110
      },
      {
        id: "readme",
        label: "README",
        kind: "note",
        sub: "one command",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1.2,
        from: "laptop",
        to: "cloud",
        label: "the same box"
      },
      {
        kind: "say",
        at: 1.7,
        actor: "cloud",
        text: "runs the same",
        tone: "good"
      },
      {
        kind: "say",
        at: 2.4,
        actor: "readme",
        text: "start: one line",
        tone: "accent"
      },
      {
        kind: "verdict",
        at: 3.2,
        text: "The same box runs anywhere",
        tone: "good"
      }
    ],
    loop: 7
  },
};
