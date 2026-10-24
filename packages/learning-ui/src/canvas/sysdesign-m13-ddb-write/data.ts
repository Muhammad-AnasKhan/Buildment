import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.4 beat 2: In DynamoDB the partition's leader takes the write.
export const sysdesignM13DdbWrite: SceneSpec = {
  kind: "scene",
  title: "In DynamoDB the partition's leader takes the write",
  purpose: "The write goes to the partition's leader. The leader sends a log record to its two replicas and answers OK when a quorum, itself plus one replica, has stored it.",
  limits: "One partition with three copies. The real service also has request routers, an authentication step and many partitions, and the leader changes through an election when it fails (S44).",
  scene: {
    width: 420,
    height: 335,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "put item", x: 210, y: 100 },
      { id: "leader", label: "Leader", kind: "database", sub: "partition", x: 210, y: 195 },
      { id: "r1", label: "Replica 1", kind: "database", sub: "log: 41", x: 60, y: 285 },
      { id: "r2", label: "Replica 2", kind: "database", sub: "log: 41", x: 360, y: 285 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 1, from: "client", to: "leader", label: "put item" },
      { kind: "say", at: 1.4, actor: "leader", text: "log: 42", tone: "accent" },
      { kind: "fly", at: 1.5, dur: 1, from: "leader", to: "r1", label: "log 42" },
      { kind: "fly", at: 1.5, dur: 2.3, from: "leader", to: "r2", label: "log 42" },
      { kind: "say", at: 2.5, actor: "r1", text: "log: 42", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.8, from: "r1", to: "leader", label: "ack", tone: "good" },
      { kind: "say", at: 3.3, actor: "leader", text: "quorum: 2 of 3", tone: "good" },
      { kind: "fly", at: 3.4, dur: 1, from: "leader", to: "client", label: "OK", tone: "good" },
      { kind: "say", at: 3.8, actor: "r2", text: "log: 42", tone: "good" },
      { kind: "verdict", at: 4.5, text: "OK once a quorum has the log record", tone: "good" },
    ],
    loop: 7.5,
  },
};
