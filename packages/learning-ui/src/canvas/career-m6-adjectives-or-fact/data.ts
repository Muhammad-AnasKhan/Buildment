import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 6, chapter 6.4 beat 4: Three adjectives or one fact.
// Card register. Fictional people; the picture is a story, not data.
export const careerM6AdjectivesOrFact: SceneSpec = {
  "kind": "scene",
  "title": "Three adjectives or one fact",
  "purpose": "A reader gets 'dynamic, results-driven, passionate' and has no question. Then the reader gets 'missed confirmations fell from 90 to 18 in three months' and asks how it was measured.",
  "limits": "Her numbers are illustrative. One fact does not make a resume; it shows what the rest of the lines should do.",
  "hint": "Which line gives the reader a question?",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "adjectives",
        "label": "Adjectives",
        "kind": "note",
        "sub": "nothing to ask",
        "x": 62,
        "y": 110
      },
      {
        "id": "fact",
        "label": "One fact",
        "kind": "note",
        "sub": "can be checked",
        "x": 358,
        "y": 110
      },
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "curious",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "adjectives",
        "to": "reader",
        "label": "dynamic, driven"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "reader",
        "text": "no question",
        "tone": "warn"
      },
      {
        "kind": "fly",
        "at": 2.6,
        "dur": 1,
        "from": "fact",
        "to": "reader",
        "label": "90 to 18 in 3 months"
      },
      {
        "kind": "say",
        "at": 3.7,
        "actor": "reader",
        "text": "asks: how?",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.4,
        "text": "One fact outweighs three adjectives",
        "tone": "good"
      }
    ],
    "loop": 8
  }
};
