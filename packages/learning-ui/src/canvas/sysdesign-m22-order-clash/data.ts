import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.4 beat 1: two people write at the same moment; two phones show two different orders.
export const sysdesignM22OrderClash: SceneSpec = {
  kind: "scene",
  title: "Two senders, and two phones show two orders",
  purpose: "Dana and Omar write to the same chat at almost the same moment. Layla's copy of Dana's message is quick and Sami's is slow, so Layla sees Dana first and Sami sees Omar first.",
  limits: "Names and delays are made up. The phones here put messages in the order they arrive. The next picture gives every message a number so arrival order stops mattering.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "dana", label: "Dana", kind: "phone", sub: "writes: yes", x: 70, y: 95 },
      { id: "omar", label: "Omar", kind: "phone", sub: "writes: no", x: 350, y: 95 },
      { id: "chat", label: "Chat", kind: "server", sub: "passes on", x: 210, y: 175 },
      { id: "layla", label: "Layla", kind: "phone", sub: "shows nothing", x: 70, y: 265 },
      { id: "sami", label: "Sami", kind: "phone", sub: "shows nothing", x: 350, y: 265 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "dana", to: "chat", label: "yes" },
      { kind: "fly", at: 0.5, dur: 0.8, from: "omar", to: "chat", label: "no" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "chat", to: "layla", label: "yes" },
      { kind: "fly", at: 1.6, dur: 2.0, from: "chat", to: "sami", label: "yes" },
      { kind: "fly", at: 1.9, dur: 0.7, from: "chat", to: "layla", label: "no" },
      { kind: "fly", at: 1.9, dur: 0.7, from: "chat", to: "sami", label: "no" },
      { kind: "say", at: 2.6, actor: "layla", text: "yes, then no", tone: "accent" },
      { kind: "say", at: 2.6, actor: "sami", text: "no", tone: "accent" },
      { kind: "say", at: 3.6, actor: "sami", text: "no, then yes", tone: "bad" },
      { kind: "mark", at: 3.6, actor: "sami", tone: "bad" },
      { kind: "verdict", at: 3.7, text: "Two phones, two different orders", tone: "bad" },
    ],
    loop: 7,
  },
};
