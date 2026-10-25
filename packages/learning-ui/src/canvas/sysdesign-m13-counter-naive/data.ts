import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.7 beat 1: Merging a counter by keeping the bigger number loses a like.
export const sysdesignM13CounterNaive: SceneSpec = {
  kind: "scene",
  title: "Merging a counter by keeping the bigger number loses a like",
  purpose: "Two replicas both hold 5 likes. Each gets one like, so each shows 6. They swap numbers and keep the bigger one. The count is 6, but 7 likes happened.",
  limits: "A plain number per replica and a keep-the-bigger rule. It is the simplest merge, and the picture shows exactly where it fails.",
  scene: {
    width: 420,
    height: 230,
    actors: [
      { id: "a", label: "Replica A", kind: "database", sub: "likes: 5", x: 60, y: 115 },
      { id: "b", label: "Replica B", kind: "database", sub: "likes: 5", x: 360, y: 115 },
    ],
    events: [
      { kind: "say", at: 0.6, actor: "a", text: "likes: 6", tone: "accent" },
      { kind: "say", at: 0.6, actor: "b", text: "likes: 6", tone: "accent" },
      { kind: "fly", at: 1.9, dur: 1.9, from: "a", to: "b", label: "likes: 6" },
      { kind: "fly", at: 1.9, dur: 1.9, from: "b", to: "a", label: "likes: 6" },
      { kind: "say", at: 4, actor: "a", text: "keeps 6", tone: "bad" },
      { kind: "say", at: 4, actor: "b", text: "keeps 6", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "Two likes became one: 6, not 7", tone: "bad" },
    ],
    loop: 7.5,
  },
};
