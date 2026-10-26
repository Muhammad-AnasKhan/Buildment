import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.3 beat 6: Ask before you show employer data.
// Ask before you use an employer's dashboard in public. When in doubt, keep the number private. If the answer is yes, remove names and customer data first.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3AskFirst: SceneSpec = {
  "kind": "scene",
  "title": "Ask before you show employer data",
  "purpose": "Areej asks her lead whether she may show the p95 chart of the report endpoint in her portfolio. He says yes if the company name, the table names and any customer data are removed. She removes them.",
  "limits": "Permission is a rule of this course, not legal advice. When in doubt, keep the number private and write it in your ledger as private.",
  "hint": "Ask, then remove the names.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "areej",
        "label": "Areej",
        "kind": "user",
        "sub": "asks first",
        "x": 62,
        "y": 110
      },
      {
        "id": "lead",
        "label": "Her lead",
        "kind": "user",
        "sub": "owns the chart",
        "x": 358,
        "y": 110
      },
      {
        "id": "chart",
        "label": "Report chart",
        "kind": "note",
        "sub": "names on it",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "areej",
        "to": "lead",
        "label": "may I show it?"
      },
      {
        "kind": "fly",
        "at": 1.6,
        "dur": 1,
        "from": "lead",
        "to": "areej",
        "label": "yes, names off"
      },
      {
        "kind": "fly",
        "at": 2.9,
        "dur": 1,
        "from": "areej",
        "to": "chart",
        "label": "remove names"
      },
      {
        "kind": "say",
        "at": 4,
        "actor": "chart",
        "text": "names removed",
        "tone": "good"
      },
      {
        "kind": "say",
        "at": 4.3,
        "actor": "areej",
        "text": "no customers",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.9,
        "text": "Ask first, then remove names",
        "tone": "good"
      }
    ],
    "loop": 8.5
  }
};
