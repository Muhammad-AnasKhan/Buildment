import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.2 beat 6: one choice with its buy, its cost and its switch point, then one failure.
export const sysdesignM28CloseTheRound: SceneSpec = {
  kind: "scene",
  title: "End with one cost and one failure",
  purpose: "The candidate states a choice, what it buys, what it costs and when to switch. The interviewer asks what breaks, and the candidate names a failure and its fix.",
  limits: "The 302 and the empty cache are the Wasla examples from chapter 20.4. A real round may ask for a different choice or failure.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "candidate", label: "Candidate", kind: "user", sub: "defends it", x: 62, y: 120 },
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "listens", x: 358, y: 120 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "candidate", to: "interviewer", label: "choice: a 302" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "candidate", to: "interviewer", label: "buys: every click" },
      { kind: "fly", at: 1.9, dur: 0.8, from: "candidate", to: "interviewer", label: "costs: a hop more" },
      { kind: "fly", at: 2.7, dur: 0.8, from: "candidate", to: "interviewer", label: "switch: no counting" },
      { kind: "say", at: 3.5, actor: "interviewer", text: "what breaks?", tone: "warn" },
      { kind: "say", at: 4.0, actor: "candidate", text: "cache restart", tone: "bad" },
      { kind: "fly", at: 4.2, dur: 0.8, from: "candidate", to: "interviewer", label: "spread the cache" },
      { kind: "say", at: 5.0, actor: "interviewer", text: "clear answer", tone: "good" },
      { kind: "verdict", at: 5.2, text: "Choice, cost, switch, failure", tone: "good" },
    ],
    loop: 8.5,
  },
};
