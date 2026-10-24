import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.3 beat 1 (Two groups of two always meet).
export const sysdesignM12QuorumOverlap: SceneSpec = {
  kind: "scene",
  title: "A read group and a write group of 2 out of 3 share a node",
  purpose: "A write reaches R1 and R2, a read asks R2 and R3, and the shared node R2 holds the newest value.",
  limits: "Three replicas, one write, one read. R3 is simply slower here. The reader must pick the newest version among the answers, which needs a version number or timestamp on every value.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "w", label: "Writer", kind: "phone", sub: "writes v2", x: 60, y: 100 },
      { id: "rd", label: "Reader", kind: "phone", sub: "reads", x: 360, y: 100 },
      { id: "r1", label: "R1", kind: "database", sub: "has v1", x: 60, y: 190 },
      { id: "r2", label: "R2", kind: "database", sub: "has v1", x: 210, y: 190 },
      { id: "r3", label: "R3", kind: "database", sub: "has v1", x: 360, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "w", to: "r1", label: "v2" },
      { kind: "fly", at: 0.3, dur: 1, from: "w", to: "r2", label: "v2" },
      { kind: "say", at: 1.4, actor: "r1", text: "has v2", tone: "good" },
      { kind: "say", at: 1.4, actor: "r2", text: "has v2", tone: "good" },
      { kind: "say", at: 1.7, actor: "w", text: "2 of 3 acked", tone: "good" },
      { kind: "fly", at: 2.7, dur: 1, from: "rd", to: "r2", label: "read" },
      { kind: "fly", at: 2.7, dur: 1, from: "rd", to: "r3", label: "read" },
      { kind: "fly", at: 3.8, dur: 1, from: "r2", to: "rd", label: "v2", tone: "good" },
      { kind: "fly", at: 3.8, dur: 1, from: "r3", to: "rd", label: "v1", tone: "warn" },
      { kind: "say", at: 4.9, actor: "rd", text: "v2 is newest", tone: "good" },
      { kind: "verdict", at: 5.3, text: "Read and write sets share a node", tone: "good" },
    ],
    loop: 8.6,
  },
};
