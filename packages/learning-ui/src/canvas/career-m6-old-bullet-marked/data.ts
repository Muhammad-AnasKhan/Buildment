import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.4 beat 2: What an empty sentence looks like.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6OldBulletMarked: SceneSpec = {
  "kind": "scene",
  "title": "What an empty sentence looks like",
  "purpose": "A reader questions Areej's old bullet one phrase at a time: leveraging, seamless, robust. Each comes back empty, and almost nothing a reader can check is left.",
  "limits": "Areej is a fictional fellow. The patterns are for orientation, not a banned list: one word proves nothing, and the same words can be fine in another sentence. The edit is about information, not about sounding human.",
  "hint": "Question each phrase.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "bullet",
        "label": "Old bullet",
        "kind": "note",
        "sub": "responsible for",
        "x": 62,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "checks words",
        "x": 358,
        "y": 110
      },
      {
        "id": "left",
        "label": "What is left",
        "kind": "note",
        "sub": "after the edit",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 0.9,
        "from": "reader",
        "to": "bullet",
        "label": "leveraging?"
      },
      {
        "kind": "fly",
        "at": 1.4,
        "dur": 0.9,
        "from": "reader",
        "to": "bullet",
        "label": "seamless?"
      },
      {
        "kind": "fly",
        "at": 2.5,
        "dur": 0.9,
        "from": "reader",
        "to": "bullet",
        "label": "robust?"
      },
      {
        "kind": "say",
        "at": 3.5,
        "actor": "bullet",
        "text": "all empty",
        "tone": "bad"
      },
      {
        "kind": "say",
        "at": 4.1,
        "actor": "left",
        "text": "no facts",
        "tone": "bad"
      },
      {
        "kind": "verdict",
        "at": 4.8,
        "text": "Almost nothing is left",
        "tone": "bad"
      }
    ],
    "loop": 8.5
  }
};
