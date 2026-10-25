import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.5 beat 3 (Write the id with the work).
export const sysdesignM14DedupeTxn: SceneSpec = {
  kind: "scene",
  title: "Save the message id in the same transaction as the work",
  purpose: "The consumer writes the id and the effect in one transaction. When the copy arrives, the id is already there and the work is skipped.",
  limits: "The id and the effect must be in the same database. If the effect is a call to another system, an idempotency key at that system does the same job (chapter 6.4).",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "broker", label: "Broker", kind: "queue", sub: "m-7 twice", x: 60, y: 90 },
      { id: "cons", label: "Consumer", kind: "worker", sub: "listening", x: 360, y: 90 },
      { id: "db", label: "Database", kind: "database", sub: "ids: none", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "broker", to: "cons", label: "m-7" },
      { kind: "fly", at: 1.2, dur: 0.9, from: "cons", to: "db", label: "m-7 + add 18" },
      { kind: "say", at: 2.1, actor: "db", text: "balance 18", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "broker", to: "cons", label: "m-7 copy" },
      { kind: "fly", at: 3.7, dur: 0.9, from: "cons", to: "db", label: "m-7 + add 18" },
      { kind: "say", at: 4.6, actor: "db", text: "m-7 seen: skip", tone: "good" },
      { kind: "verdict", at: 5, text: "Second m-7 skipped, one effect", tone: "good" },
    ],
    loop: 7.5,
  },
};
