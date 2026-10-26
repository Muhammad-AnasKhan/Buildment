import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 7.3 beat 5: bots, like groups and fake accounts go to LinkedIn and get a restriction. Card register; checked 2026-10.
export const careerM7RulesForbid: SceneSpec = {
  kind: "scene",
  title: "What the rules forbid",
  purpose: "Auto-comment tools, groups that agree in advance to like each other's posts, and fake accounts all go to LinkedIn. It answers with a restriction. The honest way is slower, and it is the only one this course teaches.",
  limits: "Checked 2026-10; rules change, and if your screen differs, follow your screen. The picture simplifies the policies, which also cover other things. LinkedIn does not use the word pod.",
  hint: "Three things you may not do.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "tools", label: "Bots, tools", kind: "worker", sub: "auto-comment", x: 62, y: 105 },
      { id: "group", label: "Like groups", kind: "user", sub: "agree to like", x: 210, y: 105 },
      { id: "fake", label: "Fake user", kind: "note", sub: "not a person", x: 358, y: 105 },
      { id: "linkedin", label: "LinkedIn", kind: "server", sub: "checks rules", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "tools", to: "linkedin", label: "auto-commenting" },
      { kind: "fly", at: 1.5, dur: 1, from: "group", to: "linkedin", label: "pre-agreed likes" },
      { kind: "fly", at: 2.7, dur: 1, from: "fake", to: "linkedin", label: "fake account" },
      { kind: "say", at: 3.9, actor: "linkedin", text: "restricted", tone: "bad" },
      { kind: "verdict", at: 4.6, text: "These get an account restricted", tone: "bad" },
    ],
    loop: 8.5,
  },
};
