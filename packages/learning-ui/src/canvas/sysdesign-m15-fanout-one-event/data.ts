import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.7 beat 1: One OrderPlaced event starts three separate jobs.
export const sysdesignM15FanoutOneEvent: SceneSpec = {
  kind: "scene",
  title: "One OrderPlaced event starts three separate jobs",
  purpose: "The order service publishes one OrderPlaced event to a topic. Email, receipts and stats each get a copy and do their own job. The order service does not wait for any of them.",
  limits: "Three subscribers. Each subscriber needs its own place to read from, which the next beats explain. Orders and subscribers are course examples.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "orders", label: "Orders", kind: "server", sub: "publishes", x: 60, y: 190 },
      { id: "topic", label: "Topic", kind: "queue", sub: "OrderPlaced", x: 200, y: 190 },
      { id: "email", label: "Email", kind: "worker", sub: "idle", x: 360, y: 100 },
      { id: "receipts", label: "Receipts", kind: "worker", sub: "idle", x: 360, y: 190 },
      { id: "stats", label: "Stats", kind: "worker", sub: "idle", x: 360, y: 280 },
    ],
    events: [
      { kind: "fly", at: 0.5, dur: 0.9, from: "orders", to: "topic", label: "OrderPlaced" },
      { kind: "say", at: 1.5, actor: "orders", text: "moved on", tone: "good" },
      { kind: "fly", at: 1.9, dur: 1.1, from: "topic", to: "email", label: "copy" },
      { kind: "fly", at: 1.9, dur: 1.1, from: "topic", to: "receipts", label: "copy" },
      { kind: "fly", at: 1.9, dur: 1.1, from: "topic", to: "stats", label: "copy" },
      { kind: "say", at: 3.2, actor: "email", text: "sends mail", tone: "good" },
      { kind: "say", at: 3.2, actor: "receipts", text: "saves receipt", tone: "good" },
      { kind: "say", at: 3.2, actor: "stats", text: "counts sale", tone: "good" },
      { kind: "verdict", at: 4.5, text: "One event, three jobs, no waiting", tone: "good" },
    ],
    loop: 7.5,
  },
};
