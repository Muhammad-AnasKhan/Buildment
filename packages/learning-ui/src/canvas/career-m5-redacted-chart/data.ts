import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 5, chapter 5.5 beat 5: Permission and removed names.
// The chart keeps its numbers, loses its names, and carries a line saying it is shared with permission.

export const careerM5RedactedChart: SceneSpec = {
  kind: "scene",
  title: "Permission and removed names",
  purpose: "Areej's case study shows the report chart with the company name and table names blurred. A line under it says it is shared with permission. The numbers stay.",
  limits: "Areej is a fictional fellow. Permission is a rule of this course, not legal advice. When in doubt keep the number private. The rule is taught in 3.3; this is its use in a case study.",
  hint: "Names off, numbers kept.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      {
        id: "chart",
        label: "Report chart",
        kind: "note",
        sub: "names blurred",
        x: 62,
        y: 110
      },
      {
        id: "caption",
        label: "Caption",
        kind: "note",
        sub: "with permission",
        x: 358,
        y: 110
      },
      {
        id: "reader",
        label: "Reader",
        kind: "user",
        sub: "sees the proof",
        x: 210,
        y: 250
      }
    ],
    events: [
      {
        kind: "say",
        at: 0.6,
        actor: "chart",
        text: "tables blurred",
        tone: "good"
      },
      {
        kind: "fly",
        at: 1.2,
        dur: 1,
        from: "chart",
        to: "reader",
        label: "4.6 s to 0.41 s"
      },
      {
        kind: "fly",
        at: 2.5,
        dur: 1,
        from: "caption",
        to: "reader",
        label: "shared with ok"
      },
      {
        kind: "say",
        at: 3.6,
        actor: "reader",
        text: "trusts it",
        tone: "good"
      },
      {
        kind: "verdict",
        at: 4.3,
        text: "Names removed, permission shown",
        tone: "good"
      }
    ],
    loop: 8
  },
};
