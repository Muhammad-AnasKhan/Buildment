import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.3 beat 4: the interviewer finds a real weakness. The candidate names it, then scopes it or fixes it.
export const sysdesignM28OwnTheFlaw: SceneSpec = {
  kind: "scene",
  title: "Name the flaw, then scope it or fix it",
  purpose: "The interviewer asks whether someone can guess another person's short code. With counter codes the answer is yes. The candidate says so, then ties it to the scope and offers a fix for private links.",
  limits: "This is the guessable-code point from chapter 20.3. In a real round the flaw may be a different one. The pattern is the same: name it, say its effect, choose scope or fix.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "found a gap", x: 62, y: 110 },
      { id: "candidate", label: "Candidate", kind: "user", sub: "stays calm", x: 358, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "interviewer", to: "candidate", label: "can I guess codes?" },
      { kind: "say", at: 1.2, actor: "candidate", text: "yes: counters", tone: "warn" },
      { kind: "fly", at: 1.5, dur: 0.9, from: "candidate", to: "interviewer", label: "scope: links public" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "candidate", to: "interviewer", label: "private: random" },
      { kind: "say", at: 3.5, actor: "interviewer", text: "good, noted", tone: "good" },
      { kind: "verdict", at: 3.7, text: "Own it: scope it or fix it", tone: "good" },
    ],
    loop: 7.5,
  },
};
