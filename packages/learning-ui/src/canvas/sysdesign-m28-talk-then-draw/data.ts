import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.1 beat 2: Candidate B (a course composite) asks, says numbers, then draws, and every stage leaves evidence.
export const sysdesignM28TalkThenDraw: SceneSpec = {
  kind: "scene",
  title: "Candidate B asks, counts, then draws",
  purpose: "The same prompt, a different order. Candidate B asks about scope, says the numbers, and only then sketches, goes deep on one part and names a cost.",
  limits: "Candidate B is a made-up composite. The minute marks are a story, not a measurement. The numbers are the Wasla estimate from module 20.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "can follow", x: 62, y: 110 },
      { id: "candidate", label: "Candidate B", kind: "user", sub: "asks first", x: 358, y: 110 },
    ],
    strip: { y: 296, from: 0, to: 45, unit: "min", caption: "minutes into the round", every: 5 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "interviewer", to: "candidate", label: "Design Wasla" },
      { kind: "fly", at: 1.2, dur: 0.8, from: "candidate", to: "interviewer", label: "who uses it?" },
      { kind: "say", at: 2.0, actor: "interviewer", text: "create and open", tone: "good" },
      { kind: "tag", at: 2.1, row: 0, value: 5, label: "min 5: scope, numbers", tone: "good" },
      { kind: "say", at: 2.4, actor: "candidate", text: "100k opens/s", tone: "accent" },
      { kind: "tag", at: 3.0, row: 1, value: 12, label: "min 12: sketch", tone: "good" },
      { kind: "tag", at: 3.6, row: 1, value: 30, label: "min 30: deep dive", tone: "good" },
      { kind: "tag", at: 4.2, row: 0, value: 40, label: "min 40: cost, failure", tone: "good" },
      { kind: "say", at: 4.4, actor: "interviewer", text: "I can score it", tone: "good" },
      { kind: "verdict", at: 4.6, text: "Every step shows a reason", tone: "good" },
    ],
    loop: 8,
  },
};
