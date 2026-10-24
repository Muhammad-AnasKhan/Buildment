import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.7 beat 5: a clock stepped back 4 ms makes a Snowflake-style worker
// issue the same ID twice.
export const sysdesignM10IdRollback: SceneSpec = {
  kind: "scene",
  title: "A clock stepped back repeats an ID",
  purpose: "Worker 7 made ID 996-7-0 when its clock read 996. The clock then reads 1000 and is stepped back to 996. The worker makes the same ID again, and the table refuses it.",
  limits: "IDs are shown as time-worker-sequence in plain numbers. A real Snowflake ID packs the three into one 64-bit number. The 4 ms step is made up. The fix is to remember the last time used and refuse, wait or keep counting.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "w", label: "Worker 7", kind: "worker", sub: "clock 996", x: 100, y: 100 },
      { id: "t", label: "ID table", kind: "database", sub: "unique keys", x: 320, y: 100 },
    ],
    strip: { y: 300, from: 994, to: 1002, unit: "", caption: "clock reading inside the ID", every: 2 },
    events: [
      { kind: "fly", at: 0.4, dur: 1, from: "w", to: "t", label: "ID 996-7-0" },
      { kind: "tag", at: 1.4, row: 0, value: 996, label: "ID 996-7-0", tone: "good" },
      { kind: "say", at: 1.4, actor: "t", text: "stored", tone: "good" },
      { kind: "say", at: 2, actor: "w", text: "clock 1000" },
      { kind: "tag", at: 2, row: 0, value: 1000, label: "clock 1000" },
      { kind: "say", at: 2.8, actor: "w", text: "clock back: 996", tone: "warn" },
      { kind: "fly", at: 3.2, dur: 1, from: "w", to: "t", label: "ID 996-7-0" },
      { kind: "tag", at: 4.2, row: 1, value: 996, label: "ID 996-7-0 again", tone: "bad" },
      { kind: "say", at: 4.2, actor: "t", text: "duplicate key", tone: "bad" },
      { kind: "mark", at: 4.2, actor: "t", tone: "bad" },
      { kind: "verdict", at: 4.6, text: "Same ID twice: the insert fails", tone: "bad" },
    ],
    loop: 8,
  },
};
