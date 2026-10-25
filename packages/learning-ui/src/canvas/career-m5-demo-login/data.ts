import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.3 beat 3: A demo login that can do everything.
// A Try the demo button opens the full app on a fake shop (Areej's Raqim Stock plan).

export const careerM5DemoLogin: SceneSpec = {
  kind: "scene",
  title: "A demo login that can do everything",
  purpose: "A stranger taps 'Try the demo' and the full app opens on a fake shop with fake stock. Every core feature works, and nothing in it belongs to a real person.",
  limits: "Areej is a fictional fellow. A demo that can do everything is only safe with the controls in the next beat: fake data, low rights, limits and a reset, and no real keys.",
  hint: "One tap into the full app.",
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
        at: 2.7,
        actor: "app",
        text: "fake stock",
        tone: "good"
      },
      {
        kind: "say",
        at: 3.4,
        actor: "stranger",
        text: "can try it all",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "A demo login that does everything",
        tone: "good"
      }
    ],
    loop: 8
  },
};
