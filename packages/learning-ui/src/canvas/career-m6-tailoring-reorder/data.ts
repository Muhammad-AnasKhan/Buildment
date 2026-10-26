import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.5 beat 3: Tailoring changes what comes first.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6TailoringReorder: SceneSpec = {
  "kind": "scene",
  "title": "Tailoring changes what comes first",
  "purpose": "A posting asks for database speed work. Areej moves her report bullet to the top and starts her summary 'Backend-leaning full-stack developer'. The facts are the same; the order is new.",
  "limits": "One company says it checks whether an application was tailored and whether the candidate tried the product. Tailoring is a habit, not a guarantee of a reply.",
  "hint": "Same facts, new order.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "posting",
        "label": "The posting",
        "kind": "note",
        "sub": "database speed",
        "x": 62,
        "y": 110
      },
      {
        "id": "resume",
        "label": "Her resume",
        "kind": "note",
        "sub": "same facts",
        "x": 358,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "looks for speed",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "posting",
        "to": "reader",
        "label": "asks for speed"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "resume",
        "text": "report first",
        "tone": "good"
      },
      {
        "kind": "say",
        "at": 2,
        "actor": "resume",
        "text": "new summary",
        "tone": "accent"
      },
      {
        "kind": "fly",
        "at": 2.8,
        "dur": 1,
        "from": "resume",
        "to": "reader",
        "label": "report bullet"
      },
      {
        "kind": "say",
        "at": 3.9,
        "actor": "reader",
        "text": "finds it fast",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.6,
        "text": "Same facts, new order",
        "tone": "good"
      }
    ],
    "loop": 8.5
  }
};
