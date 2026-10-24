import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.7 beat 3: A PN-Counter is two G-Counters: ups and downs.
export const sysdesignM13Pncounter: SceneSpec = {
  kind: "scene",
  title: "A PN-Counter is two G-Counters: ups and downs",
  purpose: "A counts 3 ups. B counts 1 down. Each half merges by max on its own. The value is the ups minus the downs, 2, on both replicas.",
  limits: "Two replicas. Because a down is stored as an up in the second counter, the value can go below zero. No counter type can promise to stay above zero (next beats).",
  scene: {
    width: 420,
    height: 230,
    actors: [
      { id: "a", label: "Replica A", kind: "database", sub: "up 0, down 0", x: 60, y: 115 },
      { id: "b", label: "Replica B", kind: "database", sub: "up 0, down 0", x: 360, y: 115 },
    ],
    events: [
      { kind: "say", at: 0.6, actor: "a", text: "up 3, down 0", tone: "accent" },
      { kind: "say", at: 0.6, actor: "b", text: "up 0, down 1", tone: "accent" },
      { kind: "fly", at: 1.9, dur: 1.9, from: "a", to: "b", label: "up A:3" },
      { kind: "fly", at: 1.9, dur: 1.9, from: "b", to: "a", label: "down B:1" },
      { kind: "say", at: 4, actor: "a", text: "up 3, down 1", tone: "good" },
      { kind: "say", at: 4, actor: "b", text: "up 3, down 1", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Value is 3 - 1 = 2 on both", tone: "good" },
    ],
    loop: 7.5,
  },
};
