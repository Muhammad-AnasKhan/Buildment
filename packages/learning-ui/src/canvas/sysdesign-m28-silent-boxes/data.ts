import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.1 beat 1: Candidate A (a course composite) draws boxes for most of the round and never gives a number or a reason.
export const sysdesignM28SilentBoxes: SceneSpec = {
  kind: "scene",
  title: "Candidate A draws boxes and says nothing",
  purpose: "The interviewer asks for a link shortener. Candidate A draws boxes for the whole round. The strip shows the minutes passing with no numbers and no reasons.",
  limits: "Candidate A is a made-up composite, not a real person. The minute marks are a story, not a measurement. Real interviewers differ in what they say out loud.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "wants reasons", x: 62, y: 110 },
      { id: "candidate", label: "Candidate A", kind: "user", sub: "blank board", x: 358, y: 110 },
    ],
    strip: { y: 296, from: 0, to: 45, unit: "min", caption: "minutes into the round", every: 5 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "interviewer", to: "candidate", label: "Design Wasla" },
      { kind: "say", at: 1.2, actor: "candidate", text: "draws boxes", tone: "accent" },
      { kind: "tag", at: 1.4, row: 0, value: 3, label: "min 3: boxes", tone: "accent" },
      { kind: "tag", at: 2.0, row: 1, value: 18, label: "min 18: boxes", tone: "warn" },
      { kind: "say", at: 2.0, actor: "interviewer", text: "no numbers yet", tone: "warn" },
      { kind: "tag", at: 2.8, row: 0, value: 30, label: "min 30: no numbers", tone: "bad" },
      { kind: "say", at: 3.2, actor: "interviewer", text: "no reasons", tone: "bad" },
      { kind: "tag", at: 3.8, row: 1, value: 42, label: "min 42: no costs", tone: "bad" },
      { kind: "verdict", at: 4.4, text: "Many boxes, no numbers, no reasons", tone: "bad" },
    ],
    loop: 8,
  },
};
