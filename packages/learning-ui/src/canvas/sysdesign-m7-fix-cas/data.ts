import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.5 beat 2. Compare-and-set writes only if the value or version is still what you read. If someone else changed it, the write is refused and you decide what to do.
export const sysdesignM7FixCas: SceneSpec = {
  kind: "scene",
  title: "A version check refuses the stale write",
  purpose: "Both buyers read 1 ticket at version 7. Dina writes first and moves the row to version 8. Omar's write says 'only if version 7', so it changes nothing.",
  limits: "Nobody waits for a lock, but the loser must read again and try again. With many buyers on one row, most attempts fail and retry. In SQL: UPDATE ... WHERE version = 7, then check how many rows changed.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "dina", label: "Dina", kind: "phone", sub: "read: 1, v7", x: 60, y: 100 },
      { id: "omar", label: "Omar", kind: "phone", sub: "read: 1, v7", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "left 1, v7", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "dina", to: "db", label: "set 0 if v7" },
      { kind: "say", at: 1.3, actor: "db", text: "left 0, v8", tone: "good" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "db", to: "dina", label: "1 row changed", tone: "good" },
      { kind: "say", at: 2.3, actor: "dina", text: "has ticket", tone: "good" },
      { kind: "fly", at: 2.7, dur: 0.8, from: "omar", to: "db", label: "set 0 if v7" },
      { kind: "say", at: 3.6, actor: "omar", text: "0 rows changed", tone: "bad" },
      { kind: "mark", at: 3.6, actor: "omar", tone: "bad" },
      { kind: "fly", at: 3.9, dur: 0.6, from: "omar", to: "db", label: "read again" },
      { kind: "say", at: 4.6, actor: "omar", text: "sees sold out", tone: "good" },
      { kind: "verdict", at: 4.9, text: "The stale write was refused", tone: "good" },
    ],
    loop: 7.7,
  },
};
