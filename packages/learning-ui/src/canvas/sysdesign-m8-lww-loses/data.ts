import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.6 beat 3 ("Last writer wins, and one edit is lost"). Last writer wins converges, but it throws away one of two concurrent edits.
export const sysdesignM8LwwLoses: SceneSpec = {
  kind: "scene",
  title: "Last writer wins: one edit disappears",
  purpose: "Both regions edit the same title. When the copies cross, the rule keeps the later timestamp and silently drops the other edit.",
  limits: "Two edits and made-up timestamps in milliseconds. Real clocks differ by a few milliseconds, so \"later\" can be wrong (chapter 10.6).",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "eu", label: "EU leader", kind: "database", sub: "title: Plan", x: 60, y: 110 },
      { id: "rule", label: "Rule", kind: "note", sub: "latest wins", x: 210, y: 110 },
      { id: "sg", label: "SG leader", kind: "database", sub: "title: Plan", x: 360, y: 110 },
    ],
    strip: { y: 296, from: 0, to: 20, unit: "ms", caption: "timestamp", every: 5 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 10, label: "EU: v2 at 10" },
      { kind: "say", at: 0.3, actor: "eu", text: "Plan v2", tone: "good" },
      { kind: "tag", at: 0.8, row: 1, value: 12, label: "SG: v3 at 12" },
      { kind: "say", at: 0.8, actor: "sg", text: "Plan v3", tone: "good" },
      { kind: "fly", at: 1.5, dur: 1.2, from: "eu", to: "sg", label: "v2, t=10" },
      { kind: "fly", at: 1.5, dur: 1.2, from: "sg", to: "eu", label: "v3, t=12" },
      { kind: "say", at: 2.9, actor: "sg", text: "keep v3", tone: "good" },
      { kind: "say", at: 2.9, actor: "eu", text: "drop v2", tone: "bad" },
      { kind: "mark", at: 3, actor: "eu", tone: "bad" },
      { kind: "say", at: 3.6, actor: "eu", text: "Plan v3", tone: "warn" },
      { kind: "retone", at: 3.6, label: "EU: v2 at 10", tone: "bad" },
      { kind: "verdict", at: 3.9, text: "Plan v2 was lost; nobody was told", tone: "bad" },
    ],
    loop: 7,
  },
};
