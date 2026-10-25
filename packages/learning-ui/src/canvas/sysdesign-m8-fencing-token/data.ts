import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.5 beat 4 ("A number the database checks"). A fencing number stops an old leader from writing after a new one has taken over.
export const sysdesignM8FencingToken: SceneSpec = {
  kind: "scene",
  title: "The database refuses the old leader's write",
  purpose: "Each new leader gets a bigger number. The database remembers the biggest number it has seen and refuses anything smaller.",
  limits: "One database is drawn. With several, each one must check the number, or the check can be skipped by writing to a node that does not.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "new", label: "New leader", kind: "server", sub: "epoch 8", x: 60, y: 110 },
      { id: "old", label: "Old leader", kind: "server", sub: "epoch 7", x: 60, y: 250 },
      { id: "db", label: "Database", kind: "database", sub: "highest: 7", x: 330, y: 180 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "new", to: "db", label: "write, e8" },
      { kind: "say", at: 1.2, actor: "db", text: "highest: 8", tone: "good" },
      { kind: "say", at: 1.3, actor: "new", text: "accepted", tone: "good" },
      { kind: "say", at: 1.8, actor: "old", text: "I am leader", tone: "warn" },
      { kind: "fly", at: 2, dur: 0.9, from: "old", to: "db", label: "write, e7", tone: "bad" },
      { kind: "say", at: 2.9, actor: "db", text: "refuse e7", tone: "bad" },
      { kind: "mark", at: 2.9, actor: "db", tone: "bad" },
      { kind: "fly", at: 3, dur: 0.8, from: "db", to: "old", label: "refused", tone: "bad" },
      { kind: "say", at: 3.8, actor: "old", text: "stale: stop", tone: "warn" },
      { kind: "verdict", at: 3.8, text: "Old leader's write is refused", tone: "good" },
    ],
    loop: 6.8,
  },
};
