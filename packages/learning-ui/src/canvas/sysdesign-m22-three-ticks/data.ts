import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.4 beat 4: sent, delivered and read are three separate facts, each reported by a different step.
export const sysdesignM22ThreeTicks: SceneSpec = {
  kind: "scene",
  title: "Sent, delivered and read are three facts",
  purpose: "The server tells Layla it saved the message (one tick). Sami's phone tells the server it received it (two ticks). Later Sami's phone tells the server she opened the chat (blue ticks).",
  limits: "Each receipt is itself a small message that must travel back to Layla, so receipts add traffic. Many apps let people turn off read receipts, and group chats count receipts per member.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "sends", x: 70, y: 100 },
      { id: "chat", label: "Chat", kind: "server", sub: "keeps the facts", x: 350, y: 100 },
      { id: "sami", label: "Sami", kind: "phone", sub: "phone is on", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "layla", to: "chat", label: "hi" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "chat", to: "layla", label: "saved", tone: "good" },
      { kind: "say", at: 1.6, actor: "layla", text: "one tick", tone: "good" },
      { kind: "fly", at: 1.8, dur: 0.7, from: "chat", to: "sami", label: "hi" },
      { kind: "say", at: 2.5, actor: "sami", text: "phone has it", tone: "good" },
      { kind: "fly", at: 2.6, dur: 0.7, from: "sami", to: "chat", label: "received", tone: "good" },
      { kind: "fly", at: 3.3, dur: 0.7, from: "chat", to: "layla", label: "delivered", tone: "good" },
      { kind: "say", at: 4.0, actor: "layla", text: "two ticks", tone: "good" },
      { kind: "say", at: 4.4, actor: "sami", text: "opens the chat", tone: "accent" },
      { kind: "fly", at: 4.5, dur: 0.7, from: "sami", to: "chat", label: "read", tone: "accent" },
      { kind: "fly", at: 5.2, dur: 0.7, from: "chat", to: "layla", label: "read", tone: "accent" },
      { kind: "say", at: 5.9, actor: "layla", text: "blue ticks", tone: "accent" },
      { kind: "verdict", at: 6.0, text: "Each tick is a separate fact", tone: "good" },
    ],
    loop: 9,
  },
};
