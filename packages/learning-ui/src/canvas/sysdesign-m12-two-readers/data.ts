import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.3 beat 4 (A half-finished write).
export const sysdesignM12TwoReaders: SceneSpec = {
  kind: "scene",
  title: "A write that reached one node gives two readers two answers",
  purpose: "The writer crashes after v2 reaches only R1. Reader A asks R1 and R2 and sees v2. Reader B asks R2 and R3 and sees v1.",
  limits: "The write reached 1 of 3 nodes, so it never met the write quorum of 2. Real systems fix this with read repair or by running the write through consensus (module 12.5 and 13).",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "w", label: "Writer", kind: "phone", sub: "writes v2", x: 210, y: 100 },
      { id: "r1", label: "R1", kind: "database", sub: "has v1", x: 60, y: 175 },
      { id: "r2", label: "R2", kind: "database", sub: "has v1", x: 210, y: 175 },
      { id: "r3", label: "R3", kind: "database", sub: "has v1", x: 360, y: 175 },
      { id: "a", label: "Reader A", kind: "phone", sub: "reads 2 nodes", x: 135, y: 250 },
      { id: "b", label: "Reader B", kind: "phone", sub: "reads 2 nodes", x: 285, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "w", to: "r1", label: "v2" },
      { kind: "say", at: 1.4, actor: "r1", text: "has v2", tone: "good" },
      { kind: "say", at: 1.4, actor: "w", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1.4, actor: "w", tone: "bad" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "a", to: "r1", label: "read" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "a", to: "r2", label: "read" },
      { kind: "fly", at: 3.4, dur: 0.9, from: "r1", to: "a", label: "v2", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.9, from: "r2", to: "a", label: "v1", tone: "warn" },
      { kind: "say", at: 4.3, actor: "a", text: "sees v2", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.9, from: "b", to: "r2", label: "read" },
      { kind: "fly", at: 4.8, dur: 0.9, from: "b", to: "r3", label: "read" },
      { kind: "fly", at: 5.8, dur: 0.9, from: "r2", to: "b", label: "v1", tone: "warn" },
      { kind: "fly", at: 5.8, dur: 0.9, from: "r3", to: "b", label: "v1", tone: "warn" },
      { kind: "say", at: 6.7, actor: "b", text: "sees v1", tone: "warn" },
      { kind: "verdict", at: 7.1, text: "Two readers, two answers", tone: "bad" },
    ],
    loop: 10.2,
  },
};
