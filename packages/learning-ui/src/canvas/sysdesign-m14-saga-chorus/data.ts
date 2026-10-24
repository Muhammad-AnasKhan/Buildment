import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.3 beat 4 (No conductor).
export const sysdesignM14SagaChorus: SceneSpec = {
  kind: "scene",
  title: "Choreography: each service reacts to the last event",
  purpose: "Services talk through an event bus. Each one hears an event, does its step, and publishes the next event. Nobody holds the whole plan.",
  limits: "The bus is drawn as perfect. Real buses deliver at least once, so each service must also handle a repeated event (chapter 14.5).",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "bus", label: "Event bus", kind: "queue", sub: "events", x: 210, y: 100 },
      { id: "stock", label: "Stock", kind: "database", sub: "starts", x: 60, y: 230 },
      { id: "pay", label: "Payments", kind: "server", sub: "listening", x: 210, y: 230 },
      { id: "courier", label: "Courier", kind: "server", sub: "listening", x: 360, y: 230 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "stock", text: "reserved", tone: "good" },
      { kind: "fly", at: 0.6, dur: 0.7, from: "stock", to: "bus", label: "reserved" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "bus", to: "pay", label: "reserved" },
      { kind: "say", at: 2.1, actor: "pay", text: "charged", tone: "good" },
      { kind: "fly", at: 2.4, dur: 0.7, from: "pay", to: "bus", label: "charged" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "bus", to: "courier", label: "charged" },
      { kind: "say", at: 3.9, actor: "courier", text: "booked", tone: "good" },
      { kind: "verdict", at: 4.7, text: "No boss: each service reacts", tone: "good" },
    ],
    loop: 7.5,
  },
};
