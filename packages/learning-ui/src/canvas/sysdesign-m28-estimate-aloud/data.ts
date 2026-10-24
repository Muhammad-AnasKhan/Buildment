import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.2 beat 3: each step of the sum is said with its unit and written on the board.
export const sysdesignM28EstimateAloud: SceneSpec = {
  kind: "scene",
  title: "Say each step of the sum, with its unit",
  purpose: "The candidate turns 500 million links a month into creates a second, opens a second and a peak, saying each step and writing the result on the board.",
  limits: "The numbers are the Wasla estimate from module 20: 500 million new links a month, 100 opens per link, a busiest second 5 times the average, and 2.6 million seconds in a month. All are course assumptions.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "candidate", label: "Candidate", kind: "user", sub: "says each step", x: 62, y: 120 },
      { id: "board", label: "Board", kind: "note", sub: "empty", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "candidate", to: "board", label: "500M links/mo" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "candidate", to: "board", label: "/ 2.6M seconds" },
      { kind: "say", at: 2.2, actor: "board", text: "193 creates/s", tone: "accent" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "candidate", to: "board", label: "x 100 opens" },
      { kind: "say", at: 3.3, actor: "board", text: "19,300 opens/s", tone: "accent" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "candidate", to: "board", label: "x 5 for peak" },
      { kind: "say", at: 4.4, actor: "board", text: "96,500 at peak", tone: "warn" },
      { kind: "mark", at: 4.4, actor: "board", tone: "warn" },
      { kind: "say", at: 4.6, actor: "candidate", text: "opens drive it", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Say the unit, then the number", tone: "good" },
    ],
    loop: 8,
  },
};
