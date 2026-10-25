import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.5 beat 4: Three workers with the same backoff retry together.
export const sysdesignM15RetryHerd: SceneSpec = {
  kind: "scene",
  title: "Three workers with the same backoff retry together",
  purpose: "The database was down and three workers failed at the same moment. Each waits exactly 2 seconds, so all three hit the database in the same instant.",
  limits: "Three workers. With hundreds of clients the crowd is hundreds, as the challenge shows. The 2 second wait is a course number.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "w1", label: "Worker 1", kind: "worker", sub: "failed", x: 60, y: 100 },
      { id: "w2", label: "Worker 2", kind: "worker", sub: "failed", x: 210, y: 100 },
      { id: "w3", label: "Worker 3", kind: "worker", sub: "failed", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "recovering", x: 210, y: 240 },
    ],
    events: [
      { kind: "say", at: 0.4, actor: "w1", text: "waits 2 s", tone: "warn" },
      { kind: "say", at: 0.4, actor: "w2", text: "waits 2 s", tone: "warn" },
      { kind: "say", at: 0.4, actor: "w3", text: "waits 2 s", tone: "warn" },
      { kind: "fly", at: 2.6, dur: 1, from: "w1", to: "db", label: "retry" },
      { kind: "fly", at: 2.6, dur: 1, from: "w2", to: "db", label: "retry" },
      { kind: "fly", at: 2.6, dur: 1, from: "w3", to: "db", label: "retry" },
      { kind: "say", at: 3.7, actor: "db", text: "3 at once", tone: "bad" },
      { kind: "mark", at: 3.7, actor: "db", tone: "bad" },
      { kind: "say", at: 4.3, actor: "w1", text: "failed again", tone: "bad" },
      { kind: "verdict", at: 4.9, text: "Same schedule: all retry together", tone: "bad" },
    ],
    loop: 7.9,
  },
};
