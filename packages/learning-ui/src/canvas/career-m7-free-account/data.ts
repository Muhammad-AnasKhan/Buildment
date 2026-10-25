import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.4 beat 3: a free account messages connections only and has a few personalised notes a month. Card register; checked 2026-10.
export const careerM7FreeAccount: SceneSpec = {
  kind: "scene",
  title: "Free accounts: connections and few notes",
  purpose: "On a free account you can message your connections. For people you are not connected to you have a few personalised notes a month. Plan for three and count them.",
  limits: "Checked 2026-10; if your screen differs, follow your screen. LinkedIn's pages disagree on whether the allowance is three or five a month; the course plans for three. Limits change, and the mobile app path cannot add a note.",
  hint: "Who you can message, and what a note costs.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "you", label: "You", kind: "user", sub: "free account", x: 62, y: 105 },
      { id: "connections", label: "Connections", kind: "user", sub: "can message", x: 358, y: 105 },
      { id: "stranger", label: "Not connected", kind: "user", sub: "note or comment", x: 62, y: 250 },
      { id: "notes", label: "Monthly notes", kind: "note", sub: "plan for three", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "you", to: "connections", label: "message" },
      { kind: "say", at: 1.4, actor: "connections", text: "free to send", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1, from: "you", to: "stranger", label: "needs a note" },
      { kind: "say", at: 3.5, actor: "notes", text: "count them", tone: "warn" },
      { kind: "verdict", at: 4.2, text: "Free: connections and a few notes", tone: "accent" },
    ],
    loop: 8,
  },
};
