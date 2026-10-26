import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 9, chapter 9.2 beat 5: when the feedback is wrong.
// A "jargon without explanation" flag lands on "composite index". Areej keeps the term for engineering
// readers and explains it in her case study. Card register. Areej is a fictional fellow.
export const careerM9KeepTheTerm: SceneSpec = {
  kind: "scene",
  title: "When the feedback is wrong",
  purpose: "A 'jargon' flag lands on 'composite index'. Areej decides to keep the term for engineering readers, and sends the explanation to her case study. The decision is hers, with a reason.",
  limits: "A flag is feedback, not a rule, but a flag you reject needs a reason a reader can follow. The mentor's review counts alongside any tool. The companion course, The Founder Interview, teaches reading feedback critically.",
  hint: "A flag you keep needs a reason.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "flag", label: "Flag: jargon", kind: "note", sub: "composite index", x: 62, y: 110 },
      { id: "areej", label: "Areej", kind: "user", sub: "decides", x: 358, y: 110 },
      { id: "case", label: "Case study", kind: "note", sub: "explains it", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1.0, from: "flag", to: "areej", label: "explain it?" },
      { kind: "say", at: 1.4, actor: "areej", text: "keeps the term", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1.0, from: "areej", to: "case", label: "explain there" },
      { kind: "say", at: 3.5, actor: "case", text: "term explained", tone: "good" },
      { kind: "verdict", at: 4.2, text: "You decide, with reasons", tone: "accent" },
    ],
    loop: 8,
  },
};
