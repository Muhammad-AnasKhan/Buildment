import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.6 beat 4: an event loop. One thread starts each request's database query
// and goes straight back to take the next request; when rows come back, it
// finishes that request. Five waits are in progress at once on one thread.
export const sysdesignM3EventLoop: SceneSpec = {
  kind: "scene",
  title: "An event loop: one thread, many waits",
  purpose: "One thread starts all five queries without waiting for any of them, then answers each request as its rows come back.",
  limits: "Five requests and a short database wait, made up for the picture. This works only while each step of the work is short: one long step on the thread stops every other request, which the next beat shows.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "users", kind: "user", label: "Users", sub: "5 requests", x: 60, y: 220 },
      { id: "loop", kind: "server", label: "Event loop", sub: "1 thread", x: 210, y: 100 },
      { id: "db", kind: "database", label: "Database", sub: "idle", x: 360, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "users", to: "loop", label: "req 1" },
      { kind: "fly", at: 0.4, dur: 0.5, from: "users", to: "loop", label: "req 2" },
      { kind: "fly", at: 0.6, dur: 0.5, from: "users", to: "loop", label: "req 3" },
      { kind: "fly", at: 0.8, dur: 0.5, from: "users", to: "loop", label: "req 4" },
      { kind: "fly", at: 1.0, dur: 0.5, from: "users", to: "loop", label: "req 5" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "loop", to: "db", label: "query 1" },
      { kind: "fly", at: 1.1, dur: 0.5, from: "loop", to: "db", label: "query 3" },
      { kind: "fly", at: 1.5, dur: 0.5, from: "loop", to: "db", label: "query 5" },
      { kind: "say", at: 1.7, actor: "loop", text: "5 waits, free", tone: "good" },
      { kind: "say", at: 1.7, actor: "db", text: "5 queries", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.5, from: "db", to: "loop", label: "rows 1" },
      { kind: "fly", at: 2.9, dur: 0.5, from: "loop", to: "users", label: "reply 1", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.5, from: "db", to: "loop", label: "rows 2" },
      { kind: "fly", at: 3.3, dur: 0.5, from: "loop", to: "users", label: "reply 2", tone: "good" },
      { kind: "say", at: 3.8, actor: "users", text: "replies coming", tone: "good" },
      { kind: "verdict", at: 4.0, text: "One thread, many waits at once", tone: "good" },
    ],
    loop: 7,
  },
};
