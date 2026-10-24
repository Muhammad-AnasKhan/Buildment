import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.5 beat 2: dynamic splitting. A partition that reaches its size limit (10 GB
// here) splits into two halves of 5 GB. One half stays; the other moves to a
// node with room.
export const sysdesignM9DynamicSplit: SceneSpec = {
  kind: "scene",
  title: "Dynamic split: a full partition becomes two",
  purpose: "A partition grows until it reaches 10 GB. Then it splits at the middle key into two 5 GB halves, and one half moves to a node with room.",
  limits: "The 10 GB limit and the two nodes are made up for the picture; real systems choose their own limits. A split cuts by key range, so it needs ordered keys inside the partition. A hash partition can be split too, by halving its hash range.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "p", label: "Partition", kind: "database", sub: "growing", x: 60, y: 100 },
      { id: "l", label: "Left half", kind: "database", sub: "waiting", x: 210, y: 100 },
      { id: "r", label: "Right half", kind: "database", sub: "waiting", x: 360, y: 100 },
    ],
    strip: { y: 250, from: 0, to: 12, unit: "GB", caption: "size of the partition", every: 2 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 6, label: "grows: 6 GB", tone: "accent" },
      { kind: "tag", at: 1.9, row: 1, value: 10, label: "limit 10 GB", tone: "bad" },
      { kind: "say", at: 1.9, actor: "p", text: "10 GB: full", tone: "bad" },
      { kind: "fly", at: 2.5, dur: 0.8, from: "p", to: "l", label: "half", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.8, from: "p", to: "r", label: "half", tone: "good" },
      { kind: "say", at: 3.3, actor: "l", text: "5 GB, node 1", tone: "good" },
      { kind: "say", at: 3.3, actor: "r", text: "moves to node 2", tone: "good" },
      { kind: "say", at: 3.3, actor: "p", text: "split", tone: "good" },
      { kind: "verdict", at: 3.7, text: "A full partition splits in two", tone: "good" },
    ],
    loop: 7,
  },
};
