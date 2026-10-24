import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.1 beat 1: one message, from Layla's phone to Sami's phone, with its two ticks.
export const sysdesignM22SendAMessage: SceneSpec = {
  kind: "scene",
  title: "One message, two ticks",
  purpose: "Layla sends a message. Dardasha saves it and tells her it was sent (one tick). Then it reaches Sami's phone and tells her it arrived (two ticks).",
  limits: "Dardasha, Layla and Sami are made up. Sami's phone is on and connected here. The next chapters ask what changes when it is not, and when millions of people do this at once.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "types a message", x: 70, y: 100 },
      { id: "chat", label: "Dardasha", kind: "server", sub: "chat service", x: 350, y: 100 },
      { id: "sami", label: "Sami", kind: "phone", sub: "phone is on", x: 350, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "layla", to: "chat", label: "are you ok?" },
      { kind: "say", at: 1.1, actor: "chat", text: "saved it", tone: "accent" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "chat", to: "layla", label: "sent", tone: "good" },
      { kind: "say", at: 2.2, actor: "layla", text: "one tick", tone: "good" },
      { kind: "fly", at: 2.5, dur: 0.8, from: "chat", to: "sami", label: "are you ok?" },
      { kind: "say", at: 3.3, actor: "sami", text: "gets it", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "sami", to: "chat", label: "got it" },
      { kind: "fly", at: 4.5, dur: 0.8, from: "chat", to: "layla", label: "delivered", tone: "good" },
      { kind: "say", at: 5.3, actor: "layla", text: "two ticks", tone: "good" },
      { kind: "verdict", at: 5.4, text: "Sent, then delivered: two ticks", tone: "good" },
    ],
    loop: 8.2,
  },
};
