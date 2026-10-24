import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.3 beat 1: A balance column keeps one number and no history, so a double refund cannot be found.
export const sysdesignM25BalanceNoTrail: SceneSpec = {
  kind: "scene",
  title: "A balance column has no history",
  purpose: "A refund of 30 is sent twice by a retry. The balance column goes from 100 to 70 to 40. When the customer asks why, the database can only answer with the number 40.",
  limits: "A made-up refund of 30 on a balance of 100. Real systems often keep a balance column for speed, but only next to a history that explains it, as the next beats show.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "Refund job", kind: "server", sub: "refund 30", x: 70, y: 100 },
      { id: "bal", label: "Balance", kind: "database", sub: "balance 100", x: 350, y: 100 },
      { id: "sup", label: "Support", kind: "user", sub: "customer asks", x: 210, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "app", to: "bal", label: "minus 30" },
      { kind: "say", at: 1.2, actor: "bal", text: "balance 70", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 0.9, from: "app", to: "bal", label: "minus 30 again", tone: "bad" },
      { kind: "say", at: 2.7, actor: "bal", text: "balance 40", tone: "bad" },
      { kind: "mark", at: 2.7, actor: "bal", tone: "bad" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "sup", to: "bal", label: "why 40?" },
      { kind: "fly", at: 4.5, dur: 0.9, from: "bal", to: "sup", label: "just 40", tone: "bad" },
      { kind: "say", at: 5.4, actor: "sup", text: "no way to tell", tone: "bad" },
      { kind: "verdict", at: 5.7, text: "A balance with no history", tone: "bad" },
    ],
    loop: 9,
  },
};
