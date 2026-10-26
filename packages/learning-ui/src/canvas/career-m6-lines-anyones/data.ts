import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.1 beat 1: Lines that could be anyone's.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6LinesAnyones: SceneSpec = {
  "kind": "scene",
  "title": "Lines that could be anyone's",
  "purpose": "Waed's resume says 'responsible for coordinating shipments' and has an AI-written summary. Three other applicants' resumes use almost the same words. The reader cannot tell them apart.",
  "limits": "The other resumes are made up. The picture does not say AI tools cause this; plain duty lines were common before them.",
  "hint": "Four resumes, one set of words.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "waed",
        "label": "Her resume",
        "kind": "note",
        "sub": "AI summary",
        "x": 62,
        "y": 110
      },
      {
        "id": "others",
        "label": "3 others",
        "kind": "note",
        "sub": "same words",
        "x": 358,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "hiring",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "waed",
        "to": "reader",
        "label": "responsible for"
      },
      {
        "kind": "fly",
        "at": 1.6,
        "dur": 1,
        "from": "others",
        "to": "reader",
        "label": "responsible for"
      },
      {
        "kind": "say",
        "at": 2.8,
        "actor": "reader",
        "text": "all the same",
        "tone": "bad"
      },
      {
        "kind": "verdict",
        "at": 3.5,
        "text": "Lines that could be anyone's",
        "tone": "bad"
      }
    ],
    "loop": 7.5
  }
};
