import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), 8.3 beat 5: one honest 'first published at' line on every copy.
// Fictional people only. No dashes.

export const careerM8FirstPublishedLine: SceneSpec = {
  kind: "scene",
  title: "One honest line on every copy",
  purpose: "A copy of the article on another platform gets a line at the top: 'First published at' and a link to Areej's site. Readers follow the link home.",
  limits: "Areej is a fictional fellow. This does not depend on any search engine, so it also works on platforms whose canonical settings are unverified. Cross-posting is for readers, not a ranking trick.",
  hint: "One line, one link home.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "line",
        label: "Top line",
        kind: "note",
        sub: "first published",
        x: 62,
        y: 110
      },
      {
        id: "copy",
        label: "A copy",
        kind: "note",
        sub: "on a platform",
        x: 358,
        y: 110
      },
      {
        id: "site",
        label: "Your site",
        kind: "note",
        sub: "the original",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "fly",
        at: 0.3,
        dur: 1,
        from: "line",
        to: "copy",
        label: "add at the top"
      },
      {
        kind: "fly",
        at: 1.6,
        dur: 1,
        from: "copy",
        to: "site",
        label: "link home"
      },
      {
        kind: "say",
        at: 2.8,
        actor: "site",
        text: "readers arrive",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 3.5,
        text: "One honest line on every copy",
        tone: "good"
      }
    ],
    loop: 7.5
  }
};
