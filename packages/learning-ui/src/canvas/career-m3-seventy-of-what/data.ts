import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.1 beat 1: Seventy percent of what?.
// A number on a resume invites three questions: of what, over which days, and was it you. A bare "70 percent" answers none of them.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3SeventyOfWhat: SceneSpec = {
  "kind": "scene",
  "title": "Seventy percent of what?",
  "purpose": "A hiring manager reads Tawfiq's line 'made the nightly pipeline 70 percent faster' and asks three questions: of what, over which days, and was it you. The line has no answer.",
  "limits": "Tawfiq is a fictional fellow. The questions are the ones a careful reader tends to ask; real readers differ.",
  "hint": "Watch the three questions arrive.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "manager",
        "label": "Manager",
        "kind": "user",
        "sub": "hiring",
        "x": 62,
        "y": 110
      },
      {
        "id": "line",
        "label": "Resume line",
        "kind": "note",
        "sub": "70% faster",
        "x": 358,
        "y": 110
      },
      {
        "id": "tawfiq",
        "label": "Tawfiq",
        "kind": "user",
        "sub": "data engineer",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "manager",
        "to": "line",
        "label": "of what?"
      },
      {
        "kind": "fly",
        "at": 1.6,
        "dur": 1,
        "from": "manager",
        "to": "line",
        "label": "which days?"
      },
      {
        "kind": "fly",
        "at": 2.9,
        "dur": 1,
        "from": "manager",
        "to": "line",
        "label": "was it you?"
      },
      {
        "kind": "say",
        "at": 4,
        "actor": "line",
        "text": "no answer",
        "tone": "bad"
      },
      {
        "kind": "say",
        "at": 4.3,
        "actor": "tawfiq",
        "text": "unsure",
        "tone": "warn"
      },
      {
        "kind": "verdict",
        "at": 4.9,
        "text": "Three questions the line cannot answer",
        "tone": "bad"
      }
    ],
    "loop": 8.5
  }
};
