import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.3 beat 1: a follow-up retests the numbers. Scale them, find the first break, fix it.
export const sysdesignM28RedoTheMaths: SceneSpec = {
  kind: "scene",
  title: "A follow-up retests your numbers",
  purpose: "The interviewer asks what happens at 10 times the traffic. The candidate multiplies the numbers on the board, finds the part that fails first, and names a fix.",
  limits: "The numbers are Wasla's from module 20: 100,000 opens a second, a 90% hit rate, 5 partitions planned at 2,500 operations a second each. At 10 times and the same hit rate each partition sees 22,000 a second, 8.8 times its plan.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "pushes", x: 62, y: 110 },
      { id: "candidate", label: "Candidate", kind: "user", sub: "does the sum", x: 358, y: 110 },
      { id: "board", label: "Board", kind: "note", sub: "100k opens/s", x: 210, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "interviewer", to: "candidate", label: "10x traffic?" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "candidate", to: "board", label: "x10 every number" },
      { kind: "say", at: 2.0, actor: "board", text: "1M opens/s", tone: "accent" },
      { kind: "fly", at: 2.2, dur: 0.8, from: "candidate", to: "board", label: "load / plan" },
      { kind: "say", at: 3.0, actor: "board", text: "db 8.8x plan", tone: "bad" },
      { kind: "mark", at: 3.0, actor: "board", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.8, from: "candidate", to: "interviewer", label: "fix: 99% hits" },
      { kind: "say", at: 4.0, actor: "interviewer", text: "and the cost?", tone: "warn" },
      { kind: "verdict", at: 4.2, text: "Scale it, find the break, fix it", tone: "good" },
    ],
    loop: 8,
  },
};
