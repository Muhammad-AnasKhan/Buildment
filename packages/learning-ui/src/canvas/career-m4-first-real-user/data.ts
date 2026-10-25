import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.4 beat 5: the first real user milestone, one real week of sales by the end of week 3.
// Fictional people; the picture is a story, not data.
export const careerM4FirstRealUser: SceneSpec = {
  kind: "scene",
  title: "The first real user milestone",
  purpose: "By the end of week 3 of Areej's 6-week box, the print shop owner records one real week of sales in Raqim Stock. That is the first proof the tool is used.",
  limits: "Areej is a fictional fellow and the plan is illustrative. A first real user is a start, not a result. The number to move still needs its two months of data.",
  hint: "A flag at week 3.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "owner", label: "Shop owner", kind: "user", sub: "records sales", x: 62, y: 110 },
      { id: "tool", label: "Raqim Stock", kind: "phone", sub: "in real use", x: 358, y: 110 },
    ],
    strip: { y: 275, from: 0, to: 6, unit: "wk", caption: "the 6-week time box", every: 1 },
    events: [
      { kind: "tag", at: 0.3, row: 0, value: 3, label: "wk 3: owner's week", tone: "accent" },
      { kind: "fly", at: 1, dur: 1, from: "owner", to: "tool", label: "a real sale" },
      { kind: "fly", at: 2.3, dur: 1, from: "owner", to: "tool", label: "a real sale" },
      { kind: "say", at: 3.5, actor: "tool", text: "real data", tone: "good" },
      { kind: "verdict", at: 4.2, text: "Find one real user early", tone: "good" },
    ],
    loop: 8,
  },
};
