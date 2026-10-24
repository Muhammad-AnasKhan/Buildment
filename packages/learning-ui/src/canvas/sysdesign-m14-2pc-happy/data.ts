import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.2 beat 1 (Ask first, then decide).
export const sysdesignM14TwoPcHappy: SceneSpec = {
  kind: "scene",
  title: "Two-phase commit: ask everyone, then tell everyone",
  purpose: "The coordinator asks both databases if they can commit, both say yes, then it tells both to commit.",
  limits: "Two databases only, and a coordinator that never fails here. Real systems write the decision to a log before they send it.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "coord", label: "Coordinator", kind: "server", sub: "asks, decides", x: 210, y: 90 },
      { id: "a", label: "Stock DB", kind: "database", sub: "working", x: 60, y: 260 },
      { id: "b", label: "Payments DB", kind: "database", sub: "working", x: 360, y: 260 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "coord", to: "a", label: "prepare?" },
      { kind: "fly", at: 0.3, dur: 0.9, from: "coord", to: "b", label: "prepare?" },
      { kind: "say", at: 1.3, actor: "a", text: "locked, ready", tone: "accent" },
      { kind: "say", at: 1.3, actor: "b", text: "locked, ready", tone: "accent" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "a", to: "coord", label: "yes", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "b", to: "coord", label: "yes", tone: "good" },
      { kind: "say", at: 2.6, actor: "coord", text: "all said yes", tone: "good" },
      { kind: "fly", at: 3, dur: 0.9, from: "coord", to: "a", label: "commit" },
      { kind: "fly", at: 3, dur: 0.9, from: "coord", to: "b", label: "commit" },
      { kind: "say", at: 4, actor: "a", text: "committed", tone: "good" },
      { kind: "say", at: 4, actor: "b", text: "committed", tone: "good" },
      { kind: "verdict", at: 4.5, text: "Both commit, or both abort", tone: "good" },
    ],
    loop: 7.5,
  },
};
