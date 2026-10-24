import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.2 beat 2: four short questions fix the scope, and the answers go on the board.
export const sysdesignM28ClarifyAloud: SceneSpec = {
  kind: "scene",
  title: "Four short questions fix the scope",
  purpose: "The candidate asks who uses the service, how many, what is out of scope and how fast. Each answer goes on the board.",
  limits: "A real interviewer may answer 'you decide'. Then you pick an assumption, say it out loud and move on. The answers here are the Wasla scope from module 20.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "candidate", label: "Candidate", kind: "user", sub: "asks first", x: 62, y: 110 },
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "answers", x: 358, y: 110 },
      { id: "board", label: "Board", kind: "note", sub: "empty", x: 210, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "candidate", to: "interviewer", label: "who uses it?" },
      { kind: "say", at: 1.0, actor: "interviewer", text: "public links", tone: "accent" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "candidate", to: "interviewer", label: "how many?" },
      { kind: "say", at: 1.9, actor: "interviewer", text: "500M a month", tone: "accent" },
      { kind: "fly", at: 2.1, dur: 0.7, from: "candidate", to: "interviewer", label: "what is out?" },
      { kind: "say", at: 2.8, actor: "interviewer", text: "no accounts", tone: "accent" },
      { kind: "fly", at: 3.0, dur: 0.7, from: "candidate", to: "interviewer", label: "how fast?" },
      { kind: "say", at: 3.7, actor: "interviewer", text: "under 20 ms", tone: "accent" },
      { kind: "fly", at: 3.9, dur: 0.9, from: "candidate", to: "board", label: "write it down" },
      { kind: "say", at: 4.8, actor: "board", text: "4 answers", tone: "good" },
      { kind: "mark", at: 4.8, actor: "board", tone: "good" },
      { kind: "verdict", at: 5.0, text: "Four answers fix the scope", tone: "good" },
    ],
    loop: 8.5,
  },
};
