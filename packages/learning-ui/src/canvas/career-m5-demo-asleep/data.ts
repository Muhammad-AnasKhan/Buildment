import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.5 beat 6: It still works when the demo sleeps.
// The live demo is asleep; the static case study page opens at once.

export const careerM5DemoAsleep: SceneSpec = {
  kind: "scene",
  title: "It still works when the demo sleeps",
  purpose: "A reader's phone opens the live demo and finds it asleep. It then opens the case study page, which shows the before and after plans and the chart straight away, with no login.",
  limits: "The case study page becomes a website page in module 8 and a resume link in module 6. A static page can still be moved or deleted, so keep a copy of the images and check the link on a phone before you share it.",
  hint: "The demo is asleep. The page is not.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "phone",
        label: "Phone",
        kind: "phone",
        sub: "no login",
        x: 62,
        y: 110
      },
      {
        id: "demo",
        label: "Live demo",
        kind: "server",
        sub: "asleep",
        x: 358,
        y: 110
      },
      {
        id: "page",
        label: "Case study",
        kind: "note",
        sub: "static page",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "phone",
        to: "demo",
        label: "open demo"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "demo",
        text: "still asleep",
        tone: "warn"
      },
      {
        kind: "fly",
        at: 2.4,
        dur: 1,
        from: "phone",
        to: "page",
        label: "open page"
      },
      {
        kind: "say",
        at: 3.5,
        actor: "page",
        text: "opens at once",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "The base layer still works",
        tone: "good"
      }
    ],
    loop: 8
  },
};
