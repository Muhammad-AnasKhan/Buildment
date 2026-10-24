import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.7 beat 1 ("No leader: write to many nodes"). A leaderless write succeeds once enough nodes confirm it, not all of them.
export const sysdesignM8WriteMany: SceneSpec = {
  kind: "scene",
  title: "No leader: the client writes to all five nodes",
  purpose: "There is no leader. The client sends the write to every node holding the data and counts the confirmations.",
  limits: "Five nodes, one key, and two slow nodes. Real systems also handle nodes that are down (hinted handoff) and need versions to tell old from new (module 13).",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "w = 3", x: 210, y: 90 },
      { id: "n1", label: "Node 1", kind: "database", sub: "x = 6", x: 60, y: 195 },
      { id: "n2", label: "Node 2", kind: "database", sub: "x = 6", x: 210, y: 195 },
      { id: "n3", label: "Node 3", kind: "database", sub: "x = 6", x: 360, y: 195 },
      { id: "n4", label: "Node 4", kind: "database", sub: "x = 6", x: 60, y: 290 },
      { id: "n5", label: "Node 5", kind: "database", sub: "x = 6", x: 360, y: 290 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "client", to: "n1", label: "x = 7" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "client", to: "n2", label: "x = 7" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "client", to: "n3", label: "x = 7" },
      { kind: "fly", at: 0.3, dur: 1.8, from: "client", to: "n4", label: "x = 7" },
      { kind: "fly", at: 0.3, dur: 2.2, from: "client", to: "n5", label: "x = 7" },
      { kind: "say", at: 1.1, actor: "n1", text: "x = 7", tone: "good" },
      { kind: "say", at: 1.1, actor: "n2", text: "x = 7", tone: "good" },
      { kind: "say", at: 1.1, actor: "n3", text: "x = 7", tone: "good" },
      { kind: "say", at: 1.3, actor: "client", text: "3 acks: done", tone: "good" },
      { kind: "say", at: 2.1, actor: "n4", text: "x = 7", tone: "good" },
      { kind: "say", at: 2.5, actor: "n5", text: "x = 7", tone: "good" },
      { kind: "verdict", at: 1.4, text: "3 of 5 saved it: write succeeds", tone: "good" },
    ],
    loop: 6,
  },
};
