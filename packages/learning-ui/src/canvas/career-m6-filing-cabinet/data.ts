import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.2 beat 4: What tracking software really does.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6FilingCabinet: SceneSpec = {
  "kind": "scene",
  "title": "What tracking software really does",
  "purpose": "An employer sets filters in a tracking tool. The tool sorts the applications into a list. A person looks at the list and decides. The software files and filters; people set the rules and make the decisions.",
  "limits": "Some employers do use filters, including negative ones, and the survey covers firms that use such software. A small team reading an inbox may not use any. Vendor statements are the vendor's own. Checked 2026-10.",
  "hint": "Rules set by people, decisions by people.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "employer",
        "label": "Employer",
        "kind": "user",
        "sub": "sets the rules",
        "x": 62,
        "y": 110
      },
      {
        "id": "tool",
        "label": "Tracking tool",
        "kind": "server",
        "sub": "sorts, filters",
        "x": 358,
        "y": 110
      },
      {
        "id": "person",
        "label": "A person",
        "kind": "user",
        "sub": "reads the list",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "employer",
        "to": "tool",
        "label": "sets filters"
      },
      {
        "kind": "fly",
        "at": 1.6,
        "dur": 1,
        "from": "tool",
        "to": "person",
        "label": "sorted list"
      },
      {
        "kind": "say",
        "at": 2.8,
        "actor": "person",
        "text": "makes the call",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 3.5,
        "text": "People set the rules and decide",
        "tone": "good"
      }
    ],
    "loop": 7.5
  }
};
