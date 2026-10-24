import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.6 beat 2. The cheapest fix comes first: a missing index costs nothing to run and can remove most of the load.
export const sysdesignM7PathIndex: SceneSpec = {
  kind: "scene",
  title: "Step 1: an index fixes a slow query",
  purpose: "The orders page takes 3.2 seconds and the database CPU is at 92%. One query scans a big table. After CREATE INDEX the page takes 40 ms and the CPU drops to 28%.",
  limits: "All numbers are made up for the story. Always look at the slow query first (EXPLAIN shows whether it scans or uses an index). Each extra index also slows every write to the table.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "Orders page", kind: "server", sub: "page: 3.2 s", x: 60, y: 130 },
      { id: "db", label: "Database", kind: "database", sub: "CPU 92%", x: 360, y: 130 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "app", to: "db", label: "slow query" },
      { kind: "say", at: 1.1, actor: "db", text: "scanning...", tone: "bad" },
      { kind: "mark", at: 1.1, actor: "db", tone: "bad" },
      { kind: "fly", at: 2, dur: 0.8, from: "app", to: "db", label: "CREATE INDEX" },
      { kind: "say", at: 3, actor: "db", text: "CPU 28%", tone: "good" },
      { kind: "say", at: 3, actor: "app", text: "page: 40 ms", tone: "good" },
      { kind: "verdict", at: 3.4, text: "An index cut the work, no new server", tone: "good" },
    ],
    loop: 6.2,
  },
};
