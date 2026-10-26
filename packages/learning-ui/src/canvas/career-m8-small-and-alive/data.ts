import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.4 beat 5: a small site with a dated case study and dated posts looks alive.
// Fictional people only. No dashes.

export const careerM8SmallAndAlive: SceneSpec = {
  kind: "scene",
  title: "Small, dated and alive",
  purpose: "A visitor finds a small site with a dated case study, dated posts and the originals living there. It looks active. One small update a month is enough.",
  limits: "A course suggestion, not research. Do not post just to look busy; a small real update is enough.",
  hint: "Small, dated and alive.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "visitor",
        label: "Visitor",
        kind: "user",
        sub: "checks it out",
        x: 62,
        y: 110
      },
      {
        id: "site",
        label: "Your site",
        kind: "note",
        sub: "updated monthly",
        x: 358,
        y: 110
      },
      {
        id: "post",
        label: "Case + post",
        kind: "note",
        sub: "originals here",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "visitor",
        to: "site",
        label: "visits"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "site",
        text: "dated posts",
        tone: "good"
      },
      {
        kind: "say",
        at: 2.2,
        actor: "post",
        text: "originals here",
        tone: "good"
      },
      {
        kind: "say",
        at: 3,
        actor: "visitor",
        text: "looks active",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 3.8,
        text: "Small, dated and alive",
        tone: "good"
      }
    ],
    loop: 7.5
  }
};
