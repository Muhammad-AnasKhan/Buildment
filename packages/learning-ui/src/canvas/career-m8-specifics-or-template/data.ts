import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.4 beat 2: a template page and a specific page go to the same visitor. Checked 2026-10.
// Fictional people only. No dashes.

export const careerM8SpecificsOrTemplate: SceneSpec = {
  kind: "scene",
  title: "Specifics make it yours",
  purpose: "A visitor meets a template page with a stock photo and 'loves problems', and thinks it could be anyone's. Then the visitor meets a page with a real number and a real mistake, and believes it.",
  limits: "Checked 2026-10. This is a course method supported by Google's originality questions, not a guarantee about any search engine. Detectors misjudge second-language English, so passing one is not a goal.",
  hint: "Same visitor, two pages.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "template",
        label: "Template page",
        kind: "note",
        sub: "stock photo",
        x: 62,
        y: 110
      },
      {
        id: "specific",
        label: "Specific page",
        kind: "note",
        sub: "real screenshot",
        x: 358,
        y: 110
      },
      {
        id: "visitor",
        label: "Visitor",
        kind: "user",
        sub: "who wrote it?",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "template",
        to: "visitor",
        label: "loves problems"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "visitor",
        text: "could be anyone",
        tone: "warn"
      },
      {
        kind: "fly",
        at: 2.6,
        dur: 1,
        from: "specific",
        to: "visitor",
        label: "number, mistake"
      },
      {
        kind: "say",
        at: 3.7,
        actor: "visitor",
        text: "believes it",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.4,
        text: "Specifics make a site yours",
        tone: "good"
      }
    ],
    loop: 8
  }
};
