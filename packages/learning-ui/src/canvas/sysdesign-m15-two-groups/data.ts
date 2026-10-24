import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.3 beat 4: Two groups read the same log at different speeds.
export const sysdesignM15TwoGroups: SceneSpec = {
  kind: "scene",
  title: "Two groups read the same log at different speeds",
  purpose: "The Email group is at event 8 and the Stats group is at event 3. Both read the same log, and a slow group does not slow the other.",
  limits: "Each group is one box here. In a real group, several workers share the partitions and the group keeps one position per partition.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "log", label: "Log", kind: "queue", sub: "events 1 to 9", x: 210, y: 100 },
      { id: "email", label: "Email", kind: "worker", sub: "group at 8", x: 60, y: 220 },
      { id: "stats", label: "Stats", kind: "worker", sub: "group at 3", x: 360, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.8, from: "log", to: "email", label: "event 9" },
      { kind: "say", at: 1.3, actor: "email", text: "group at 9", tone: "good" },
      { kind: "fly", at: 2, dur: 1.4, from: "log", to: "stats", label: "event 4", tone: "warn" },
      { kind: "say", at: 3.5, actor: "stats", text: "group at 4", tone: "warn" },
      { kind: "say", at: 3.9, actor: "log", text: "keeps all 9", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Each group reads at its own speed", tone: "good" },
    ],
    loop: 7.8,
  },
};
