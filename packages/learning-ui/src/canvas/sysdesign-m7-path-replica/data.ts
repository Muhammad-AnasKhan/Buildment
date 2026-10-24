import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.6 beat 4. Read replicas multiply read capacity, but every replica is a little behind, so some reads must go to the primary.
export const sysdesignM7PathReplica: SceneSpec = {
  kind: "scene",
  title: "Step 3: replicas take reads, and run behind",
  purpose: "Writes go to the primary. A copy is sent to the replica, which serves reads. A read that arrives before the copy sees old data.",
  limits: "Lag is usually well under a second in PostgreSQL if the replica keeps up, and much less on Aurora, but it is never zero (chapter 8.4). Replicas add read capacity, not write capacity.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "write then read", x: 210, y: 100 },
      { id: "primary", label: "Primary", kind: "database", sub: "all writes", x: 80, y: 250 },
      { id: "replica", label: "Replica", kind: "database", sub: "reads only", x: 340, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "primary", label: "write: sold" },
      { kind: "say", at: 1.1, actor: "primary", text: "seat: sold", tone: "good" },
      { kind: "fly", at: 1.4, dur: 1.8, from: "primary", to: "replica", label: "copy" },
      { kind: "fly", at: 1.8, dur: 0.7, from: "app", to: "replica", label: "read seat" },
      { kind: "fly", at: 2.6, dur: 0.7, from: "replica", to: "app", label: "seat: free", tone: "bad" },
      { kind: "say", at: 3.3, actor: "app", text: "sees old data", tone: "bad" },
      { kind: "say", at: 3.3, actor: "replica", text: "seat: sold", tone: "good" },
      { kind: "verdict", at: 3.7, text: "Reads scale; replicas run behind", tone: "warn" },
    ],
    loop: 6.5,
  },
};
