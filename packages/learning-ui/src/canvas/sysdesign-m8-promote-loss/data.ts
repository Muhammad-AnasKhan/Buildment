import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.5 beat 2 ("Promotion can lose acknowledged writes"). Failover under asynchronous replication loses the writes that were not yet copied.
export const sysdesignM8PromoteLoss: SceneSpec = {
  kind: "scene",
  title: "The new leader's log ends before the old one's",
  purpose: "The follower promoted after a crash only has the log it received. Entries the old leader had not yet copied are lost.",
  limits: "One follower is shown. With several, the one with the longest log is the best candidate, but even it may be behind the old leader.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "old", label: "Old leader", kind: "database", sub: "log: 8", x: 80, y: 100 },
      { id: "new", label: "Follower", kind: "database", sub: "log: 6", x: 340, y: 100 },
    ],
    strip: { y: 296, from: 0, to: 8, unit: "", caption: "log position", every: 1 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 8, label: "Old leader: 8" },
      { kind: "tag", at: 0.5, row: 1, value: 6, label: "Follower: 6", tone: "good" },
      { kind: "say", at: 1.4, actor: "old", text: "CRASH", tone: "bad" },
      { kind: "mark", at: 1.4, actor: "old", tone: "bad" },
      { kind: "say", at: 2.2, actor: "new", text: "promoted", tone: "good" },
      { kind: "line", at: 2.6, value: 6, label: "new log ends" },
      { kind: "retone", at: 3.2, label: "Old leader: 8", tone: "bad" },
      { kind: "verdict", at: 3.4, text: "Writes 7 and 8 are lost", tone: "bad" },
    ],
    loop: 6.6,
  },
};
