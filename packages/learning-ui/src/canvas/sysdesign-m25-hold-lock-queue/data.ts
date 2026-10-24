import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.2 beat 4: A row lock keeps the seat safe, and makes every other buyer wait in line.
export const sysdesignM25HoldLockQueue: SceneSpec = {
  kind: "scene",
  title: "A lock keeps the seat safe and makes buyers queue",
  purpose: "Dina locks seat 7 while a card check runs for 200 ms. Omar asks for the same lock and waits. When Dina commits, Omar finds the seat sold.",
  limits: "The 200 ms card check inside the lock is a course number. With 20 fans per seat, the line behind one seat is much longer than the one waiting buyer drawn here.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "dina", label: "Dina", kind: "user", sub: "wants seat 7", x: 70, y: 100 },
      { id: "omar", label: "Omar", kind: "user", sub: "wants seat 7", x: 70, y: 235 },
      { id: "seat", label: "Seat 7", kind: "database", sub: "free", x: 350, y: 165 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "dina", to: "seat", label: "lock seat 7" },
      { kind: "say", at: 1.0, actor: "seat", text: "locked: Dina", tone: "accent" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "omar", to: "seat", label: "lock seat 7" },
      { kind: "say", at: 2.1, actor: "omar", text: "in the queue", tone: "warn" },
      { kind: "wait", at: 2.1, dur: 3.2, actor: "omar", label: "waiting {n} ms", doneLabel: "waited 200 ms", total: 200 },
      { kind: "say", at: 2.2, actor: "dina", text: "checks card", tone: "accent" },
      { kind: "fly", at: 5.4, dur: 0.7, from: "dina", to: "seat", label: "commit", tone: "good" },
      { kind: "say", at: 6.1, actor: "seat", text: "sold to Dina", tone: "good" },
      { kind: "fly", at: 6.3, dur: 0.8, from: "seat", to: "omar", label: "sold out", tone: "bad" },
      { kind: "say", at: 7.1, actor: "omar", text: "gave up", tone: "bad" },
      { kind: "verdict", at: 7.3, text: "Safe, but every buyer waits in line", tone: "warn" },
    ],
    loop: 10.5,
  },
};
