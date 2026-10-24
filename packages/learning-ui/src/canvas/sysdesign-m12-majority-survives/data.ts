import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.3 beat 3 (Five nodes, two can fail).
export const sysdesignM12MajoritySurvives: SceneSpec = {
  kind: "scene",
  title: "Five nodes keep working with two down, and stop with three",
  purpose: "With N4 and N5 down, 3 of 5 acknowledge a write, which is a majority. When N3 also goes down, only 2 of 5 can answer and the cluster stops instead of guessing.",
  limits: "One writer node and a simple write. A real cluster also needs to choose who writes. Stopping is the safe choice: any smaller group could disagree with a group on the other side of a split.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "n1", label: "N1", kind: "server", sub: "writer", x: 60, y: 100 },
      { id: "n2", label: "N2", kind: "server", sub: "up", x: 210, y: 100 },
      { id: "n3", label: "N3", kind: "server", sub: "up", x: 360, y: 100 },
      { id: "n4", label: "N4", kind: "server", sub: "up", x: 135, y: 190 },
      { id: "n5", label: "N5", kind: "server", sub: "up", x: 285, y: 190 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "n4", text: "down", tone: "bad" },
      { kind: "say", at: 0.3, actor: "n5", text: "down", tone: "bad" },
      { kind: "mark", at: 0.3, actor: "n4", tone: "bad" },
      { kind: "mark", at: 0.3, actor: "n5", tone: "bad" },
      { kind: "fly", at: 1.2, dur: 1, from: "n1", to: "n2", label: "write" },
      { kind: "fly", at: 1.2, dur: 1, from: "n1", to: "n3", label: "write" },
      { kind: "say", at: 2.3, actor: "n2", text: "stored", tone: "good" },
      { kind: "say", at: 2.3, actor: "n3", text: "stored", tone: "good" },
      { kind: "say", at: 2.6, actor: "n1", text: "3 of 5 have it", tone: "good" },
      { kind: "verdict", at: 3, text: "3 of 5 is a majority: it works", tone: "good" },
      { kind: "say", at: 4.7, actor: "n3", text: "down", tone: "bad" },
      { kind: "mark", at: 4.7, actor: "n3", tone: "bad" },
      { kind: "fly", at: 5.3, dur: 1, from: "n1", to: "n2", label: "write" },
      { kind: "say", at: 6.4, actor: "n2", text: "stored #2", tone: "good" },
      { kind: "say", at: 6.7, actor: "n1", text: "only 2 of 5", tone: "bad" },
      { kind: "verdict", at: 7.1, text: "2 of 5 is no majority: it stops", tone: "bad" },
    ],
    loop: 10,
  },
};
