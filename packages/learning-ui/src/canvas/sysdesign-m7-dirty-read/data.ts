import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.4 beat 2. A dirty read is reading data that another transaction has written but not committed. If that transaction rolls back, the reader acted on a value that never existed.
export const sysdesignM7DirtyRead: SceneSpec = {
  kind: "scene",
  title: "A dirty read shows a change that never happened",
  purpose: "A buyer's app sets the count to 0 but has not committed. The counter page reads 0 and shows sold out. Then the payment fails and the change is rolled back.",
  limits: "PostgreSQL never allows this: its lowest level, Read Uncommitted, behaves like Read Committed. Some other databases do allow dirty reads at their lowest level. The names and numbers are made up.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "writer", label: "Buyer app", kind: "phone", sub: "paying", x: 60, y: 100 },
      { id: "reader", label: "Counter page", kind: "user", sub: "shows seats", x: 360, y: 100 },
      { id: "db", label: "Database", kind: "database", sub: "left: 1", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "writer", to: "db", label: "set left = 0" },
      { kind: "say", at: 1, actor: "db", text: "0, unsaved", tone: "warn" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "reader", to: "db", label: "read left" },
      { kind: "fly", at: 2.1, dur: 0.7, from: "db", to: "reader", label: "0 (unsaved)", tone: "warn" },
      { kind: "say", at: 2.8, actor: "reader", text: "sold out", tone: "warn" },
      { kind: "say", at: 3.1, actor: "writer", text: "payment failed", tone: "bad" },
      { kind: "fly", at: 3.4, dur: 0.7, from: "writer", to: "db", label: "ROLLBACK" },
      { kind: "say", at: 4.1, actor: "db", text: "left: 1", tone: "good" },
      { kind: "verdict", at: 4.4, text: "Sold out shown, but a seat is free", tone: "bad" },
    ],
    loop: 7.2,
  },
};
