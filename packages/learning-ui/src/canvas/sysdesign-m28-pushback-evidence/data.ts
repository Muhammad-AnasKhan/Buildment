import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 28.3 beat 3: the interviewer prefers one database. The candidate answers with a number, not with pride.
export const sysdesignM28PushbackEvidence: SceneSpec = {
  kind: "scene",
  title: "Answer a view with a number",
  purpose: "The interviewer asks why not one database. The candidate does the sum: 101,000 operations a second against a node planned for 2,500.",
  limits: "One database is a good answer at a small size. The sum only says it is wrong at Wasla's peak. At 100 times less traffic the interviewer would be right, and the candidate should say so.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "interviewer", label: "Interviewer", kind: "user", sub: "disagrees", x: 62, y: 110 },
      { id: "candidate", label: "Candidate", kind: "user", sub: "has a sum", x: 358, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "interviewer", to: "candidate", label: "why not one db?" },
      { kind: "say", at: 1.2, actor: "candidate", text: "do the sum", tone: "accent" },
      { kind: "fly", at: 1.4, dur: 0.9, from: "candidate", to: "interviewer", label: "101,000 ops/s" },
      { kind: "fly", at: 2.4, dur: 0.9, from: "candidate", to: "interviewer", label: "one node: 2,500" },
      { kind: "say", at: 3.3, actor: "candidate", text: "40x its plan", tone: "bad" },
      { kind: "say", at: 3.6, actor: "interviewer", text: "fair, go on", tone: "good" },
      { kind: "verdict", at: 3.8, text: "Answer a view with a number", tone: "good" },
    ],
    loop: 7.5,
  },
};
