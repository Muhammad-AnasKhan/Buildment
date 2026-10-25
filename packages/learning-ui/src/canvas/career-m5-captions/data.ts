import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.4 beat 4: Captions, because many watch muted.
// A viewer with the sound off still follows because of captions.

export const careerM5Captions: SceneSpec = {
  kind: "scene",
  title: "Captions, because many watch muted",
  purpose: "A viewer watches the demo on a phone with the sound off. Captions on the screen say what is happening, so the viewer still follows.",
  limits: "Viewers may watch without sound is this course's observation, not a measured share. Captions are also a basic accessibility practice.",
  hint: "Sound off, words on.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "viewer",
        label: "Viewer",
        kind: "user",
        sub: "sound off",
        x: 62,
        y: 110
      },
      {
        id: "phone",
        label: "Demo frame",
        kind: "phone",
        sub: "captioned",
        x: 358,
        y: 110
      },
      {
        id: "captions",
        label: "Captions",
        kind: "note",
        sub: "say it in words",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "viewer",
        to: "phone",
        label: "watches"
      },
      {
        kind: "fly",
        at: 1.6,
        dur: 1,
        from: "captions",
        to: "phone",
        label: "words on screen"
      },
      {
        kind: "say",
        at: 2.8,
        actor: "viewer",
        text: "still follows",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 3.5,
        text: "Captions help when sound is off",
        tone: "good"
      }
    ],
    loop: 7.5
  },
};
