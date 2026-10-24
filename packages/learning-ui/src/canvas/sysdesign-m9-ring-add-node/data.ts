import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.3 beat 2: a node D joins at position 60, between B (36) and C (86). Only
// the keys between 36 and 60 move, and they move to D. Key k2 (48) is the one
// that moves; k1 (24) and k3 (74) stay where they were.
export const sysdesignM9RingAddNode: SceneSpec = {
  kind: "scene",
  title: "A new node takes keys from one neighbour only",
  purpose: "Node D joins the ring at position 60. Only the keys between B and D change owner, and they all come from C. Every other key stays put.",
  limits: "Three keys and four nodes keep the picture small. In general a new node takes about 1 key in N+1, all from its neighbours. In the course test, adding a fifth node to four moved 19.4% of 100,000 keys with 100 points per node, and none moved between old nodes.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "d", label: "Node D", kind: "server", sub: "new, at 60", x: 60, y: 100 },
      { id: "c", label: "Node C", kind: "server", sub: "owns k2, k3", x: 210, y: 100 },
      { id: "ab", label: "Nodes A, B", kind: "note", sub: "own k1", x: 360, y: 100 },
    ],
    strip: { y: 250, from: 0, to: 100, unit: "", caption: "position on the ring", every: 20 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 10, label: "A", tone: "accent" },
      { kind: "tag", at: 0.3, row: 0, value: 36, label: "B", tone: "accent" },
      { kind: "tag", at: 0.4, row: 0, value: 86, label: "C", tone: "accent" },
      { kind: "tag", at: 0.7, row: 1, value: 24, label: "key k1" },
      { kind: "tag", at: 0.9, row: 1, value: 48, label: "key k2" },
      { kind: "tag", at: 1.1, row: 1, value: 74, label: "key k3" },
      { kind: "tag", at: 1.9, row: 0, value: 60, label: "D", tone: "good" },
      { kind: "mark", at: 1.9, actor: "d", tone: "good" },
      { kind: "say", at: 1.9, actor: "d", text: "joins at 60", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.9, from: "c", to: "d", label: "k2 moves", tone: "warn" },
      { kind: "say", at: 3.4, actor: "c", text: "owns k3", tone: "good" },
      { kind: "say", at: 3.4, actor: "d", text: "owns k2", tone: "good" },
      { kind: "retone", at: 3.4, label: "key k2", tone: "warn" },
      { kind: "say", at: 3.6, actor: "ab", text: "nothing moved", tone: "good" },
      { kind: "verdict", at: 4.0, text: "Only keys between B and D move", tone: "good" },
    ],
    loop: 7.4,
  },
};
