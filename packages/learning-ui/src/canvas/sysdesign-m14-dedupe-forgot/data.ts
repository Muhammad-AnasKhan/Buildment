import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.5 beat 5 (How long to remember).
export const sysdesignM14DedupeForgot: SceneSpec = {
  kind: "scene",
  title: "A dedupe table forgets: a late copy is applied again",
  purpose: "The table keeps each id for 24 hours. A copy arrives 30 hours after the first delivery, the id is gone, and the work is done twice.",
  limits: "The 24 hours and the 30 hour copy are course numbers. Stripe keeps idempotency keys for at least 24 hours; SQS FIFO deduplicates within 5 minutes.",
  scene: {
    width: 420,
    height: 360,
    actors: [
      { id: "broker", label: "Broker", kind: "queue", sub: "holds a copy", x: 60, y: 90 },
      { id: "cons", label: "Consumer", kind: "worker", sub: "listening", x: 360, y: 90 },
      { id: "table", label: "Dedupe table", kind: "database", sub: "keeps 24 h", x: 210, y: 190 },
    ],
    strip: { y: 320, from: 0, to: 48, unit: "h", caption: "hours since m-7 first arrived", every: 12 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 0, label: "m-7 saved", tone: "good" },
      { kind: "say", at: 0.4, actor: "table", text: "holds m-7", tone: "good" },
      { kind: "tag", at: 1.6, row: 0, value: 24, label: "id forgotten", tone: "warn" },
      { kind: "say", at: 1.7, actor: "table", text: "m-7 gone", tone: "warn" },
      { kind: "tag", at: 2.8, row: 1, value: 30, label: "copy arrives", tone: "bad" },
      { kind: "fly", at: 3, dur: 0.8, from: "broker", to: "cons", label: "m-7 copy" },
      { kind: "fly", at: 3.9, dur: 0.8, from: "cons", to: "table", label: "seen m-7?" },
      { kind: "say", at: 4.7, actor: "table", text: "no: unknown", tone: "bad" },
      { kind: "say", at: 4.9, actor: "cons", text: "applies again", tone: "bad" },
      { kind: "verdict", at: 5.4, text: "Id forgotten at 24 h: applied twice", tone: "bad" },
    ],
    loop: 8.8,
  },
};
