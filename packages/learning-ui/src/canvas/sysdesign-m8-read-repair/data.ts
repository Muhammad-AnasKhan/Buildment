import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.7 beat 3 ("A read can repair a stale copy"). In leaderless stores, a read can both answer and heal a stale copy.
export const sysdesignM8ReadRepair: SceneSpec = {
  kind: "scene",
  title: "The read finds the newest value and repairs one node",
  purpose: "The client reads several nodes. They disagree. It keeps the newest version and writes it back to the node that was behind.",
  limits: "Three nodes and a version number per value. Telling \"newer\" from \"concurrent\" needs vector clocks or similar (module 13).",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "reads x", x: 210, y: 90 },
      { id: "n1", label: "Node 1", kind: "database", sub: "x = 7, v2", x: 60, y: 235 },
      { id: "n2", label: "Node 2", kind: "database", sub: "x = 7, v2", x: 210, y: 235 },
      { id: "n3", label: "Node 3", kind: "database", sub: "x = 6, v1", x: 360, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "client", to: "n1", label: "read x" },
      { kind: "fly", at: 0.3, dur: 0.7, from: "client", to: "n2", label: "read x" },
      { kind: "fly", at: 0.3, dur: 0.7, from: "client", to: "n3", label: "read x" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "n1", to: "client", label: "7, v2" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "n2", to: "client", label: "7, v2" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "n3", to: "client", label: "6, v1", tone: "warn" },
      { kind: "say", at: 2, actor: "client", text: "newest: v2", tone: "good" },
      { kind: "mark", at: 2.1, actor: "n3", tone: "warn" },
      { kind: "fly", at: 2.3, dur: 0.9, from: "client", to: "n3", label: "repair 7, v2", tone: "good" },
      { kind: "say", at: 3.2, actor: "n3", text: "x = 7, v2", tone: "good" },
      { kind: "verdict", at: 3.3, text: "Stale copy fixed by the read", tone: "good" },
    ],
    loop: 6.4,
  },
};
