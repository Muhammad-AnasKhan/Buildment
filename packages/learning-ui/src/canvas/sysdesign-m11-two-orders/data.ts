import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.4 beat 2 ("Unrelated writes, two orders"). Two writes with no link between them can reach two readers in opposite orders. Causal allows it, sequential does not.
export const sysdesignM11TwoOrders: SceneSpec = {
  kind: "scene",
  title: "Two readers see two writes in opposite orders",
  purpose: "Ada writes 1 and Bao writes 2, with no link between them. Reader C gets 1 first, then 2. Reader D gets 2 first, then 1.",
  limits: "Four people and two writes. The slow copies take several seconds here so you can watch them. Causal consistency allows this picture; sequential consistency does not.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "ada", label: "Ada", kind: "phone", sub: "writes 1", x: 70, y: 105 },
      { id: "bao", label: "Bao", kind: "phone", sub: "writes 2", x: 70, y: 255 },
      { id: "c", label: "Reader C", kind: "user", sub: "has seen: -", x: 350, y: 105 },
      { id: "d", label: "Reader D", kind: "user", sub: "has seen: -", x: 350, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "ada", to: "c", label: "1" },
      { kind: "fly", at: 0.3, dur: 3.4, from: "ada", to: "d", label: "1 (slow)", tone: "warn" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "bao", to: "d", label: "2" },
      { kind: "fly", at: 0.3, dur: 3.4, from: "bao", to: "c", label: "2 (slow)", tone: "warn" },
      { kind: "say", at: 1.2, actor: "c", text: "saw 1", tone: "accent" },
      { kind: "say", at: 1.2, actor: "d", text: "saw 2", tone: "accent" },
      { kind: "say", at: 3.7, actor: "c", text: "saw 1 then 2", tone: "warn" },
      { kind: "say", at: 3.7, actor: "d", text: "saw 2 then 1", tone: "warn" },
      { kind: "mark", at: 3.8, actor: "c", tone: "warn" },
      { kind: "mark", at: 3.8, actor: "d", tone: "warn" },
      { kind: "verdict", at: 3.9, text: "Causal allows it, sequential does not", tone: "warn" },
    ],
    loop: 7.2,
  },
};
