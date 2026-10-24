import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.4 beat 1 (Save, then tell).
export const sysdesignM14DualWrite: SceneSpec = {
  kind: "scene",
  title: "A dual write: the order is saved, the event never leaves",
  purpose: "The app saves the order, then crashes before it publishes the event. The database has the order and the broker has nothing.",
  limits: "The reverse order (publish, then save) fails the other way: an event for an order that does not exist. Neither order is safe.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "app", label: "Orders app", kind: "server", sub: "placing o-7", x: 210, y: 90 },
      { id: "db", label: "Orders DB", kind: "database", sub: "empty", x: 60, y: 260 },
      { id: "broker", label: "Broker", kind: "queue", sub: "empty", x: 360, y: 260 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "app", to: "db", label: "save o-7" },
      { kind: "say", at: 1.3, actor: "db", text: "o-7 saved", tone: "good" },
      { kind: "say", at: 2, actor: "app", text: "crashed", tone: "bad" },
      { kind: "mark", at: 2, actor: "app", tone: "bad" },
      { kind: "say", at: 2.8, actor: "broker", text: "nothing sent", tone: "warn" },
      { kind: "verdict", at: 3.6, text: "Order saved, event never sent", tone: "bad" },
    ],
    loop: 6.5,
  },
};
