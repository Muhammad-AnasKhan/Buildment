import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.5 beat 5: With jitter the retries arrive one at a time.
export const sysdesignM15RetryJitter: SceneSpec = {
  kind: "scene",
  title: "With jitter the retries arrive one at a time",
  purpose: "The same three workers wait a random time instead. Their retries reach the database at 1.2, 2.0 and 2.9 seconds, so the database sees one at a time.",
  limits: "Three workers and three chosen random waits. Full jitter picks a random time between 0 and the doubled ceiling; chapter 15.5 and the challenge give the formula.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "w1", label: "Worker 1", kind: "worker", sub: "waits 1.2 s", x: 60, y: 100 },
      { id: "w2", label: "Worker 2", kind: "worker", sub: "waits 2.0 s", x: 210, y: 100 },
      { id: "w3", label: "Worker 3", kind: "worker", sub: "waits 2.9 s", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "recovering", x: 210, y: 240 },
    ],
    events: [
      { kind: "fly", at: 1.5, dur: 0.8, from: "w1", to: "db", label: "retry", tone: "good" },
      { kind: "say", at: 2.4, actor: "db", text: "1 at a time", tone: "good" },
      { kind: "say", at: 2.4, actor: "w1", text: "done", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "w2", to: "db", label: "retry", tone: "good" },
      { kind: "say", at: 3.7, actor: "w2", text: "done", tone: "good" },
      { kind: "fly", at: 4.1, dur: 0.8, from: "w3", to: "db", label: "retry", tone: "good" },
      { kind: "say", at: 5, actor: "w3", text: "done", tone: "good" },
      { kind: "say", at: 5, actor: "db", text: "all served", tone: "good" },
      { kind: "verdict", at: 5.5, text: "Random waits spread the retries out", tone: "good" },
    ],
    loop: 8.5,
  },
};
