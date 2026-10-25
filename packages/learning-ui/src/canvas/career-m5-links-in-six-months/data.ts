import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.2 beat 5: Links that still work in six months.
// A free database expires and a resume link breaks; a static case study page keeps working.

export const careerM5LinksInSixMonths: SceneSpec = {
  kind: "scene",
  title: "Links that still work in six months",
  purpose: "A free database expires 30 days after it is created and is deleted 14 days later. A resume link to the demo breaks. A static case study page and a recording keep working.",
  limits: "Plan details change. Check before you rely on it: read the plan page the week you publish, and keep a screenshot and a short recording as a backup. The 30 and 14 days are one host's rules on one date (checked 2026-10), not a rule for every host.",
  hint: "Watch the free plan run out.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      {
        id: "db",
        label: "Free database",
        kind: "database",
        sub: "30-day limit",
        x: 62,
        y: 105
      },
      {
        id: "link",
        label: "Resume link",
        kind: "note",
        sub: "to the demo",
        x: 210,
        y: 105
      },
      {
        id: "base",
        label: "Case study",
        kind: "note",
        sub: "static page",
        x: 358,
        y: 105
      }
    ],
    strip: {
      y: 290,
      from: 0,
      to: 45,
      unit: "day",
      caption: "days since the database was created",
      every: 15
    },
    events: [
      {
        kind: "tag",
        at: 0.5,
        row: 0,
        value: 30,
        label: "day 30: expires",
        tone: "warn"
      },
      {
        kind: "say",
        at: 1,
        actor: "db",
        text: "expired",
        tone: "bad"
      },
      {
        kind: "say",
        at: 1.8,
        actor: "link",
        text: "link breaks",
        tone: "bad"
      },
      {
        kind: "say",
        at: 2.6,
        actor: "base",
        text: "still opens",
        tone: "good"
      },
      {
        kind: "tag",
        at: 3.2,
        row: 1,
        value: 44,
        label: "day 44: deleted",
        tone: "bad"
      },
      {
        kind: "verdict",
        at: 4.2,
        text: "Link to something that lasts",
        tone: "good"
      }
    ],
    loop: 8
  },
};
