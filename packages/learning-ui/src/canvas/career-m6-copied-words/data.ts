import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.5 beat 5: Copied words carry nothing.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6CopiedWords: SceneSpec = {
  "kind": "scene",
  "title": "Copied words carry nothing",
  "purpose": "A resume with the posting's own words pasted in gives the reader no proof. A resume with the same facts reordered, proof first, gets read on.",
  "limits": "A made-up reader. This is a course habit, not a measured result. Keyword stuffing and hidden white text are dishonest and are never taught.",
  "hint": "Pasted words, or proof first?",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "stuffed",
        "label": "Copied words",
        "kind": "note",
        "sub": "pasted words",
        "x": 62,
        "y": 110
      },
      {
        "id": "reordered",
        "label": "Reordered",
        "kind": "note",
        "sub": "same facts",
        "x": 358,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "looks for proof",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "stuffed",
        "to": "reader",
        "label": "their own words"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "reader",
        "text": "sees no proof",
        "tone": "bad"
      },
      {
        "kind": "fly",
        "at": 2.6,
        "dur": 1,
        "from": "reordered",
        "to": "reader",
        "label": "proof first"
      },
      {
        "kind": "say",
        "at": 3.7,
        "actor": "reader",
        "text": "reads on",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.4,
        "text": "Change the order, not the words",
        "tone": "good"
      }
    ],
    "loop": 8
  }
};
