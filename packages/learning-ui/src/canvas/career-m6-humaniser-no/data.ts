import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.4 beat 5: Never write to sound unlike a model.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6HumaniserNo: SceneSpec = {
  "kind": "scene",
  "title": "Never write to sound unlike a model",
  "purpose": "A humaniser tool changes the style of a bullet and adds no facts. A bullet with a real source gives the reader something to check. Add facts, not a new style.",
  "limits": "Detectors often misjudge second-language English, so passing one is not a goal. Resume-tuning tools are not evaluated here. A text tuned to sound like or unlike a model has no information added by that tuning.",
  "hint": "Style or facts?",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "humaniser",
        "label": "Humaniser",
        "kind": "worker",
        "sub": "changes style",
        "x": 62,
        "y": 110
      },
      {
        "id": "bullet",
        "label": "Real bullet",
        "kind": "note",
        "sub": "has a source",
        "x": 358,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "wants facts",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "humaniser",
        "to": "reader",
        "label": "different style"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "reader",
        "text": "no new facts",
        "tone": "warn"
      },
      {
        "kind": "mark",
        "at": 1.4,
        "actor": "humaniser",
        "tone": "bad"
      },
      {
        "kind": "fly",
        "at": 2.6,
        "dur": 1,
        "from": "bullet",
        "to": "reader",
        "label": "a sourced fact"
      },
      {
        "kind": "say",
        "at": 3.7,
        "actor": "reader",
        "text": "can check it",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.4,
        "text": "Add facts, not a new style",
        "tone": "good"
      }
    ],
    "loop": 8
  }
};
