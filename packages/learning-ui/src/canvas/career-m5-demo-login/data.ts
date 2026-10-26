import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.3 beat 3: A demo login that opens every core feature.
// A Try the demo button opens the full app on a fake shop (Areej's Raqim Stock plan).

export const careerM5DemoLogin: SceneSpec = {
  kind: "scene",
  title: "A demo login that opens every core feature",
  purpose: "A stranger taps 'Try the demo' and the app opens on a fake shop with fake stock. Every core feature works, the account has small rights, and the owner's real rights stay out.",
  limits: "A demo login is only safe with the controls in the next picture: fake data, low rights, limits with a reset, and no real keys.",
  hint: "One tap into the app.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "stranger",
        label: "Stranger",
        kind: "user",
        sub: "wants a look",
        x: 62,
        y: 110
      },
      {
        id: "button",
        label: "Try the demo",
        kind: "note",
        sub: "one button",
        x: 358,
        y: 110
      },
      {
        id: "app",
        label: "Raqim Stock",
        kind: "phone",
        sub: "fake shop",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "stranger",
        to: "button",
        label: "tap"
      },
      {
        kind: "fly",
        at: 1.6,
        dur: 1,
        from: "button",
        to: "app",
        label: "opens"
      },
      {
        kind: "say",
        at: 2.5,
        actor: "app",
        text: "fake stock",
        tone: "good"
      },
      {
        kind: "say",
        at: 3.2,
        actor: "button",
        text: "small rights",
        tone: "good"
      },
      {
        kind: "say",
        at: 3.9,
        actor: "stranger",
        text: "tries every feature",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.6,
        text: "A demo login that opens the core",
        tone: "good"
      }
    ],
    loop: 8
  },
};
