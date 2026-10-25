import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 4, chapter 4.4 beat 1: fix the time box first, then fit the scope to it.
// Fictional people; the picture is a story, not data.
export const careerM4FixedBox: SceneSpec = {
  kind: "scene",
  title: "Fix the time, flex the scope",
  purpose: "Areej fixes her time box first: 6 weeks at about 5 hours a week. The scope is then shaped to fit. The core flow goes in; supplier ordering, many shops and a mobile app stay out.",
  limits: "Areej is a fictional fellow. This is a planning habit from a public book on shaping work, used here as a way to decide scope. It is not a prediction that any plan will finish on time.",
  hint: "The box does not change. The scope does.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "box", label: "Time box", kind: "clock", sub: "6 wk, 30 h", x: 62, y: 110 },
      { id: "scope", label: "Scope", kind: "note", sub: "flexes", x: 358, y: 110 },
      { id: "plan", label: "The plan", kind: "note", sub: "fits the box", x: 210, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "scope", to: "plan", label: "core flow" },
      { kind: "say", at: 1.4, actor: "plan", text: "fits", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1, from: "scope", to: "plan", label: "supplier orders" },
      { kind: "say", at: 3.5, actor: "plan", text: "too much", tone: "bad" },
      { kind: "say", at: 3.9, actor: "scope", text: "cut for later", tone: "warn" },
      { kind: "verdict", at: 4.6, text: "Fix the time, flex the scope", tone: "accent" },
    ],
    loop: 8,
  },
};
