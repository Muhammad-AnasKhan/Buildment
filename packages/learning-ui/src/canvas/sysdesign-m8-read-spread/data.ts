import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.2 beat 3 ("Reads can go to any copy"). Followers add read capacity. They do not add write capacity.
export const sysdesignM8ReadSpread: SceneSpec = {
  kind: "scene",
  title: "Reads spread over copies, writes use one node",
  purpose: "Reads can be answered by any follower, so the leader keeps its time for writes. Every write still goes to the leader.",
  limits: "One write and two reads per round are drawn. It ignores the work followers do to apply writes (the diagram in the same chapter counts it) and the lag between copies.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "sends requests", x: 60, y: 170 },
      { id: "leader", label: "Leader", kind: "database", sub: "idle", x: 360, y: 90 },
      { id: "f1", label: "Follower 1", kind: "database", sub: "idle", x: 360, y: 170 },
      { id: "f2", label: "Follower 2", kind: "database", sub: "idle", x: 360, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "leader", label: "write" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "f1", label: "read" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "f2", label: "read" },
      { kind: "say", at: 1.1, actor: "leader", text: "1 write", tone: "good" },
      { kind: "say", at: 1.1, actor: "f1", text: "1 read", tone: "good" },
      { kind: "say", at: 1.1, actor: "f2", text: "1 read", tone: "good" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "app", to: "leader", label: "write" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "app", to: "f1", label: "read" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "app", to: "f2", label: "read" },
      { kind: "say", at: 2.7, actor: "leader", text: "2 writes", tone: "good" },
      { kind: "say", at: 2.7, actor: "f1", text: "2 reads", tone: "good" },
      { kind: "say", at: 2.7, actor: "f2", text: "2 reads", tone: "good" },
      { kind: "verdict", at: 3, text: "Reads spread; writes use one node", tone: "good" },
    ],
    loop: 6.2,
  },
};
