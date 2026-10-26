import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.5 beat 6: No laptop? Read the export.
// You can do this module on a phone. Read a supplied dashboard export and answer the six questions, or bring a number from a real job with permission. Running k6, Lighthouse or EXPLAIN is optional.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3PhoneExport: SceneSpec = {
  "kind": "scene",
  "title": "No laptop? Read the export",
  "purpose": "On a phone, Areej reads a dashboard export and answers the six questions about it. The shared laptop is optional, for later, if she wants to run a test herself.",
  "limits": "The no-install path is a full path, not a lesser one: it teaches reading a number you did not set up. Tools named in this module carry 'checked 2026-10'; trust your own screen.",
  "hint": "Six questions, one phone.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "questions",
        "label": "Six questions",
        "kind": "note",
        "sub": "one by one",
        "x": 62,
        "y": 110
      },
      {
        "id": "phone",
        "label": "Her phone",
        "kind": "phone",
        "sub": "reads export",
        "x": 358,
        "y": 110
      },
      {
        "id": "laptop",
        "label": "Laptop",
        "kind": "server",
        "sub": "later, optional",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "questions",
        "to": "phone",
        "label": "ask six"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "phone",
        "text": "answers here",
        "tone": "good"
      },
      {
        "kind": "say",
        "at": 2.6,
        "actor": "laptop",
        "text": "optional tests",
        "tone": "accent"
      },
      {
        "kind": "verdict",
        "at": 3.4,
        "text": "You can do this on a phone",
        "tone": "good"
      }
    ],
    "loop": 7
  }
};
