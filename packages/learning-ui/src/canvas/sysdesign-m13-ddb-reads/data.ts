import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.4 beat 3: An eventually consistent read may be stale; a strong read is not.
export const sysdesignM13DdbReads: SceneSpec = {
  kind: "scene",
  title: "An eventually consistent read may be stale; a strong read is not",
  purpose: "The leader has x = 8. One replica still has x = 7. A read that goes to any copy may return 7. A strongly consistent read goes to the leader and returns 8.",
  limits: "One replica and one lagging value. The service chooses the copy for an eventually consistent read; the caller cannot pick it.",
  scene: {
    width: 420,
    height: 335,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "reads x", x: 60, y: 190 },
      { id: "leader", label: "Leader", kind: "database", sub: "x = 8", x: 360, y: 100 },
      { id: "replica", label: "Replica", kind: "database", sub: "x = 7 (late)", x: 360, y: 285 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 1, from: "client", to: "replica", label: "eventual" },
      { kind: "fly", at: 1.5, dur: 1, from: "replica", to: "client", label: "x = 7", tone: "warn" },
      { kind: "say", at: 2.5, actor: "client", text: "got x = 7", tone: "warn" },
      { kind: "fly", at: 3, dur: 1, from: "client", to: "leader", label: "strong" },
      { kind: "fly", at: 4, dur: 1, from: "leader", to: "client", label: "x = 8", tone: "good" },
      { kind: "say", at: 5, actor: "client", text: "got x = 8", tone: "good" },
      { kind: "mark", at: 5, actor: "leader", tone: "good" },
      { kind: "verdict", at: 5.2, text: "Strong reads go to the leader", tone: "good" },
    ],
    loop: 8,
  },
};
