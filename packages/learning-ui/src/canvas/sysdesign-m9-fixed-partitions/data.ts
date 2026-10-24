import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.5 beat 1: 64 fixed partitions on 4 nodes, 16 each. A fifth node joins and
// takes whole partitions from the others until the load is even: 64 / 5 = 12.8,
// so one node ends with 12 and the rest with 13. Nodes give 3, 3, 3 and 4
// partitions (13 in total, 20% of the data) and the new node gets 13.
export const sysdesignM9FixedPartitions: SceneSpec = {
  kind: "scene",
  title: "Fixed partitions: a new node takes whole pieces",
  purpose: "The data is cut into 64 partitions from the start. A fifth node joins and takes 13 whole partitions from the other four. The key to partition rule never changes.",
  limits: "Made-up numbers: 64 partitions, four nodes, equal-sized partitions. Real systems pick the partition count once, early. Too few and the pieces are huge; too many and the bookkeeping grows. The picture hides the copying time: 13 of 64 partitions of a 1.8 TB table is about 370 GB.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "n1", label: "Node 1", kind: "database", sub: "16 partitions", x: 60, y: 100 },
      { id: "n2", label: "Node 2", kind: "database", sub: "16 partitions", x: 210, y: 100 },
      { id: "n3", label: "Node 3", kind: "database", sub: "16 partitions", x: 360, y: 100 },
      { id: "n4", label: "Node 4", kind: "database", sub: "16 partitions", x: 110, y: 200 },
      { id: "n5", label: "Node 5 (new)", kind: "database", sub: "0 partitions", x: 310, y: 200 },
    ],
    events: [
      { kind: "mark", at: 0.4, actor: "n5", tone: "good" },
      { kind: "say", at: 0.4, actor: "n5", text: "joins empty", tone: "good" },
      { kind: "fly", at: 1.0, dur: 0.8, from: "n1", to: "n5", label: "3", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "n2", to: "n5", label: "3", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.8, from: "n3", to: "n5", label: "3", tone: "good" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "n4", to: "n5", label: "4", tone: "good" },
      { kind: "say", at: 2.7, actor: "n1", text: "13 partitions" },
      { kind: "say", at: 2.7, actor: "n2", text: "13 partitions" },
      { kind: "say", at: 2.7, actor: "n3", text: "13 partitions" },
      { kind: "say", at: 2.7, actor: "n4", text: "12 partitions" },
      { kind: "say", at: 2.7, actor: "n5", text: "13 partitions", tone: "good" },
      { kind: "verdict", at: 3.2, text: "13 of 64 partitions move", tone: "good" },
    ],
    loop: 6.6,
  },
};
