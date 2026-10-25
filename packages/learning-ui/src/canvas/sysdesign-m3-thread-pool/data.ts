import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.6 beat 3: a thread per request. Four threads each hold a request while
// it waits for the database, so a fifth request has to queue even though no
// thread is doing any work.
export const sysdesignM3ThreadPool: SceneSpec = {
  kind: "scene",
  title: "A thread per request: threads that only wait",
  purpose: "A pool of four threads gives each request its own thread. All four sit waiting on the database, so request 5 has no thread.",
  limits: "Four threads, made up for the picture. Real pools have more threads, and the operating system pays a context switch (about 10 microseconds, napkin-math) each time it moves a core from one thread to another.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "users", kind: "user", label: "Users", sub: "5 requests", x: 60, y: 220 },
      { id: "pool", kind: "server", label: "Thread pool", sub: "4 threads free", x: 210, y: 100 },
      { id: "db", kind: "database", label: "Database", sub: "idle", x: 360, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "users", to: "pool", label: "req 1" },
      { kind: "fly", at: 0.4, dur: 0.5, from: "users", to: "pool", label: "req 2" },
      { kind: "fly", at: 0.6, dur: 0.5, from: "users", to: "pool", label: "req 3" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "users", to: "pool", label: "req 4" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "pool", to: "db", label: "4 queries" },
      { kind: "say", at: 1.3, actor: "pool", text: "4 of 4 waiting", tone: "warn" },
      { kind: "say", at: 1.3, actor: "db", text: "working", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.5, from: "users", to: "pool", label: "req 5" },
      { kind: "say", at: 2.1, actor: "pool", text: "no free thread", tone: "bad" },
      { kind: "mark", at: 2.1, actor: "pool", tone: "bad" },
      { kind: "wait", at: 2.1, dur: 1.5, actor: "users", label: "req 5 waits", doneLabel: "req 5 waited", total: 0 },
      { kind: "fly", at: 3.0, dur: 0.6, from: "db", to: "pool", label: "rows" },
      { kind: "say", at: 3.6, actor: "pool", text: "1 thread free", tone: "good" },
      { kind: "fly", at: 3.6, dur: 0.5, from: "pool", to: "users", label: "reply 1" },
      { kind: "verdict", at: 3.9, text: "4 threads busy doing nothing", tone: "warn" },
    ],
    loop: 7,
  },
};
