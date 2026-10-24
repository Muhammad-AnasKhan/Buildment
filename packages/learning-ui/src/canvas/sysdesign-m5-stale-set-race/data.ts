import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 5.5 beat 3: the delete-then-stale-set race (Facebook calls it a stale set).
// A reader misses and reads the old price (10 ms). A writer commits the new
// price (20 ms) and deletes the key (25 ms). The slow reader then stores the
// old price it read earlier (40 ms), and it stays until the TTL ends.
export const sysdesignM5StaleSetRace: SceneSpec = {
  kind: "scene",
  title: "A slow reader puts the old price back",
  purpose: "A reader reads 999 before the write, the writer commits 899 and deletes the key, and then the reader stores its old 999 in the empty cache.",
  limits: "The timings are made up to show the order; the race needs a reader that is slow between its database read and its cache set, for example during a garbage collection pause or a slow network. It is rare per read, and common at high traffic.",
  scene: {
    width: 420,
    height: 350,
    actors: [
      { id: "cache", label: "Cache", kind: "cache", sub: "empty", x: 210, y: 100 },
      { id: "reader", label: "Reader app", kind: "server", sub: "needs p42", x: 60, y: 215 },
      { id: "db", label: "Database", kind: "database", sub: "p42 = 999", x: 210, y: 215 },
      { id: "writer", label: "Writer app", kind: "server", sub: "price 899", x: 360, y: 215 },
    ],
    strip: { y: 320, from: 0, to: 50, unit: "ms", caption: "milliseconds", every: 10 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "reader", to: "cache", label: "get p42" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "cache", to: "reader", label: "miss", tone: "warn" },
      { kind: "fly", at: 1.2, dur: 0.4, from: "reader", to: "db", label: "read" },
      { kind: "fly", at: 1.6, dur: 0.4, from: "db", to: "reader", label: "999" },
      { kind: "tag", at: 2.0, row: 0, value: 10, label: "read 999" },
      { kind: "say", at: 2.0, actor: "reader", text: "slow, holds 999", tone: "warn" },
      { kind: "fly", at: 2.4, dur: 0.4, from: "writer", to: "db", label: "price 899" },
      { kind: "say", at: 2.8, actor: "db", text: "p42 = 899", tone: "good" },
      { kind: "tag", at: 2.8, row: 1, value: 20, label: "write 899", tone: "good" },
      { kind: "fly", at: 3.1, dur: 0.5, from: "writer", to: "cache", label: "DEL p42" },
      { kind: "say", at: 3.6, actor: "cache", text: "empty" },
      { kind: "tag", at: 3.6, row: 0, value: 25, label: "delete" },
      { kind: "fly", at: 4.1, dur: 0.6, from: "reader", to: "cache", label: "set 999", tone: "bad" },
      { kind: "say", at: 4.7, actor: "cache", text: "999 (old!)", tone: "bad" },
      { kind: "mark", at: 4.7, actor: "cache", tone: "bad" },
      { kind: "tag", at: 4.7, row: 0, value: 40, label: "set 999", tone: "bad" },
      { kind: "verdict", at: 5.0, text: "The old price is back until TTL", tone: "bad" },
    ],
    loop: 8.4,
  },
};
