import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 11.6 beat 1 ("Stop writing, and the copies agree"). With no new writes, copies that keep syncing end up the same.
export const sysdesignM11Eventually: SceneSpec = {
  kind: "scene",
  title: "No new writes: the copies end up the same",
  purpose: "A write lands on copy A. The copies sync with each other in the background. After a while, all three hold the same value.",
  limits: "Three copies and one write. How long the sync takes depends on how often copies sync and on failures. That is the next pictures.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "a", label: "Copy A", kind: "database", sub: "x = 0", x: 210, y: 105 },
      { id: "b", label: "Copy B", kind: "database", sub: "x = 0", x: 80, y: 235 },
      { id: "c", label: "Copy C", kind: "database", sub: "x = 0", x: 340, y: 235 },
    ],
    events: [
      { kind: "say", at: 0.4, actor: "a", text: "x = 5 (new)", tone: "good" },
      { kind: "mark", at: 0.4, actor: "a", tone: "good" },
      { kind: "fly", at: 1.2, dur: 1, from: "a", to: "b", label: "sync" },
      { kind: "say", at: 2.2, actor: "b", text: "x = 5", tone: "good" },
      { kind: "fly", at: 2.6, dur: 1, from: "b", to: "c", label: "sync" },
      { kind: "say", at: 3.6, actor: "c", text: "x = 5", tone: "good" },
      { kind: "say", at: 3.7, actor: "a", text: "x = 5", tone: "good" },
      { kind: "verdict", at: 3.8, text: "No new writes: all copies agree", tone: "good" },
    ],
    loop: 7,
  },
};
