import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.1 beat 1: A GitHub link nobody opens.
// Moath sends a founder a link; the README starts with install steps and the founder moves on.

export const careerM5LinkNobodyOpens: SceneSpec = {
  kind: "scene",
  title: "A GitHub link nobody opens",
  purpose: "Moath sends a founder a link to his recipe app's repository. The README starts with install commands. The founder moves on without cloning it.",
  limits: "Moath is a fictional fellow. The picture does not say every founder behaves this way. It shows what a README that starts with install steps asks of a reader.",
  hint: "A link, a README, a reader who moves on.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "moath",
        label: "Moath",
        kind: "user",
        sub: "sent the link",
        x: 62,
        y: 110
      },
      {
        id: "founder",
        label: "Founder",
        kind: "user",
        sub: "reads mail",
        x: 358,
        y: 110
      },
      {
        id: "repo",
        label: "README",
        kind: "note",
        sub: "install first",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "moath",
        to: "founder",
        label: "GitHub link"
      },
      {
        kind: "fly",
        at: 1.6,
        dur: 1,
        from: "founder",
        to: "repo",
        label: "open it"
      },
      {
        kind: "say",
        at: 2.7,
        actor: "repo",
        text: "install steps",
        tone: "warn"
      },
      {
        kind: "say",
        at: 3.4,
        actor: "founder",
        text: "moves on",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "The founder never ran it",
        tone: "bad"
      }
    ],
    loop: 8
  },
};
