import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.4 beat 3 (One commit, then publish).
export const sysdesignM14OutboxRelay: SceneSpec = {
  kind: "scene",
  title: "The outbox: save the event with the order, publish it later",
  purpose: "The app writes the order and an outbox row in one transaction. A relay reads unsent rows, publishes them, and marks them sent.",
  limits: "One relay and one row. A real relay reads in batches, and can read the database log instead of polling (change data capture).",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "Orders app", kind: "server", sub: "placing o-7", x: 60, y: 90 },
      { id: "relay", label: "Relay", kind: "worker", sub: "polling", x: 360, y: 90 },
      { id: "db", label: "Orders DB", kind: "database", sub: "empty", x: 60, y: 260 },
      { id: "broker", label: "Broker", kind: "queue", sub: "empty", x: 360, y: 260 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "app", to: "db", label: "order + event" },
      { kind: "say", at: 1.3, actor: "db", text: "1 commit", tone: "good" },
      { kind: "fly", at: 2, dur: 0.8, from: "relay", to: "db", label: "unsent?" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "db", to: "relay", label: "e-7" },
      { kind: "fly", at: 3.6, dur: 0.9, from: "relay", to: "broker", label: "publish e-7" },
      { kind: "say", at: 4.5, actor: "broker", text: "has e-7", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.8, from: "relay", to: "db", label: "mark sent" },
      { kind: "say", at: 5.6, actor: "db", text: "e-7 sent", tone: "good" },
      { kind: "verdict", at: 6, text: "One commit, then publish later", tone: "good" },
    ],
    loop: 9,
  },
};
