import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.2 beat 2: the sender sees "sent" only after the message is numbered and saved.
export const sysdesignM22SendPath: SceneSpec = {
  kind: "scene",
  title: "Sent means saved, not delivered",
  purpose: "Layla's message goes through her gateway to the chat service, which gives it a number and saves it. Only then does Layla see one tick.",
  limits: "One chat service and one store are drawn. The real ones are many copies, and the store keeps three copies of every conversation. Delivery to the other phone is the next picture.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "waits for ok", x: 70, y: 100 },
      { id: "gw", label: "Gateway 1", kind: "router", sub: "holds her line", x: 350, y: 100 },
      { id: "chat", label: "Chat", kind: "server", sub: "numbers it", x: 350, y: 235 },
      { id: "store", label: "Store", kind: "database", sub: "not saved yet", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "layla", to: "gw", label: "hi, id 7f3" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "gw", to: "chat", label: "hi" },
      { kind: "say", at: 2.0, actor: "chat", text: "gives it no. 41", tone: "accent" },
      { kind: "fly", at: 2.3, dur: 0.9, from: "chat", to: "store", label: "save no. 41" },
      { kind: "say", at: 3.2, actor: "store", text: "saved no. 41", tone: "good" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "store", to: "chat", label: "saved" },
      { kind: "fly", at: 4.5, dur: 0.8, from: "chat", to: "gw", label: "ok no. 41" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "gw", to: "layla", label: "sent", tone: "good" },
      { kind: "say", at: 6.2, actor: "layla", text: "one tick", tone: "good" },
      { kind: "verdict", at: 6.3, text: "Sent means saved, not delivered", tone: "good" },
    ],
    loop: 9.3,
  },
};
