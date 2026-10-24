import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.2 beat 4. When data arrives in time order and is read by time range, a store that keeps rows sorted by time (a time-series or wide-column store) turns each read into one contiguous range.
export const sysdesignM7StoreStream: SceneSpec = {
  kind: "scene",
  title: "Gate scans: append in, read a time range out",
  purpose: "Scanners write rows in time order, all day. The ops screen asks for the last 5 minutes, which is one range of rows.",
  limits: "The rate (18 scans a second) is made up. Real wide-column and time-series stores also spread data over many machines, drop old data on a schedule and compress it; the picture shows only the access pattern.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "scan", label: "Gate scanners", kind: "phone", sub: "18 scans a sec", x: 62, y: 100 },
      { id: "store", label: "Time series", kind: "database", sub: "sorted by time", x: 210, y: 100 },
      { id: "ops", label: "Ops screen", kind: "user", sub: "last 5 minutes", x: 358, y: 100 },
    ],
    strip: { y: 305, from: 0, to: 60, unit: "min", caption: "time, newest on the right", every: 10 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.5, from: "scan", to: "store", label: "new scan" },
      { kind: "fly", at: 0.6, dur: 0.5, from: "scan", to: "store", label: "new scan" },
      { kind: "fly", at: 0.9, dur: 0.5, from: "scan", to: "store", label: "new scan" },
      { kind: "say", at: 1.5, actor: "store", text: "appending", tone: "good" },
      { kind: "tag", at: 1.6, row: 0, value: 59, label: "newest rows", tone: "good" },
      { kind: "fly", at: 2.2, dur: 0.7, from: "ops", to: "store", label: "last 5 min?" },
      { kind: "tag", at: 2.9, row: 1, value: 55, label: "one range", tone: "accent" },
      { kind: "fly", at: 3, dur: 0.8, from: "store", to: "ops", label: "5,400 rows", tone: "good" },
      { kind: "say", at: 3.9, actor: "ops", text: "chart drawn", tone: "good" },
      { kind: "verdict", at: 4.1, text: "Writes append, reads take a range", tone: "good" },
    ],
    loop: 6.9,
  },
};
