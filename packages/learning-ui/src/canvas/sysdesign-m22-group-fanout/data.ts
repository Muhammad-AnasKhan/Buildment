import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.2 beat 5: one group message is one write and many deliveries, grouped by gateway.
export const sysdesignM22GroupFanout: SceneSpec = {
  kind: "scene",
  title: "One group message: one write, a few batches",
  purpose: "A group of 500 people has one message. The chat service saves it once, then sends one batch to each gateway that holds some of the 499 other members.",
  limits: "Only 2 of about 60 gateways are drawn, with made-up member counts. The service looks up each member's gateway in the registry before it batches. Offline members get the message when they reconnect.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "posts to Family", x: 70, y: 100 },
      { id: "chat", label: "Chat", kind: "server", sub: "group of 500", x: 350, y: 100 },
      { id: "gw1", label: "Gateway 1", kind: "router", sub: "9 members here", x: 70, y: 245 },
      { id: "gw2", label: "Gateway 2", kind: "router", sub: "8 members here", x: 350, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "layla", to: "chat", label: "to Family" },
      { kind: "say", at: 1.1, actor: "chat", text: "saves it once", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 0.9, from: "chat", to: "gw1", label: "batch of 9" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "chat", to: "gw2", label: "batch of 8" },
      { kind: "say", at: 2.9, actor: "gw1", text: "writes to 9", tone: "good" },
      { kind: "say", at: 3.0, actor: "gw2", text: "writes to 8", tone: "good" },
      { kind: "say", at: 3.4, actor: "chat", text: "+58 batches", tone: "accent" },
      { kind: "verdict", at: 3.5, text: "1 write, about 60 batches, 499 sends", tone: "good" },
    ],
    loop: 7,
  },
};
