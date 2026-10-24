import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.4 beat 4: A key sends all of one customer's events to one partition.
export const sysdesignM15KeyRoutes: SceneSpec = {
  kind: "scene",
  title: "A key sends all of one customer's events to one partition",
  purpose: "Layla's events always go to partition 0 and Omar's go to partition 1. Inside a partition, events keep the order they were written.",
  limits: "Two keys and two partitions. A real topic has many partitions and many keys per partition; the partition is chosen by a hash of the key, as in chapter 9.2.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "shop", label: "Shop", kind: "server", sub: "sends events", x: 60, y: 190 },
      { id: "p0", label: "Part. 0", kind: "queue", sub: "empty", x: 330, y: 100 },
      { id: "p1", label: "Part. 1", kind: "queue", sub: "empty", x: 330, y: 270 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "shop", to: "p0", label: "layla placed" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "shop", to: "p1", label: "omar placed" },
      { kind: "fly", at: 2.3, dur: 0.8, from: "shop", to: "p0", label: "layla paid" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "shop", to: "p1", label: "omar paid" },
      { kind: "say", at: 1.2, actor: "p0", text: "layla: 1", tone: "accent" },
      { kind: "say", at: 2.2, actor: "p1", text: "omar: 1", tone: "accent" },
      { kind: "say", at: 3.2, actor: "p0", text: "layla: 1, 2", tone: "good" },
      { kind: "say", at: 4.2, actor: "p1", text: "omar: 1, 2", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Same key, same partition, same order", tone: "good" },
    ],
    loop: 7.8,
  },
};
