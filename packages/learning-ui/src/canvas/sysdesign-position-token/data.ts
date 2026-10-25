import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 4 of 8.4: the read router compares log positions, not clocks. Amna's
// write is position 1. Replica 1 has applied up to 1; replica 2 is still at 0.
export const sysdesignPositionToken: SceneSpec = {
  kind: "scene",
  title: "The router compares positions, not clocks",
  purpose: "Amna's app carries the log position of her last write; the router only sends her read to a replica that has reached it.",
  limits: "The router already knows each replica's position (in practice it asks, or the replicas report it every few milliseconds). There is one writer and one record; with several writers the app must also raise its position after every read to keep reads from going back in time.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "amna", label: "Amna", kind: "phone", sub: "my position: 1", x: 60, y: 118 },
      { id: "router", label: "Router", kind: "router", sub: "knows positions", x: 210, y: 118 },
      { id: "r1", label: "Replica 1", kind: "database", sub: "at position 1", x: 358, y: 80 },
      { id: "r2", label: "Replica 2", kind: "database", sub: "at position 0", x: 358, y: 168 },
    ],
    strip: { y: 296, from: 0, to: 3, unit: "", caption: "log position", every: 1 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 1, label: "Amna wrote 1" },
      { kind: "tag", at: 0.2, row: 1, value: 0, label: "R2 at 0", tone: "warn" },
      { kind: "tag", at: 0.2, row: 1, value: 1, label: "R1 at 1", tone: "good" },
      { kind: "fly", at: 0.6, dur: 0.9, from: "amna", to: "router", label: "read, need 1" },
      { kind: "say", at: 1.5, actor: "router", text: "R2 at 0: skip", tone: "bad" },
      { kind: "mark", at: 1.5, actor: "r2", tone: "bad" },
      { kind: "say", at: 2.6, actor: "router", text: "R1 at 1: OK", tone: "good" },
      { kind: "mark", at: 2.6, actor: "r1", tone: "good" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "router", to: "r1", label: "read" },
      { kind: "fly", at: 3.8, dur: 1.1, from: "r1", to: "amna", label: "shows it", tone: "good" },
      { kind: "say", at: 4.9, actor: "amna", text: "sees comment", tone: "good" },
      { kind: "verdict", at: 4.9, text: "Replica at 1 or more: safe to read", tone: "good" },
    ],
    loop: 8.2,
  },
};
