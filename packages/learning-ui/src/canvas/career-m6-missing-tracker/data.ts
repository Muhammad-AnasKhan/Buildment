import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.1 beat 2: The work that is missing.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6MissingTracker: SceneSpec = {
  "kind": "scene",
  "title": "The work that is missing",
  "purpose": "Waed built a shared tracker. Her team's tracker shows 90 missed delivery confirmations in the three months before and 18 in the three months after. The team also began a daily check in that time. None of it is on her resume.",
  "limits": "Her numbers are illustrative. The picture shows an omission, not a lie: the result is real and simply missing. Part of the fall came from the team's daily check, not from the tracker alone.",
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
        "sub": "90 to 18",
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
