import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.5 beat 7: After three failures the message goes to a dead letter queue.
export const sysdesignM15DlqParks: SceneSpec = {
  kind: "scene",
  title: "After three failures the message goes to a dead letter queue",
  purpose: "The consumer fails on m2 three times. It then moves m2, with the reason, into a dead letter queue, and goes on to m3.",
  limits: "Three tries is a course number. SQS calls the limit maxReceiveCount; with Valkey streams you count deliveries yourself, as in the challenge.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "line", label: "Partition", kind: "queue", sub: "m2 m3 m4", x: 60, y: 110 },
      { id: "cons", label: "Consumer", kind: "worker", sub: "idle", x: 210, y: 110 },
      { id: "dlq", label: "Dead queue", kind: "queue", sub: "empty", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "line", to: "cons", label: "m2" },
      { kind: "say", at: 1.1, actor: "cons", text: "try 1 fails", tone: "bad" },
      { kind: "say", at: 1.8, actor: "cons", text: "try 2 fails", tone: "bad" },
      { kind: "say", at: 2.5, actor: "cons", text: "try 3 fails", tone: "bad" },
      { kind: "fly", at: 3, dur: 0.9, from: "cons", to: "dlq", label: "m2 + reason", tone: "warn" },
      { kind: "say", at: 4, actor: "dlq", text: "1 parked", tone: "warn" },
      { kind: "fly", at: 4.3, dur: 0.7, from: "line", to: "cons", label: "m3" },
      { kind: "say", at: 5.1, actor: "cons", text: "m3 ok", tone: "good" },
      { kind: "verdict", at: 5.5, text: "Bad message parked, line moves on", tone: "good" },
    ],
    loop: 8.5,
  },
};
