import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.3 beat 5 ("Overlapping reads and writes are not enough"). With R + W over N, a read still can see a new value and a later read an old one while a write is in progress.
export const sysdesignM11QuorumNotEnough: SceneSpec = {
  kind: "scene",
  title: "R + W over N, and still new then old",
  purpose: "Three nodes, write to 2, read from 2. A write is still in progress and has reached one node. Reader A sees the new value. Reader B starts later and sees the old one.",
  limits: "Three nodes, one write in progress, and a copy that is slow on purpose. Real stores add read repair or other steps to close this gap (ABD, module 13).",
  scene: {
    width: 420,
    height: 390,
    actors: [
      { id: "w", label: "Writer", kind: "phone", sub: "write x = 1", x: 210, y: 90 },
      { id: "n1", label: "Node 1", kind: "database", sub: "x = 0", x: 70, y: 200 },
      { id: "n2", label: "Node 2", kind: "database", sub: "x = 0", x: 210, y: 200 },
      { id: "n3", label: "Node 3", kind: "database", sub: "x = 0", x: 350, y: 200 },
      { id: "ra", label: "Reader A", kind: "phone", sub: "reads 2", x: 105, y: 320 },
      { id: "rb", label: "Reader B", kind: "phone", sub: "reads 2", x: 315, y: 320 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "w", to: "n1", label: "x = 1" },
      { kind: "fly", at: 0.3, dur: 6.2, from: "w", to: "n2", label: "slow", tone: "warn" },
      { kind: "fly", at: 0.3, dur: 6.2, from: "w", to: "n3", label: "slow", tone: "warn" },
      { kind: "say", at: 1, actor: "n1", text: "x = 1", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.7, from: "ra", to: "n1", label: "read" },
      { kind: "fly", at: 1.5, dur: 0.7, from: "ra", to: "n2", label: "read" },
      { kind: "say", at: 2.3, actor: "ra", text: "newest: 1", tone: "good" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "rb", to: "n2", label: "read" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "rb", to: "n3", label: "read" },
      { kind: "say", at: 4, actor: "rb", text: "newest: 0", tone: "bad" },
      { kind: "mark", at: 4, actor: "rb", tone: "bad" },
      { kind: "verdict", at: 4.1, text: "A saw 1, then B saw 0", tone: "bad" },
      { kind: "say", at: 6.5, actor: "n2", text: "x = 1" },
      { kind: "say", at: 6.5, actor: "n3", text: "x = 1" },
    ],
    loop: 8.5,
  },
};
