import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 2, chapter 2.4 (spec beat 5): Labels a founder cannot check
// Data copied from canvas-specs/career-m2-labels-fade.md. Characters and numbers are fictional and illustrative.

export const careerM2LabelsFade: SceneSpec = {
  kind: "scene",
  title: "Labels a founder cannot check",
  purpose: "A founder tries to check a personality-type badge, an ikigai circle and a proof card. The first two cannot be checked. The proof card can.",
  limits: "We did not check evidence that personality labels or ikigai circles help in hiring, and a founder cannot verify them. Strengths exercises can help you feel engaged (small to moderate effects on wellbeing in studies); they say nothing about how an employer reads a strengths line.",
  hint: "Watch what the founder can check.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "founder", label: "Founder", kind: "user", sub: "checking", x: 210, y: 105 },
      { id: "badge", label: "Type badge", kind: "note", sub: "a 4-letter code", x: 62, y: 250 },
      { id: "circle", label: "Ikigai circle", kind: "note", sub: "four overlaps", x: 210, y: 250 },
      { id: "proof", label: "Proof card", kind: "note", sub: "a real result", x: 358, y: 250 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 1, from: "founder", to: "badge", label: "check this" },
      { kind: "say", at: 1.4, actor: "badge", text: "cannot check", tone: "bad" },
      { kind: "fly", at: 2.4, dur: 1, from: "founder", to: "circle", label: "check this" },
      { kind: "say", at: 3.5, actor: "circle", text: "cannot check", tone: "bad" },
      { kind: "fly", at: 4.5, dur: 1, from: "founder", to: "proof", label: "check this" },
      { kind: "say", at: 5.6, actor: "proof", text: "can check", tone: "good" },
      { kind: "mark", at: 5.6, actor: "proof", tone: "good" },
      { kind: "verdict", at: 6.2, text: "Keep what a founder can check", tone: "good" },
    ],
    loop: 10,
  },
};
