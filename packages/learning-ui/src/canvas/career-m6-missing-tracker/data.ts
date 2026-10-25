import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.1 beat 2: The work that is missing.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6MissingTracker: SceneSpec = {
  "kind": "scene",
  "title": "The work that is missing",
  "purpose": "Waed built a shared tracker that cut missed delivery confirmations from about 30 a month to 6, counted from the team's tracker over three months before and after. None of it is on her resume.",
  "limits": "Waed is a fictional fellow and her numbers are illustrative. The picture shows an omission, not a lie: the result is real and simply missing.",
  "hint": "A real result, left off the page.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "waed",
        "label": "Waed",
        "kind": "user",
        "sub": "built a tracker",
        "x": 62,
        "y": 110
      },
      {
        "id": "tracker",
        "label": "Her tracker",
        "kind": "note",
        "sub": "30 to 6 a month",
        "x": 358,
        "y": 110
      },
      {
        "id": "resume",
        "label": "Her resume",
        "kind": "note",
        "sub": "no tracker",
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
        "to": "tracker",
        "label": "built it"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "tracker",
        "text": "3 months each",
        "tone": "good"
      },
      {
        "kind": "fly",
        "at": 2.4,
        "dur": 1,
        "from": "tracker",
        "to": "resume",
        "label": "left off"
      },
      {
        "kind": "say",
        "at": 3.5,
        "actor": "resume",
        "text": "not on it",
        "tone": "bad"
      },
      {
        "kind": "verdict",
        "at": 4.2,
        "text": "Her best result is missing",
        "tone": "bad"
      }
    ],
    "loop": 8
  }
};
