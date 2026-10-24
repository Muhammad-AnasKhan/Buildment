import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.4 beat 5: an offline phone comes back, says the last number it holds, and gets only what it missed.
export const sysdesignM22OfflineSync: SceneSpec = {
  kind: "scene",
  title: "A phone that was off asks from its last number",
  purpose: "Sami's phone was off while messages 4, 5 and 6 arrived. The chat service kept them and sent a push alert. When the phone is back it says \"I have up to 3\" and receives only 4, 5 and 6.",
  limits: "One conversation is drawn. A real phone keeps one last number per conversation, or one cursor for the whole account, and asks for pages of messages until it has caught up.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "chat", label: "Chat", kind: "server", sub: "has up to 6", x: 70, y: 100 },
      { id: "push", label: "Push", kind: "server", sub: "alert service", x: 350, y: 100 },
      { id: "sami", label: "Sami", kind: "phone", sub: "off: has 3", x: 70, y: 235 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "chat", text: "saves 4 to 6", tone: "accent" },
      { kind: "fly", at: 0.6, dur: 0.9, from: "chat", to: "push", label: "new message" },
      { kind: "say", at: 1.5, actor: "push", text: "holds the alert", tone: "warn" },
      { kind: "say", at: 2.1, actor: "sami", text: "phone back on", tone: "good" },
      { kind: "fly", at: 2.3, dur: 0.9, from: "push", to: "sami", label: "new message" },
      { kind: "fly", at: 3.4, dur: 0.8, from: "sami", to: "chat", label: "I have up to 3" },
      { kind: "fly", at: 4.3, dur: 0.8, from: "chat", to: "sami", label: "4, 5, 6", tone: "good" },
      { kind: "say", at: 5.1, actor: "sami", text: "has up to 6", tone: "good" },
      { kind: "fly", at: 5.4, dur: 0.8, from: "sami", to: "chat", label: "got up to 6" },
      { kind: "say", at: 6.2, actor: "chat", text: "6 delivered", tone: "good" },
      { kind: "verdict", at: 6.3, text: "Catch up from the last number held", tone: "good" },
    ],
    loop: 9.3,
  },
};
