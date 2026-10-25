import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.2 beat 4: a long sentence with hidden verbs against three short ones.
// Fictional people only. No dashes.

export const careerM8PlainWords: SceneSpec = {
  kind: "scene",
  title: "Plain words, short sentences",
  purpose: "A long sentence with hidden verbs makes a tired reader read it twice. The same idea in three short sentences with active verbs is understood the first time.",
  limits: "Government plain-language guidance, not a trial. Plain does not mean childish: a precise term still belongs where it is needed. Checked 2026-10.",
  hint: "Same idea, two ways.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "long",
        label: "Long sentence",
        kind: "note",
        sub: "hidden verbs",
        x: 62,
        y: 110
      },
      {
        id: "short",
        label: "Three short",
        kind: "note",
        sub: "active verbs",
        x: 358,
        y: 110
      },
      {
        id: "reader",
        label: "Tired reader",
        kind: "user",
        sub: "end of the day",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "long",
        to: "reader",
        label: "conduct analysis"
      },
      {
        kind: "say",
        at: 1.4,
        actor: "reader",
        text: "re-reads it",
        tone: "warn"
      },
      {
        kind: "fly",
        at: 2.6,
        dur: 1,
        from: "short",
        to: "reader",
        label: "we analysed it"
      },
      {
        kind: "say",
        at: 3.7,
        actor: "reader",
        text: "gets it",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.4,
        text: "Write for a tired colleague",
        tone: "good"
      }
    ],
    loop: 8
  }
};
