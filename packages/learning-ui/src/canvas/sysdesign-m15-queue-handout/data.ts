import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.3 beat 1: A queue gives each job to one worker, then deletes it.
export const sysdesignM15QueueHandout: SceneSpec = {
  kind: "scene",
  title: "A queue gives each job to one worker, then deletes it",
  purpose: "Jobs a, b and c wait in the queue. Worker 1 takes a and worker 2 takes b. After each worker acknowledges its job, the queue deletes it.",
  limits: "This is the SQS style. Real queues also hide a job for a visibility timeout while a worker holds it, and bring it back if no ack arrives (chapter 14.5).",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "queue", label: "Queue", kind: "queue", sub: "jobs a, b, c", x: 210, y: 100 },
      { id: "w1", label: "Worker 1", kind: "worker", sub: "idle", x: 60, y: 220 },
      { id: "w2", label: "Worker 2", kind: "worker", sub: "idle", x: 360, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.9, from: "queue", to: "w1", label: "job a" },
      { kind: "fly", at: 0.4, dur: 0.9, from: "queue", to: "w2", label: "job b" },
      { kind: "say", at: 1.5, actor: "w1", text: "works on a", tone: "accent" },
      { kind: "say", at: 1.5, actor: "w2", text: "works on b", tone: "accent" },
      { kind: "say", at: 1.5, actor: "queue", text: "c waiting", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.8, from: "w1", to: "queue", label: "ack a", tone: "good" },
      { kind: "say", at: 3.3, actor: "queue", text: "a deleted", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.8, from: "w2", to: "queue", label: "ack b", tone: "good" },
      { kind: "say", at: 4.5, actor: "queue", text: "b deleted", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.8, from: "queue", to: "w1", label: "job c" },
      { kind: "verdict", at: 5.8, text: "One job, one worker, then gone", tone: "good" },
    ],
    loop: 8.8,
  },
};
