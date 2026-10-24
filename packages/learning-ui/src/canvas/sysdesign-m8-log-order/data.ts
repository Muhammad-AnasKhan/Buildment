import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.2 beat 2 ("Followers copy the log in order"). Followers do not replay writes in any order they like. They follow the leader's log, entry by entry.
export const sysdesignM8LogOrder: SceneSpec = {
  kind: "scene",
  title: "The follower applies the log in the same order",
  purpose: "The leader writes entries 1, 2 and 3 to its log. The follower receives and applies them in the same order, one after another.",
  limits: "One follower and three entries are drawn. Real logs hold millions of entries, and a busy follower may apply several at once, but always in log order.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "leader", label: "Leader", kind: "database", sub: "writes the log", x: 80, y: 110 },
      { id: "follower", label: "Follower", kind: "database", sub: "applies the log", x: 340, y: 110 },
    ],
    strip: { y: 296, from: 0, to: 4, unit: "", caption: "log position", every: 1 },
    events: [
      { kind: "tag", at: 0.2, row: 0, value: 1, label: "Leader 1" },
      { kind: "fly", at: 0.5, dur: 0.9, from: "leader", to: "follower", label: "entry 1" },
      { kind: "tag", at: 1.4, row: 1, value: 1, label: "Copy 1", tone: "good" },
      { kind: "tag", at: 1.6, row: 0, value: 2, label: "Leader 2" },
      { kind: "fly", at: 1.9, dur: 0.9, from: "leader", to: "follower", label: "entry 2" },
      { kind: "tag", at: 2.8, row: 1, value: 2, label: "Copy 2", tone: "good" },
      { kind: "tag", at: 3, row: 0, value: 3, label: "Leader 3" },
      { kind: "fly", at: 3.3, dur: 0.9, from: "leader", to: "follower", label: "entry 3" },
      { kind: "tag", at: 4.2, row: 1, value: 3, label: "Copy 3", tone: "good" },
      { kind: "say", at: 4.2, actor: "follower", text: "log: 3", tone: "good" },
      { kind: "verdict", at: 4.3, text: "Same order on the follower", tone: "good" },
    ],
    loop: 7.4,
  },
};
