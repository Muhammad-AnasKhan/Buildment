import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.3 beat 1: the same five posts reach two people in a different order. Card register; checked 2026-10.
export const careerM7DifferentFeeds: SceneSpec = {
  kind: "scene",
  title: "Each feed is built for one viewer",
  purpose: "The same five posts reach two people. The person who reads about databases sees the database post first. The person who reads about design sees the design post first. Each feed is built for one viewer.",
  limits: "A simplified picture. LinkedIn does not publish an exact recipe, and what it does publish changes. Checked 2026-10; trust LinkedIn's own pages over any guide that gives exact numbers.",
  hint: "The same five posts, two feeds.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "posts", label: "Five posts", kind: "note", sub: "the same five", x: 210, y: 105 },
      { id: "p1", label: "Person 1", kind: "user", sub: "reads databases", x: 62, y: 250 },
      { id: "p2", label: "Person 2", kind: "user", sub: "reads design", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "posts", to: "p1", label: "database first" },
      { kind: "say", at: 1.4, actor: "p1", text: "their own feed", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1, from: "posts", to: "p2", label: "design first" },
      { kind: "say", at: 3.5, actor: "p2", text: "another feed", tone: "good" },
      { kind: "verdict", at: 4.2, text: "Each feed is built for one viewer", tone: "accent" },
    ],
    loop: 8,
  },
};
