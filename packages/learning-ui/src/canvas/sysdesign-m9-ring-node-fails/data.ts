import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.3 beat 5: node D fails. With one point per node, all of D's keys go to
// the next node on the ring, which doubles its load (25% to 50%). With 100
// points per node, D's keys are spread over A, B and C, each rising from 25%
// to about 33%.
export const sysdesignM9RingNodeFails: SceneSpec = {
  kind: "scene",
  title: "When a node fails, who takes its keys?",
  purpose: "With one point per node, D's whole slice falls to one neighbour, which doubles its load. With 100 points each, D's many small slices go to all three survivors.",
  limits: "Four equal nodes, each holding 25% of the keys, are an idealised start. With many points per node the survivors get close to an equal third each, but not exactly, and each still has to cope with about 33% more load, so keep spare room.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "a", label: "Node A", kind: "server", sub: "25% of keys", x: 110, y: 100 },
      { id: "b", label: "Node B", kind: "server", sub: "25% of keys", x: 310, y: 100 },
      { id: "c", label: "Node C", kind: "server", sub: "25% of keys", x: 110, y: 200 },
      { id: "d", label: "Node D", kind: "server", sub: "1 point", x: 310, y: 200 },
    ],
    events: [
      { kind: "say", at: 0.5, actor: "d", text: "fails", tone: "bad" },
      { kind: "mark", at: 0.5, actor: "d", tone: "bad" },
      { kind: "fly", at: 1.0, dur: 0.9, from: "d", to: "a", label: "all its keys", tone: "bad" },
      { kind: "say", at: 1.9, actor: "a", text: "50% of keys", tone: "bad" },
      { kind: "mark", at: 1.9, actor: "a", tone: "bad" },
      { kind: "verdict", at: 2.3, text: "One point: one node takes it all", tone: "bad" },
      { kind: "say", at: 3.8, actor: "a", text: "25% of keys" },
      { kind: "say", at: 3.8, actor: "d", text: "100 points", tone: "good" },
      { kind: "mark", at: 3.8, actor: "a", tone: "good" },
      { kind: "say", at: 4.2, actor: "d", text: "fails", tone: "bad" },
      { kind: "fly", at: 4.6, dur: 0.9, from: "d", to: "a", label: "a share", tone: "good" },
      { kind: "fly", at: 4.6, dur: 0.9, from: "d", to: "b", label: "a share", tone: "good" },
      { kind: "fly", at: 4.6, dur: 0.9, from: "d", to: "c", label: "a share", tone: "good" },
      { kind: "say", at: 5.5, actor: "a", text: "33% of keys", tone: "good" },
      { kind: "say", at: 5.5, actor: "b", text: "33% of keys", tone: "good" },
      { kind: "say", at: 5.5, actor: "c", text: "33% of keys", tone: "good" },
      { kind: "verdict", at: 5.9, text: "100 points: the load is shared", tone: "good" },
    ],
    loop: 9,
  },
};
