import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.4 beat 1 (A lease is a lock that expires).
export const sysdesignM12LeaseHandover: SceneSpec = {
  kind: "scene",
  title: "A lease runs out and the lock moves to another client",
  purpose: "Client A gets the lock with token 33 and a 10 second lease, then crashes. The lock service waits out the lease and hands the lock to B with token 34.",
  limits: "One lock service that never fails. In real systems the lock service is itself a small cluster that uses consensus (12.5 to 12.7). The token numbers 33 and 34 follow Kleppmann's example.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "lock", label: "Lock service", kind: "server", sub: "free", x: 210, y: 100 },
      { id: "a", label: "Client A", kind: "server", sub: "no lock", x: 60, y: 190 },
      { id: "b", label: "Client B", kind: "server", sub: "no lock", x: 360, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "a", to: "lock", label: "get lock" },
      { kind: "fly", at: 1.2, dur: 0.9, from: "lock", to: "a", label: "token 33, 10 s", tone: "good" },
      { kind: "say", at: 2.1, actor: "a", text: "leader, #33", tone: "good" },
      { kind: "say", at: 2.1, actor: "lock", text: "held by A", tone: "accent" },
      { kind: "say", at: 2.7, actor: "a", text: "crashed", tone: "bad" },
      { kind: "mark", at: 2.7, actor: "a", tone: "bad" },
      { kind: "wait", at: 2.9, dur: 2.4, actor: "lock", label: "lease {n} s", doneLabel: "expired", total: 10 },
      { kind: "say", at: 5.4, actor: "lock", text: "free again", tone: "accent" },
      { kind: "fly", at: 5.6, dur: 0.9, from: "b", to: "lock", label: "get lock" },
      { kind: "fly", at: 6.5, dur: 0.9, from: "lock", to: "b", label: "token 34, 10 s", tone: "good" },
      { kind: "say", at: 7.4, actor: "b", text: "leader, #34", tone: "good" },
      { kind: "verdict", at: 7.7, text: "Lease ran out: B leads with #34", tone: "good" },
    ],
    loop: 10.8,
  },
};
