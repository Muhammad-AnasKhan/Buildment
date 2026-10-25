import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.7 beat 4: In an OR-Set, a remove only kills the adds it has seen.
export const sysdesignM13Orset: SceneSpec = {
  kind: "scene",
  title: "In an OR-Set, a remove only kills the adds it has seen",
  purpose: "Both replicas hold milk, added once with tag A:1. A removes milk, which marks tag A:1 as removed. At the same time B adds milk again with a new tag, B:1. After the merge, tag B:1 is still alive, so milk stays.",
  limits: "One element and two tags. An OR-Set keeps every tag and every removed mark, so its state grows (chapter 13.8, challenge 12 part 4).",
  scene: {
    width: 420,
    height: 230,
    actors: [
      { id: "a", label: "Replica A", kind: "database", sub: "milk: A:1", x: 60, y: 115 },
      { id: "b", label: "Replica B", kind: "database", sub: "milk: A:1", x: 360, y: 115 },
    ],
    events: [
      { kind: "say", at: 0.6, actor: "a", text: "removes A:1", tone: "accent" },
      { kind: "say", at: 0.6, actor: "b", text: "adds milk B:1", tone: "accent" },
      { kind: "fly", at: 2, dur: 1.8, from: "a", to: "b", label: "removed A:1" },
      { kind: "fly", at: 2, dur: 1.8, from: "b", to: "a", label: "milk B:1" },
      { kind: "say", at: 4.1, actor: "a", text: "milk: B:1", tone: "good" },
      { kind: "say", at: 4.1, actor: "b", text: "milk: B:1", tone: "good" },
      { kind: "verdict", at: 4.5, text: "The add survives: milk stays", tone: "good" },
    ],
    loop: 7.5,
  },
};
