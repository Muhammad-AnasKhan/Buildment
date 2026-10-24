import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.5 beat 1. A row lock turns concurrent writers into a queue, so each one sees the result of the one before.
export const sysdesignM7FixLock: SceneSpec = {
  kind: "scene",
  title: "A row lock makes the second buyer wait",
  purpose: "Dina locks the ticket row while she reads and writes it. Omar asks for the same lock and waits. When Dina commits, Omar reads 0.",
  limits: "Postgres lock syntax: SELECT ... FOR UPDATE. Waiting costs time: the lock is held for as long as Dina's transaction runs, including any work the app does in between. The names and steps are made up.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "dina", label: "Dina", kind: "phone", sub: "wants 1 ticket", x: 60, y: 100 },
      { id: "omar", label: "Omar", kind: "phone", sub: "wants 1 ticket", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "tickets left: 1", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "dina", to: "db", label: "lock and read" },
      { kind: "say", at: 1, actor: "db", text: "locked by Dina", tone: "warn" },
      { kind: "fly", at: 1.3, dur: 0.7, from: "omar", to: "db", label: "lock and read" },
      { kind: "say", at: 2, actor: "omar", text: "waiting...", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.7, from: "dina", to: "db", label: "set 0, commit" },
      { kind: "say", at: 3.1, actor: "db", text: "left 0, free", tone: "good" },
      { kind: "fly", at: 3.4, dur: 0.7, from: "db", to: "omar", label: "0 left", tone: "good" },
      { kind: "say", at: 4.1, actor: "omar", text: "sold out", tone: "good" },
      { kind: "say", at: 4.1, actor: "dina", text: "has ticket", tone: "good" },
      { kind: "verdict", at: 4.4, text: "Omar waits, then sees 0 left", tone: "good" },
    ],
    loop: 7.2,
  },
};
