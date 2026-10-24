import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.2 beat 1 ("A write is saved once, then copied"). In single-leader replication every write goes to one node; the followers receive a copy afterwards.
export const sysdesignM8WritePath: SceneSpec = {
  kind: "scene",
  title: "The leader confirms, then copies to followers",
  purpose: "A write goes to the leader only. The leader saves it and confirms to the client. The followers get their copies a little later.",
  limits: "Asynchronous copying, as in PostgreSQL's default (8.3 compares the alternative). Two followers are drawn, and the copy delays are made up so the order is easy to see.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "client", label: "Amna", kind: "phone", sub: "posts", x: 60, y: 160 },
      { id: "leader", label: "Leader", kind: "database", sub: "log: 6", x: 210, y: 160 },
      { id: "f1", label: "Follower 1", kind: "database", sub: "log: 6", x: 360, y: 90 },
      { id: "f2", label: "Follower 2", kind: "database", sub: "log: 6", x: 360, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "client", to: "leader", label: "post" },
      { kind: "say", at: 0.9, actor: "leader", text: "saved #7", tone: "good" },
      { kind: "fly", at: 1, dur: 0.7, from: "leader", to: "client", label: "ok", tone: "good" },
      { kind: "say", at: 1.7, actor: "client", text: "told: saved", tone: "good" },
      { kind: "fly", at: 1.9, dur: 0.9, from: "leader", to: "f1", label: "copy #7" },
      { kind: "fly", at: 2, dur: 1.6, from: "leader", to: "f2", label: "copy #7" },
      { kind: "say", at: 2.8, actor: "f1", text: "log: 7", tone: "good" },
      { kind: "say", at: 3.6, actor: "f2", text: "log: 7", tone: "good" },
      { kind: "verdict", at: 3.7, text: "Client heard OK before copies landed", tone: "accent" },
    ],
    loop: 7,
  },
};
