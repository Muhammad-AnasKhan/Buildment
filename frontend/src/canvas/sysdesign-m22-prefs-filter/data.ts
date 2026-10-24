import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.5 beat 2: the notifier reads the person's choices before it picks any channel.
export const sysdesignM22PrefsFilter: SceneSpec = {
  kind: "scene",
  title: "Read the person's choices before sending",
  purpose: "Sami wrote to Layla while Layla's phone was off. The notifier asks the preferences store what Layla chose for new messages. She chose push only, so no email and no SMS go out.",
  limits: "One user and one kind of notification are drawn. A real preference record has a switch for each kind (message, order update, security code) and each channel, plus quiet hours.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "chat", label: "Chat", kind: "server", sub: "Sami wrote", x: 70, y: 100 },
      { id: "note", label: "Notifier", kind: "worker", sub: "picks channels", x: 350, y: 100 },
      { id: "prefs", label: "Preferences", kind: "database", sub: "Layla's choices", x: 350, y: 235 },
      { id: "push", label: "Push", kind: "server", sub: "alert service", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "chat", to: "note", label: "Layla is offline" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "note", to: "prefs", label: "her choices?" },
      { kind: "say", at: 2.0, actor: "prefs", text: "push only", tone: "accent" },
      { kind: "fly", at: 2.1, dur: 0.8, from: "prefs", to: "note", label: "push only" },
      { kind: "say", at: 2.9, actor: "note", text: "email, SMS: off", tone: "warn" },
      { kind: "fly", at: 3.2, dur: 1.0, from: "note", to: "push", label: "send push", tone: "good" },
      { kind: "say", at: 4.2, actor: "push", text: "1 push sent", tone: "good" },
      { kind: "verdict", at: 4.3, text: "Only the channels she chose", tone: "good" },
    ],
    loop: 7.4,
  },
};
