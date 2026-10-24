import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 23.4 beat 3: A count-min sketch adds one to a cell in every row and answers with the smallest cell.
export const sysdesignM23SketchCount: SceneSpec = {
  kind: "scene",
  title: "A count-min sketch answers with the smallest of its cells",
  purpose: "Each search adds one to one cell in each of three rows. To ask how often shoes was searched, read its three cells. Other queries share the cells, so each one can be too high. The smallest is the closest.",
  limits: "Three rows are drawn so the picture fits. A real sketch has thousands of cells in each row. Cells only go up, so an estimate is never below the true count, but it can be above it.",
  scene: {
    width: 420,
    height: 310,
    actors: [
      { id: "log", label: "Searches", kind: "queue", sub: "shoes, shirt..", x: 70, y: 180 },
      { id: "r1", label: "Row 1", kind: "database", sub: "cell 7", x: 350, y: 90 },
      { id: "r2", label: "Row 2", kind: "database", sub: "cell 3", x: 350, y: 180 },
      { id: "r3", label: "Row 3", kind: "database", sub: "cell 9", x: 350, y: 270 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "log", to: "r1", label: "shoes" },
      { kind: "fly", at: 0.5, dur: 0.7, from: "log", to: "r2", label: "shoes" },
      { kind: "fly", at: 0.7, dur: 0.7, from: "log", to: "r3", label: "shoes" },
      { kind: "say", at: 1.5, actor: "r1", text: "cell 7: +1", tone: "accent" },
      { kind: "say", at: 1.6, actor: "r2", text: "cell 3: +1", tone: "accent" },
      { kind: "say", at: 1.7, actor: "r3", text: "cell 9: +1", tone: "accent" },
      { kind: "fly", at: 2.8, dur: 0.8, from: "r1", to: "log", label: "41", tone: "warn" },
      { kind: "fly", at: 3.0, dur: 0.8, from: "r2", to: "log", label: "12", tone: "good" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "r3", to: "log", label: "30", tone: "warn" },
      { kind: "say", at: 4.0, actor: "r1", text: "shared: 41", tone: "warn" },
      { kind: "say", at: 4.1, actor: "r2", text: "unshared: 12", tone: "good" },
      { kind: "say", at: 4.2, actor: "r3", text: "shared: 30", tone: "warn" },
      { kind: "verdict", at: 4.5, text: "Estimate: the smallest, 12", tone: "good" },
    ],
    loop: 8,
  },
};
