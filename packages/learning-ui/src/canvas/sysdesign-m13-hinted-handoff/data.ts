import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 13.3 beat 2: A stand-in node holds the write and hands it over later.
export const sysdesignM13HintedHandoff: SceneSpec = {
  kind: "scene",
  title: "A stand-in node holds the write and hands it over later",
  purpose: "Node C is down. The write goes to A, B and a stand-in, D, with a note: this belongs to C. When C is back, D hands the write over and drops the note.",
  limits: "One key and one hint. A real node checks its hints on a timer and keeps them apart from its own data.",
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
      { kind: "fly", at: 2.3, dur: 0.7, from: "a", to: "client", label: "OK", tone: "good" },
      { kind: "say", at: 3.4, actor: "c", text: "back up", tone: "accent" },
      { kind: "fly", at: 3.9, dur: 1.4, from: "d", to: "c", label: "hint: x = 7" },
      { kind: "say", at: 5.3, actor: "c", text: "x = 7", tone: "good" },
      { kind: "say", at: 5.3, actor: "d", text: "hint dropped", tone: "good" },
      { kind: "verdict", at: 5.6, text: "C caught up through the hint", tone: "good" },
    ],
    loop: 8.6,
  },
};
