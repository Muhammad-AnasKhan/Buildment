import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 11.2 beat 3: a call Manar (fictional) leads, because
// the facts and the taste that decide it are hers.
export const whoLeadsThisCallLayouts: SceneSpec = {
  kind: "scene",
  title: "Three layouts that all work",
  purpose: "An AI assistant drafts three menu layouts and prefers one; Manar adds what she knows about the café's customers and picks another.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits: "A fictional freelancer and café. Once Manar tells the assistant about the phones, it can redraw layout B lighter, and she still decides. The picture shows who holds the facts, not a rule against asking the AI again.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "manar", label: "Manar", kind: "user", sub: "freelancer", x: 60, y: 110 },
      { id: "ai", label: "AI assistant", kind: "server", sub: "3 layouts", x: 360, y: 110 },
      { id: "facts", label: "Café facts", kind: "note", sub: "weak phones", x: 60, y: 228 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 1, from: "manar", to: "ai", label: "3 layouts?" },
      { kind: "fly", at: 1.2, dur: 1, from: "ai", to: "manar", label: "A, B, C" },
      { kind: "say", at: 2.2, actor: "ai", text: "all 3 work", tone: "good" },
      { kind: "say", at: 2.8, actor: "ai", text: "likes B", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 1, from: "facts", to: "manar", label: "old phones" },
      { kind: "say", at: 4.8, actor: "manar", text: "picks A, light", tone: "good" },
      { kind: "mark", at: 4.8, actor: "manar", tone: "good" },
      { kind: "verdict", at: 5.6, text: "Her facts and taste: her call", tone: "good" },
    ],
    loop: 8.5,
  },
};
