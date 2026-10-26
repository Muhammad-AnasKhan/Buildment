import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.1 beat 2: Diala's template site has stock photos, no dates and no numbers.
// Fictional people only. No dashes.

export const careerM8TemplateSite: SceneSpec = {
  kind: "scene",
  title: "A website nobody believes",
  purpose: "Diala's personal site came from a template. It has stock photos, no dates and no numbers, and says 'I am a passionate DevOps engineer who loves solving problems'. A visitor wants proof and finds none.",
  limits: "A template is not wrong; this one has no specifics. The picture does not claim every visitor reacts this way.",
  hint: "A site with nothing only she could say.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "visitor",
        label: "Visitor",
        kind: "user",
        sub: "wants proof",
        x: 62,
        y: 110
      },
      {
        id: "site",
        label: "Her site",
        kind: "note",
        sub: "from a template",
        x: 358,
        y: 110
      },
      {
        id: "line",
        label: "Intro line",
        kind: "note",
        sub: "I am passionate",
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
        label: "who is she?"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "site",
        text: "stock photos",
        tone: "warn"
      },
      {
        kind: "say",
        at: 2,
        actor: "site",
        text: "no dates",
        tone: "warn"
      },
      {
        kind: "say",
        at: 2.6,
        actor: "site",
        text: "no numbers",
        tone: "bad"
      },
      {
        kind: "say",
        at: 3.3,
        actor: "line",
        text: "anyone's line",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 4,
        text: "A site nobody believes",
        tone: "bad"
      }
    ],
    loop: 8
  }
};
