import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 10.5 beat 5: a slow clock stays behind the stamp it received. The time
// part holds at 100 and the counter climbs until the clock passes 100.
export const sysdesignM10HlcCatchUp: SceneSpec = {
  kind: "scene",
  title: "The counter climbs until the clock catches up",
  purpose: "After B's receive at (100, 1), its own clock reads 80, then 92, then 105. The time part stays 100 and the counter counts 2 and 3, then the clock passes 100 and the counter resets to 0.",
  limits: "The same three nodes and numbers as the previous beats. The time part can run ahead of a node's own clock, but not by more than the skew between clocks (S59). The counter stays small because the clock soon catches up.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "clock", label: "B's clock", kind: "clock", sub: "reads 70", x: 70, y: 100 },
      { id: "hlc", label: "B's stamp", kind: "server", sub: "(100, 1)", x: 350, y: 100 },
    ],
    strip: { y: 300, from: 60, to: 120, unit: "ms", caption: "B's own clock reading", every: 10 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 70, label: "(100,1)", tone: "warn" },
      { kind: "say", at: 1.2, actor: "clock", text: "reads 80" },
      { kind: "fly", at: 1.3, dur: 0.8, from: "clock", to: "hlc", label: "event" },
      { kind: "say", at: 2.1, actor: "hlc", text: "(100, 2)", tone: "warn" },
      { kind: "tag", at: 2.1, row: 1, value: 80, label: "(100,2)", tone: "warn" },
      { kind: "say", at: 2.8, actor: "clock", text: "reads 92" },
      { kind: "fly", at: 2.9, dur: 0.8, from: "clock", to: "hlc", label: "event" },
      { kind: "say", at: 3.7, actor: "hlc", text: "(100, 3)", tone: "warn" },
      { kind: "tag", at: 3.7, row: 0, value: 92, label: "(100,3)", tone: "warn" },
      { kind: "say", at: 4.4, actor: "clock", text: "reads 105" },
      { kind: "fly", at: 4.5, dur: 0.8, from: "clock", to: "hlc", label: "event" },
      { kind: "say", at: 5.3, actor: "hlc", text: "(105, 0)", tone: "good" },
      { kind: "tag", at: 5.3, row: 1, value: 105, label: "(105,0)", tone: "good" },
      { kind: "verdict", at: 5.7, text: "Clock catches up: counter resets", tone: "good" },
    ],
    loop: 9.2,
  },
};
