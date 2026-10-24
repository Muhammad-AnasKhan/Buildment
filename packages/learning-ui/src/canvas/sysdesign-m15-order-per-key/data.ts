import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.4 beat 6: One reader of two partitions mixes the keys.
export const sysdesignM15OrderPerKey: SceneSpec = {
  kind: "scene",
  title: "One reader of two partitions mixes the keys",
  purpose: "A reader takes events from two partitions. It sees omar 1, layla 1, layla 2, omar 2. Each customer's events are in order, but there is no order between customers.",
  limits: "The mixed order shown is one possible result. A different run could interleave them differently, and that is the point.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "p0", label: "Part. 0", kind: "queue", sub: "layla: 1, 2", x: 60, y: 100 },
      { id: "p1", label: "Part. 1", kind: "queue", sub: "omar: 1, 2", x: 360, y: 100 },
      { id: "reader", label: "Reader", kind: "worker", sub: "reading", x: 210, y: 225 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "p1", to: "reader", label: "omar 1" },
      { kind: "say", at: 1.3, actor: "reader", text: "o1", tone: "accent" },
      { kind: "fly", at: 1.6, dur: 0.8, from: "p0", to: "reader", label: "layla 1" },
      { kind: "say", at: 2.5, actor: "reader", text: "o1 l1", tone: "accent" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "p0", to: "reader", label: "layla 2" },
      { kind: "say", at: 3.7, actor: "reader", text: "o1 l1 l2", tone: "accent" },
      { kind: "fly", at: 4, dur: 0.8, from: "p1", to: "reader", label: "omar 2" },
      { kind: "say", at: 4.9, actor: "reader", text: "o1 l1 l2 o2", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Order holds per key, not across keys", tone: "warn" },
    ],
    loop: 8.4,
  },
};
