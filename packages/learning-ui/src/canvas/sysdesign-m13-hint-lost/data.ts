import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.3 beat 4: If the stand-in fails first, the hint is lost and C stays behind.
export const sysdesignM13HintLost: SceneSpec = {
  kind: "scene",
  title: "If the stand-in fails first, the hint is lost and C stays behind",
  purpose: "The write for C went to the stand-in D with a hint. D crashes before C returns. C comes back with the old value, and nobody holds a hint for it.",
  limits: "One hint and one crash. How often this happens depends on how long nodes stay down; the repair that covers it is anti-entropy, shown in the next beat.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "writes x = 7", x: 60, y: 100 },
      { id: "a", label: "Node A", kind: "database", sub: "x = 6", x: 210, y: 100 },
      { id: "b", label: "Node B", kind: "database", sub: "x = 6", x: 360, y: 100 },
      { id: "d", label: "Node D", kind: "database", sub: "stand-in", x: 60, y: 205 },
      { id: "c", label: "Node C", kind: "database", sub: "x = 6", x: 360, y: 205 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "c", text: "down", tone: "bad" },
      { kind: "mark", at: 0.2, actor: "c", tone: "bad" },
      { kind: "fly", at: 0.5, dur: 0.7, from: "client", to: "a", label: "x = 7" },
      { kind: "say", at: 1.2, actor: "a", text: "x = 7", tone: "good" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "a", to: "b", label: "x = 7" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "a", to: "d", label: "x = 7, for C" },
      { kind: "say", at: 2.1, actor: "b", text: "x = 7", tone: "good" },
      { kind: "say", at: 2.2, actor: "d", text: "holds a hint", tone: "warn" },
      { kind: "say", at: 3.2, actor: "d", text: "crashed", tone: "bad" },
      { kind: "mark", at: 3.2, actor: "d", tone: "bad" },
      { kind: "say", at: 4.2, actor: "c", text: "back up", tone: "accent" },
      { kind: "say", at: 5, actor: "c", text: "x = 6 (old)", tone: "warn" },
      { kind: "verdict", at: 5.3, text: "Hint lost: C stays behind", tone: "bad" },
    ],
    loop: 8.3,
  },
};
