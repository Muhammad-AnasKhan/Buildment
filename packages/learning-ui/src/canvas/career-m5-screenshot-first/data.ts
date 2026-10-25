import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.4 beat 5: Screenshot first on weak data.
// A light demo page: screenshot first, video on tap, size stated, no autoplay.

export const careerM5ScreenshotFirst: SceneSpec = {
  kind: "scene",
  title: "Screenshot first on weak data",
  purpose: "A reader on weak data opens a light demo page that shows a screenshot first. A link says 'watch the 90-second demo' and states its size. Nothing plays until the reader taps.",
  limits: "The 90 seconds and the size are this example's numbers; state the real size of your own file. This is a platform authoring rule, not a research finding.",
  hint: "A light page, video on request.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "reader",
        label: "Reader",
        kind: "user",
        sub: "weak data",
        x: 62,
        y: 110
      },
      {
        id: "page",
        label: "Demo page",
        kind: "note",
        sub: "image first",
        x: 358,
        y: 110
      },
      {
        id: "video",
        label: "90 s demo",
        kind: "note",
        sub: "size stated",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "reader",
        to: "page",
        label: "opens fast"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "page",
        text: "no autoplay",
        tone: "good"
      },
      {
        kind: "fly",
        at: 2.4,
        dur: 1,
        from: "reader",
        to: "video",
        label: "tap to watch"
      },
      {
        kind: "say",
        at: 3.5,
        actor: "video",
        text: "plays on tap",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "Light page, video on request",
        tone: "good"
      }
    ],
    loop: 8
  },
};
