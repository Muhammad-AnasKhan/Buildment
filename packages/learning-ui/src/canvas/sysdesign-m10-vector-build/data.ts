import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.4 beat 1: a vector clock keeps one counter per node. A node adds 1 to
// its own slot on every event, and a receive takes the larger of each slot first.
export const sysdesignM10VectorBuild: SceneSpec = {
  kind: "scene",
  title: "Each node keeps a counter for every node",
  purpose: "Three nodes keep [A, B, C] counters. A has two events and sends. B takes the larger of each slot, then adds 1 to its own. B sends on to C, which does the same.",
  limits: "Three nodes and two messages. A vector has one slot for each node that can write, so it grows with the number of nodes. The picture shows only the sends that matter for the story.",
  scene: {
    width: 420,
    height: 250,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "[0,0,0]", x: 60, y: 110 },
      { id: "b", label: "Node B", kind: "server", sub: "[0,0,0]", x: 210, y: 110 },
      { id: "c", label: "Node C", kind: "server", sub: "[0,0,0]", x: 360, y: 110 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "a", text: "[1,0,0]" },
      { kind: "say", at: 0.9, actor: "a", text: "[2,0,0]", tone: "accent" },
      { kind: "fly", at: 1.1, dur: 1, from: "a", to: "b", label: "[2,0,0]" },
      { kind: "say", at: 2.1, actor: "b", text: "[2,1,0]", tone: "good" },
      { kind: "say", at: 2.7, actor: "b", text: "[2,2,0]", tone: "accent" },
      { kind: "fly", at: 2.9, dur: 1, from: "b", to: "c", label: "[2,2,0]" },
      { kind: "say", at: 3.9, actor: "c", text: "[2,2,1]", tone: "good" },
      { kind: "verdict", at: 4.4, text: "Each slot counts one node's events", tone: "good" },
    ],
    loop: 7.6,
  },
};
