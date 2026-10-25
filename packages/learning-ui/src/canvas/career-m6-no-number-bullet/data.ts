import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.3 beat 5: No number? Show the change another way.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6NoNumberBullet: SceneSpec = {
  "kind": "scene",
  "title": "No number? Show the change another way",
  "purpose": "Areej's key bullet has no number. It names three acts a reader can check in the repository: the key was revoked and replaced, secrets moved to environment variables, and push protection was turned on.",
  "limits": "Areej is a fictional fellow. Nothing we found shows that bullets with numbers get more interviews. A checkable action or an honest gap is a good bullet; an invented number is not.",
  "hint": "Three acts, no number.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "bullet",
        "label": "Key bullet",
        "kind": "note",
        "sub": "no number",
        "x": 62,
        "y": 110
      },
      {
        "id": "repo",
        "label": "Team repo",
        "kind": "database",
        "sub": "4-person team",
        "x": 358,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "wants to check",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "bullet",
        "to": "reader",
        "label": "revoked, replaced"
      },
      {
        "kind": "fly",
        "at": 1.5,
        "dur": 1,
        "from": "bullet",
        "to": "reader",
        "label": "secrets in env"
      },
      {
        "kind": "fly",
        "at": 2.7,
        "dur": 1,
        "from": "bullet",
        "to": "reader",
        "label": "push protection"
      },
      {
        "kind": "say",
        "at": 3.9,
        "actor": "repo",
        "text": "settings on",
        "tone": "good"
      },
      {
        "kind": "say",
        "at": 4.1,
        "actor": "reader",
        "text": "can verify",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.8,
        "text": "No number? Name a checkable act",
        "tone": "good"
      }
    ],
    "loop": 8.5
  }
};
