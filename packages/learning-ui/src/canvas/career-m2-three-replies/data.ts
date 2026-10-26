import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.1 (spec beat 2): Three people, one story
// Data copied from canvas-specs/career-m2-three-replies.md. Characters and numbers are fictional and illustrative.

export const careerM2ThreeReplies: SceneSpec = {
  kind: "scene",
  title: "Three people, one story",
  purpose: "Ruqaya asks three past colleagues for a time she did well. All three describe her turning messy research into one clear page. The repeated words are her first pillar.",
  limits: "Ruqaya is a fictional fellow. Three replies are a story, not a test. Asking others is a way to find your material, not a measure of how good you are.",
  hint: "Watch what the three replies have in common.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "c1", label: "Colleague 1", kind: "user", sub: "designer", x: 62, y: 105 },
      { id: "c2", label: "Colleague 2", kind: "user", sub: "researcher", x: 210, y: 105 },
      { id: "c3", label: "Colleague 3", kind: "user", sub: "manager", x: 358, y: 105 },
      { id: "ruqaya", label: "Ruqaya", kind: "user", sub: "asked all three", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "c1", to: "ruqaya", label: "research to a page" },
      { kind: "fly", at: 1.5, dur: 1, from: "c2", to: "ruqaya", label: "research to a page" },
      { kind: "fly", at: 2.7, dur: 1, from: "c3", to: "ruqaya", label: "research to a page" },
      { kind: "mark", at: 3.8, actor: "c1", tone: "good" },
      { kind: "mark", at: 3.8, actor: "c2", tone: "good" },
      { kind: "mark", at: 3.8, actor: "c3", tone: "good" },
      { kind: "say", at: 4, actor: "ruqaya", text: "first pillar", tone: "good" },
      { kind: "verdict", at: 4.6, text: "All three say the same thing", tone: "good" },
    ],
    loop: 8.5,
  },
};
