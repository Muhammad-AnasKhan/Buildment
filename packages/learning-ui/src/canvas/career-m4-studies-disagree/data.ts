import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.2 beat 1: four studies of AI coding tools, direction only, no speed number.
// Fictional people; the picture is a story, not data.
export const careerM4StudiesDisagree: SceneSpec = {
  kind: "scene",
  title: "Studies of AI coding tools disagree",
  purpose: "Four studies of AI coding tools are shown side by side: faster on one small task, more tasks done in company trials, slower for experienced developers on their own code, and a follow-up too weak to size.",
  limits: "Direction only, by design. The studies differ in tasks, people and tools, and the tools change quickly. Nothing here is a promise about how fast you will work with AI.",
  hint: "Four studies, four answers.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "small", label: "Small task", kind: "note", sub: "one study", x: 62, y: 110 },
      { id: "trials", label: "Field trials", kind: "note", sub: "three firms", x: 358, y: 110 },
      { id: "own", label: "Own repos", kind: "note", sub: "experienced", x: 62, y: 240 },
      { id: "followup", label: "Follow-up", kind: "note", sub: "later study", x: 358, y: 240 },
    ],
    events: [
      { kind: "say", at: 0.8, actor: "small", text: "faster", tone: "good" },
      { kind: "say", at: 1.8, actor: "trials", text: "more tasks", tone: "good" },
      { kind: "say", at: 2.8, actor: "own", text: "took longer", tone: "bad" },
      { kind: "say", at: 3.8, actor: "followup", text: "too weak to use", tone: "warn" },
      { kind: "verdict", at: 4.8, text: "Studies disagree. No speed promise.", tone: "warn" },
    ],
    loop: 8.5,
  },
};
