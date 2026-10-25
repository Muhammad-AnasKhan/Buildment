import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.3 beat 1: "Responsible for" is a job description.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6DutyVsBullet: SceneSpec = {
  "kind": "scene",
  "title": "\"Responsible for\" is a job description",
  "purpose": "A duty line says what Waed was supposed to do. Her owned bullet says what changed because she did it: missed delivery confirmations from about 30 to 6 a month, counted from the team tracker over three months before and after.",
  "limits": "Waed is a fictional fellow and her numbers are illustrative. A duty line is not wrong; it just does not answer the reader's next question.",
  "hint": "Two lines, two questions.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "duty",
        "label": "Duty line",
        "kind": "note",
        "sub": "responsible for",
        "x": 62,
        "y": 110
      },
      {
        "id": "bullet",
        "label": "Owned bullet",
        "kind": "note",
        "sub": "30 to 6 a month",
        "x": 358,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "wants a change",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "duty",
        "to": "reader",
        "label": "what the job was"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "reader",
        "text": "what changed?",
        "tone": "warn"
      },
      {
        "kind": "fly",
        "at": 2.6,
        "dur": 1,
        "from": "bullet",
        "to": "reader",
        "label": "what changed"
      },
      {
        "kind": "say",
        "at": 3.7,
        "actor": "reader",
        "text": "has an answer",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.4,
        "text": "A duty is not a result",
        "tone": "good"
      }
    ],
    "loop": 8
  }
};
