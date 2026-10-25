import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.3 beat 4. An LSM tree turns random writes into sequential ones: append to a log, update memory, and flush a sorted file.
export const sysdesignM7LsmWrite: SceneSpec = {
  kind: "scene",
  title: "An LSM tree only appends",
  purpose: "Each write goes to a log and to a small table in memory. When the table is full, it is written out as one sorted file that is never edited.",
  limits: "Toy sizes: the memory table holds 4 keys. Real engines keep several memory tables, many files in levels, and merge files in the background (compaction). That background work is where an LSM tree pays for its fast writes.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "app", label: "App", kind: "server", sub: "put seat 12", x: 60, y: 100 },
      { id: "mem", label: "Memory table", kind: "cache", sub: "1 of 4 keys", x: 360, y: 100 },
      { id: "log", label: "Log", kind: "note", sub: "append only", x: 210, y: 255 },
      { id: "file", label: "Sorted file", kind: "database", sub: "none yet", x: 360, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.6, from: "app", to: "log", label: "append" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "app", to: "mem", label: "put" },
      { kind: "say", at: 1.3, actor: "mem", text: "2 of 4 keys" },
      { kind: "fly", at: 1.7, dur: 0.6, from: "app", to: "log", label: "append" },
      { kind: "fly", at: 1.7, dur: 0.9, from: "app", to: "mem", label: "put" },
      { kind: "say", at: 2.7, actor: "mem", text: "4 of 4: full", tone: "warn" },
      { kind: "mark", at: 2.7, actor: "mem", tone: "warn" },
      { kind: "fly", at: 3.1, dur: 0.8, from: "mem", to: "file", label: "flush sorted" },
      { kind: "say", at: 4, actor: "file", text: "1 sorted file", tone: "good" },
      { kind: "say", at: 4, actor: "mem", text: "empty", tone: "good" },
      { kind: "verdict", at: 4.3, text: "Writes only append, never edit", tone: "good" },
    ],
    loop: 7.1,
  },
};
