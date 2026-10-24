import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.4 beat 1. Two writes that must go together need a transaction. Without one, a crash between them leaves the data half changed.
export const sysdesignM7TxnCrash: SceneSpec = {
  kind: "scene",
  title: "A crash between two steps loses money",
  purpose: "A refund is two steps: take 40 from the venue, add 40 to Dina. The app crashes after step 1, and without a transaction nothing undoes it.",
  limits: "The amounts and names are made up. A transaction wraps both steps so they either both happen or neither does: on the crash, the database rolls step 1 back. This picture shows the problem; the fix is in the text below it.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "app", label: "Refund job", kind: "server", sub: "refund 40", x: 210, y: 100 },
      { id: "venue", label: "Venue wallet", kind: "database", sub: "balance 500", x: 80, y: 250 },
      { id: "dina", label: "Dina wallet", kind: "database", sub: "balance 0", x: 340, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "venue", label: "take 40" },
      { kind: "say", at: 1.2, actor: "venue", text: "balance 460", tone: "warn" },
      { kind: "say", at: 1.7, actor: "app", text: "crashed!", tone: "bad" },
      { kind: "mark", at: 1.7, actor: "app", tone: "bad" },
      { kind: "say", at: 2.4, actor: "dina", text: "still 0", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "dina", tone: "bad" },
      { kind: "verdict", at: 2.8, text: "40 left the venue, reached no one", tone: "bad" },
    ],
    loop: 5.6,
  },
};
