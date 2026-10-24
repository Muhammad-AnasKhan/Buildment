import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.4 beat 4 ("The reply carries its question"). A reply that names its question lets the reader wait for the question before showing the reply.
export const sysdesignM11ReplyWaits: SceneSpec = {
  kind: "scene",
  title: "The reply names its question, so the reader waits",
  purpose: "The reply says it comes after question 1. The reader sees that, asks for question 1, waits until the copy has it, and only then shows both.",
  limits: "The reader waits about 120 ms here. In a real system the reader may instead read the leader, or the shard that holds the question may be the same one as the reply.",
  scene: {
    width: 420,
    height: 410,
    actors: [
      { id: "qc", label: "Questions", kind: "database", sub: "no question", x: 70, y: 105 },
      { id: "rc", label: "Replies", kind: "database", sub: "reply, after 1", x: 350, y: 105 },
      { id: "reader", label: "Reader", kind: "user", sub: "opens thread", x: 210, y: 270 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "reader", to: "rc", label: "read" },
      { kind: "fly", at: 1.1, dur: 0.9, from: "rc", to: "reader", label: "reply, after 1", tone: "good" },
      { kind: "say", at: 2, actor: "reader", text: "hold reply", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 0.8, from: "reader", to: "qc", label: "need 1" },
      { kind: "wait", at: 3, dur: 2, actor: "reader", label: "waits {n} ms", doneLabel: "waited 120 ms", total: 120 },
      { kind: "say", at: 3.6, actor: "qc", text: "has question", tone: "good" },
      { kind: "fly", at: 5, dur: 0.8, from: "qc", to: "reader", label: "question", tone: "good" },
      { kind: "say", at: 5.8, actor: "reader", text: "question, reply", tone: "good" },
      { kind: "verdict", at: 5.9, text: "Question first, then the reply", tone: "good" },
    ],
    loop: 8.6,
  },
};
