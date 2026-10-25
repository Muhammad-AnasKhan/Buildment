import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 2.3 beat 5: Sada stores about 22 TB a year (with 3 copies). Traffic is a
// rate and stays the same; storage adds up: 22, 44, 66, 88, 110 TB.
export const sysdesignM2StoragePilesUp: SceneSpec = {
  kind: "scene",
  title: "Storage adds up, traffic does not",
  purpose: "The same users keep coming each year: requests per second stay flat while stored voice notes add up year after year.",
  limits: "Assumes Sada's users and habits stay the same for five years and nothing is ever deleted. Real apps grow, delete old data or move it to cheaper storage.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "users", kind: "phone", label: "Sada users", sub: "700 req/s peak", x: 60, y: 110 },
      { id: "store", kind: "database", label: "Storage", sub: "empty", x: 360, y: 110 },
    ],
    strip: { y: 280, from: 0, to: 5, unit: "", caption: "years after launch", every: 1 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "users", to: "store", label: "year 1" },
      { kind: "say", at: 1.0, actor: "store", text: "22 TB" },
      { kind: "tag", at: 1.0, row: 1, value: 1, label: "year 1: 22 TB" },
      { kind: "fly", at: 1.2, dur: 0.6, from: "users", to: "store", label: "year 2" },
      { kind: "say", at: 1.8, actor: "store", text: "44 TB" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "users", to: "store", label: "year 3" },
      { kind: "say", at: 2.6, actor: "store", text: "66 TB", tone: "warn" },
      { kind: "tag", at: 2.6, row: 0, value: 3, label: "year 3: 66 TB", tone: "warn" },
      { kind: "fly", at: 2.8, dur: 0.6, from: "users", to: "store", label: "year 4" },
      { kind: "say", at: 3.4, actor: "store", text: "88 TB", tone: "warn" },
      { kind: "fly", at: 3.6, dur: 0.6, from: "users", to: "store", label: "year 5" },
      { kind: "say", at: 4.2, actor: "store", text: "110 TB", tone: "bad" },
      { kind: "mark", at: 4.2, actor: "store", tone: "bad" },
      { kind: "tag", at: 4.2, row: 1, value: 5, label: "year 5: 110 TB", tone: "bad" },
      { kind: "say", at: 4.2, actor: "users", text: "still 700/s", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Storage piles up; traffic does not", tone: "warn" },
    ],
    loop: 7.5,
  },
};
