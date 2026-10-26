import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.4 beat 3: Show the hard part, not a tour.
// Two sales hit one stock count; the demo shows the one hard thing.

export const careerM5ShowTheHardPart: SceneSpec = {
  kind: "scene",
  title: "Show the hard part, not a tour",
  purpose: "Two sales arrive at the same moment and hit one stock count. The count stays right because the update runs in one transaction. That is the part of the demo to show closely.",
  limits: "The plan is illustrative. A tour of menus proves little; the core flow and one hard detail invite a reader's question.",
  hint: "Two sales, one count.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "sale1",
        label: "Sale 1",
        kind: "user",
        sub: "one customer",
        x: 62,
        y: 110
      },
      {
        id: "sale2",
        label: "Sale 2",
        kind: "user",
        sub: "same moment",
        x: 358,
        y: 110
      },
      {
        id: "stock",
        label: "Stock count",
        kind: "database",
        sub: "must stay right",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "sale1",
        to: "stock",
        label: "sold 1"
      },
      {
        kind: "fly",
        at: 1.5,
        dur: 1,
        from: "sale2",
        to: "stock",
        label: "sold 1"
      },
      {
        kind: "say",
        at: 2.8,
        actor: "stock",
        text: "count right",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 3.5,
        text: "Show the one hard thing",
        tone: "good"
      }
    ],
    loop: 7.5
  },
};
