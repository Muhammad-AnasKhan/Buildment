import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.5 beat 1: requests arrive every 0.5 s (2 per second) and the server
// finishes one per second, so the queue grows by about one each second.
export const sysdesignM2QueueGrows: SceneSpec = {
  kind: "scene",
  title: "More in than out: the queue never stops growing",
  purpose: "Requests arrive twice as fast as the server can finish them, so the line in front of it gets longer every second.",
  limits: "Arrivals are perfectly regular and every request takes exactly one second, to keep the counting easy. Real queues also have a limit: when it is full, new requests are dropped or time out.",
  scene: {
    width: 420,
    height: 210,
    actors: [
      { id: "clients", kind: "user", label: "Clients", sub: "2 per second", x: 60, y: 120 },
      { id: "queue", kind: "queue", label: "Queue", sub: "empty", x: 210, y: 120 },
      { id: "server", kind: "server", label: "Server", sub: "1 per second", x: 360, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "fly", at: 0.7, dur: 0.3, from: "queue", to: "server", label: "next" },
      { kind: "say", at: 1.0, actor: "server", text: "busy" },
      { kind: "fly", at: 0.8, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "say", at: 1.2, actor: "queue", text: "1 waiting" },
      { kind: "fly", at: 1.3, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "fly", at: 1.7, dur: 0.3, from: "queue", to: "server", label: "next" },
      { kind: "fly", at: 1.8, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "say", at: 2.2, actor: "queue", text: "2 waiting" },
      { kind: "fly", at: 2.3, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "fly", at: 2.7, dur: 0.3, from: "queue", to: "server", label: "next" },
      { kind: "fly", at: 2.8, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "say", at: 3.2, actor: "queue", text: "3 waiting", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "fly", at: 3.7, dur: 0.3, from: "queue", to: "server", label: "next" },
      { kind: "fly", at: 3.8, dur: 0.4, from: "clients", to: "queue", label: "req" },
      { kind: "say", at: 4.2, actor: "queue", text: "4 waiting", tone: "bad" },
      { kind: "mark", at: 4.2, actor: "queue", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "Arrivals beat service: queue grows", tone: "bad" },
    ],
    loop: 7.5,
  },
};
