import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.5 beat 6: many chat messages while a phone is off become one alert, inside a per-user limit.
export const sysdesignM22CollapseLimit: SceneSpec = {
  kind: "scene",
  title: "Forty messages become one alert",
  purpose: "A busy group posts 40 messages in a minute while Sami's phone is off. The notifier counts them and sends one alert, \"40 new messages in Family\", so Sami's phone does not buzz 40 times and the per-user limit holds.",
  limits: "The limit of 3 alerts a minute per person is a course number. Real services also cap alerts per day and let people mute a chat. The count is kept per person and per chat, for a short time.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "group", label: "Family", kind: "note", sub: "40 messages", x: 70, y: 100 },
      { id: "note", label: "Notifier", kind: "worker", sub: "limit 3 a min", x: 350, y: 100 },
      { id: "push", label: "Push", kind: "server", sub: "alert service", x: 350, y: 235 },
      { id: "sami", label: "Sami", kind: "phone", sub: "phone is off", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "group", to: "note", label: "msg 1" },
      { kind: "fly", at: 0.5, dur: 0.7, from: "group", to: "note", label: "msg 2" },
      { kind: "fly", at: 0.8, dur: 0.7, from: "group", to: "note", label: "msg 3" },
      { kind: "say", at: 1.5, actor: "note", text: "counting: 3", tone: "accent" },
      { kind: "say", at: 2.2, actor: "note", text: "counting: 40", tone: "accent" },
      { kind: "fly", at: 2.7, dur: 0.9, from: "note", to: "push", label: "40 new in Family", tone: "good" },
      { kind: "say", at: 3.6, actor: "push", text: "1 alert sent", tone: "good" },
      { kind: "fly", at: 3.9, dur: 1.0, from: "push", to: "sami", label: "1 alert", tone: "good" },
      { kind: "say", at: 4.9, actor: "sami", text: "1 buzz", tone: "good" },
      { kind: "verdict", at: 5.0, text: "40 messages, one alert", tone: "good" },
    ],
    loop: 8,
  },
};
