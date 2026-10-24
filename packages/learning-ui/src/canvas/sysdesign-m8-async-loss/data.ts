import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.3 beat 1 ("Asynchronous: OK before the copy"). Asynchronous replication can lose acknowledged writes when the leader fails.
export const sysdesignM8AsyncLoss: SceneSpec = {
  kind: "scene",
  title: "The leader says OK, then crashes before copying",
  purpose: "With asynchronous replication the client hears OK as soon as the leader has saved. If the leader dies before the copy is sent, the write is gone.",
  limits: "One write and one follower are drawn. In practice a crash loses only the writes that were not yet copied, which is the replication lag times the write rate.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "client", label: "Nour", kind: "phone", sub: "orders", x: 60, y: 150 },
      { id: "leader", label: "Leader", kind: "database", sub: "up to #7", x: 210, y: 150 },
      { id: "follower", label: "Follower", kind: "database", sub: "up to #7", x: 360, y: 150 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "client", to: "leader", label: "order #8" },
      { kind: "say", at: 0.9, actor: "leader", text: "saved #8", tone: "good" },
      { kind: "fly", at: 1, dur: 0.7, from: "leader", to: "client", label: "ok", tone: "good" },
      { kind: "say", at: 1.7, actor: "client", text: "told: saved", tone: "good" },
      { kind: "say", at: 2, actor: "leader", text: "CRASH", tone: "bad" },
      { kind: "mark", at: 2, actor: "leader", tone: "bad" },
      { kind: "say", at: 2.6, actor: "follower", text: "promoted", tone: "warn" },
      { kind: "fly", at: 3, dur: 0.9, from: "client", to: "follower", label: "show #8?" },
      { kind: "say", at: 3.9, actor: "client", text: "#8 is gone", tone: "bad" },
      { kind: "verdict", at: 3.9, text: "Told OK, but order #8 is gone", tone: "bad" },
    ],
    loop: 7,
  },
};
