import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.3 beat 2 ("Synchronous: wait for the copy"). A synchronous follower adds its round trip to every write, and no acknowledged write is lost to one crash.
export const sysdesignM8SyncWait: SceneSpec = {
  kind: "scene",
  title: "Waiting for a far follower adds a round trip",
  purpose: "With synchronous replication the leader answers only after a follower confirms, so every write waits at least one round trip to that follower.",
  limits: "The 60 ms is the napkin-math figure for a round trip between North America East and West. A follower in the same data centre would add about 0.25 ms. Disk time on both nodes is left out.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "posts", x: 60, y: 235 },
      { id: "leader", label: "Leader", kind: "database", sub: "East coast", x: 210, y: 115 },
      { id: "follower", label: "Follower", kind: "database", sub: "West coast", x: 360, y: 115 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "client", to: "leader", label: "post" },
      { kind: "wait", at: 0.2, dur: 3.9, actor: "client", label: "waiting {n} ms", doneLabel: "waited 61 ms", total: 61 },
      { kind: "say", at: 0.9, actor: "leader", text: "saved #8", tone: "good" },
      { kind: "fly", at: 1, dur: 1.4, from: "leader", to: "follower", label: "copy #8" },
      { kind: "say", at: 2.4, actor: "follower", text: "has #8", tone: "good" },
      { kind: "fly", at: 2.5, dur: 1.4, from: "follower", to: "leader", label: "confirmed", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.5, from: "leader", to: "client", label: "ok", tone: "good" },
      { kind: "say", at: 4.4, actor: "client", text: "told: saved", tone: "good" },
      { kind: "verdict", at: 4.4, text: "Slower write, nothing lost", tone: "good" },
    ],
    loop: 7.4,
  },
};
