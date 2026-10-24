import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.4 beat 1: A worker that acknowledges first loses the job in a crash.
export const sysdesignM15AckFirst: SceneSpec = {
  kind: "scene",
  title: "A worker that acknowledges first loses the job in a crash",
  purpose: "The worker gets the job credit 18, acknowledges it, and crashes before it pays. The queue has already deleted the job, so the credit never happens.",
  limits: "Two actors. The crash point is chosen to show the failure; a real crash can come at any moment.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "queue", label: "Queue", kind: "queue", sub: "credit 18", x: 60, y: 110 },
      { id: "worker", label: "Worker", kind: "worker", sub: "idle", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.9, from: "queue", to: "worker", label: "credit 18" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "worker", to: "queue", label: "ack", tone: "good" },
      { kind: "say", at: 2.6, actor: "queue", text: "job deleted", tone: "good" },
      { kind: "say", at: 3, actor: "worker", text: "crashed", tone: "bad" },
      { kind: "mark", at: 3, actor: "worker", tone: "bad" },
      { kind: "say", at: 4, actor: "queue", text: "no resend", tone: "bad" },
      { kind: "verdict", at: 4.6, text: "Ack first: a crash loses the job", tone: "bad" },
    ],
    loop: 7.6,
  },
};
