import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.2 beat 6: "Not measured" is a complete answer.
// "I did not measure that, and here is how I would" is a complete and honest sentence. A gap with a plan is a finished row.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3NotMeasured: SceneSpec = {
  "kind": "scene",
  "title": "\"Not measured\" is a complete answer",
  "purpose": "A reader asks whether customers got Areej's invoices sooner. She did not measure it. Her card says so and holds a plan: ask the owner for two weeks of order and invoice times and compare.",
  "limits": "Areej is a fictional fellow. Lab studies found that truth tellers give more checkable details than liars; that is research on accounts of events, not resumes, so use it only as a reason to prefer checkable claims.",
  "hint": "An honest gap, with a plan.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "reader",
        "label": "Reader",
        "kind": "user",
        "sub": "curious",
        "x": 62,
        "y": 110
      },
      {
        "id": "card",
        "label": "Claim card",
        "kind": "note",
        "sub": "result: a gap",
        "x": 358,
        "y": 110
      },
      {
        "id": "plan",
        "label": "Her plan",
        "kind": "note",
        "sub": "ask for times",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "reader",
        "to": "card",
        "label": "sent sooner?"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "card",
        "text": "not measured",
        "tone": "warn"
      },
      {
        "kind": "fly",
        "at": 2.4,
        "dur": 1,
        "from": "card",
        "to": "plan",
        "label": "how I would"
      },
      {
        "kind": "say",
        "at": 3.5,
        "actor": "plan",
        "text": "two weeks",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.2,
        "text": "A gap with a plan is complete",
        "tone": "good"
      }
    ],
    "loop": 8
  }
};
