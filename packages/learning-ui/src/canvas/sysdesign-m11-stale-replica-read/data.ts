import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.3 beat 2 ("A stale copy breaks it"). A read from a replica that has not got a finished write is not linearizable.
export const sysdesignM11StaleReplicaRead: SceneSpec = {
  kind: "scene",
  title: "Ada's write is done, but Ben reads 0",
  purpose: "The leader confirms Ada's write. Her copy to the replica is slow. Ben starts a read after the confirmation, the replica answers 0, and the history has no legal order.",
  limits: "One leader, one replica and a copy that takes several seconds here so you can watch it. A real replica is often well under a second behind [S38], and still long enough for this to happen.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "ada", label: "Ada", kind: "phone", sub: "writes x = 1", x: 70, y: 110 },
      { id: "leader", label: "Leader", kind: "database", sub: "x = 0", x: 350, y: 110 },
      { id: "ben", label: "Ben", kind: "phone", sub: "reads x", x: 70, y: 245 },
      { id: "replica", label: "Replica", kind: "database", sub: "x = 0", x: 350, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "ada", to: "leader", label: "write 1" },
      { kind: "say", at: 1.2, actor: "leader", text: "x = 1", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "leader", to: "ada", label: "ok" },
      { kind: "say", at: 2.2, actor: "ada", text: "done", tone: "good" },
      { kind: "fly", at: 1.4, dur: 3.2, from: "leader", to: "replica", label: "copy (slow)", tone: "warn" },
      { kind: "fly", at: 2.5, dur: 0.8, from: "ben", to: "replica", label: "read" },
      { kind: "mark", at: 3.3, actor: "replica", tone: "bad" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "replica", to: "ben", label: "0", tone: "bad" },
      { kind: "say", at: 4.1, actor: "ben", text: "sees 0", tone: "bad" },
      { kind: "say", at: 4.6, actor: "replica", text: "x = 1", tone: "good" },
      { kind: "verdict", at: 4.2, text: "Ada finished, Ben still read 0", tone: "bad" },
    ],
    loop: 7.6,
  },
};
