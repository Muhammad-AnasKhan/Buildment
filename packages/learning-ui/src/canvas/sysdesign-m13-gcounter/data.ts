import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.7 beat 2: A G-Counter keeps one slot per replica and merges by max.
export const sysdesignM13Gcounter: SceneSpec = {
  kind: "scene",
  title: "A G-Counter keeps one slot per replica and merges by max",
  purpose: "A counts its own likes in slot A. B counts its own in slot B. They swap their slots and keep the larger value of each. Both show the same total, and an old copy changes nothing.",
  limits: "Two replicas and two slots. A real G-Counter has one slot for every replica that ever counted, so it grows with the cluster. It only counts up.",
  scene: {
    width: 420,
    height: 230,
    actors: [
      { id: "a", label: "Replica A", kind: "database", sub: "A:0 B:0", x: 60, y: 115 },
      { id: "b", label: "Replica B", kind: "database", sub: "A:0 B:0", x: 360, y: 115 },
    ],
    events: [
      { kind: "say", at: 0.4, actor: "a", text: "A:2 B:0", tone: "accent" },
      { kind: "say", at: 0.4, actor: "b", text: "A:0 B:3", tone: "accent" },
      { kind: "fly", at: 1.2, dur: 1.2, from: "a", to: "b", label: "A:2 B:0" },
      { kind: "fly", at: 1.2, dur: 1.2, from: "b", to: "a", label: "A:0 B:3" },
      { kind: "say", at: 2.6, actor: "a", text: "A:2 B:3", tone: "good" },
      { kind: "say", at: 2.6, actor: "b", text: "A:2 B:3", tone: "good" },
      { kind: "fly", at: 3.3, dur: 1, from: "a", to: "b", label: "old A:1" },
      { kind: "say", at: 4.4, actor: "b", text: "still A:2 B:3", tone: "good" },
      { kind: "verdict", at: 4.7, text: "Same total, 5, in any order", tone: "good" },
    ],
    loop: 7.6,
  },
};
