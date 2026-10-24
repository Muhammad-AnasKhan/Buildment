import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.3 beat 3: each node has one point, and the points are where the hash
// happened to put them: A 10, B 20, C 70. A owns 70 to 10 (40%), B owns 10 to
// 20 (10%), C owns 20 to 70 (50%).
export const sysdesignM9RingUneven: SceneSpec = {
  kind: "scene",
  title: "One point per node gives slices of very different size",
  purpose: "Three nodes, one random point each. B's slice is only 10% of the ring and C's is 50%, so C holds five times as many keys as B.",
  limits: "One draw of three random points, chosen to show how uneven it can be. For three random points, the largest slice averages about 61% of the ring, and in the course test with 10 nodes and one point each the busiest node held 2.6 times the average.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "at 10", x: 60, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "at 20", x: 210, y: 100 },
      { id: "c", label: "Node C", kind: "server", sub: "at 70", x: 360, y: 100 },
    ],
    strip: { y: 250, from: 0, to: 100, unit: "", caption: "position on the ring", every: 20 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 10, label: "A", tone: "accent" },
      { kind: "tag", at: 0.5, row: 1, value: 20, label: "B", tone: "accent" },
      { kind: "tag", at: 0.7, row: 0, value: 70, label: "C", tone: "accent" },
      { kind: "say", at: 1.6, actor: "a", text: "40% of keys", tone: "warn" },
      { kind: "say", at: 2.2, actor: "b", text: "10% of keys", tone: "good" },
      { kind: "say", at: 2.8, actor: "c", text: "50% of keys", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "c", tone: "bad" },
      { kind: "verdict", at: 3.4, text: "One point each: C holds half the keys", tone: "bad" },
    ],
    loop: 6.4,
  },
};
