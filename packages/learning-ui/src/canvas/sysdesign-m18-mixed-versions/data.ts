import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.6 beat 1 (Rolling: two versions at once).
export const sysdesignM18MixedVersions: SceneSpec = {
  kind: "scene",
  title: "During a rolling update, old and new code share one database",
  purpose: "The new version saves a note in a new format. The old version, still running, reads that note and cannot understand it.",
  limits: "A made-up example. The usual fix is to change the database in small steps that both versions accept, then remove the old way later (expand, then contract).",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "v1", label: "v1 pod", kind: "server", sub: "old code", x: 60, y: 100 },
      { id: "v2", label: "v2 pod", kind: "server", sub: "new code", x: 60, y: 190 },
      { id: "db", label: "Database", kind: "database", x: 360, y: 145 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.9, from: "v2", to: "db", label: "new format" },
      { kind: "say", at: 1.4, actor: "db", text: "has v2 rows", tone: "accent" },
      { kind: "fly", at: 2.2, dur: 0.8, from: "v1", to: "db", label: "read note" },
      { kind: "fly", at: 3, dur: 0.8, from: "db", to: "v1", label: "new format", tone: "warn" },
      { kind: "say", at: 3.9, actor: "v1", text: "cannot read", tone: "bad" },
      { kind: "mark", at: 3.9, actor: "v1", tone: "bad" },
      { kind: "verdict", at: 4.2, text: "Both versions touch one database", tone: "bad" },
    ],
    loop: 7.2,
  },
};
