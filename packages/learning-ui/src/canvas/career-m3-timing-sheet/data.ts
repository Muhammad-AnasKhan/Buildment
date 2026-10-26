import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 16 (career-brand), module 3, chapter 3.5 beat 5: Time it as it is done today.
// To claim time saved, time the task as it is done today, for a stated window, and use the median. A timer beats memory, which is easy to bend.
// Card register. Fictional people; the picture is a story, not data.
export const careerM3TimingSheet: SceneSpec = {
  "kind": "scene",
  "title": "Time it as it is done today",
  "purpose": "Before the script, Areej and the shop's assistant time 64 invoices over two weeks; the median is 7 minutes. Two weeks after, they time 61; the median is 1 minute. The sheet is the proof.",
  "limits": "Two fortnights are a small sample and a before and after comparison is a weak design; the sheet says what else changed. Use the median, not the average, because a few slow invoices distort the average.",
  "hint": "Two fortnights on one sheet.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      {
        "id": "assistant",
        "label": "Assistant",
        "kind": "user",
        "sub": "times each one",
        "x": 62,
        "y": 110
      },
      {
        "id": "sheet",
        "label": "The sheet",
        "kind": "note",
        "sub": "10 working days",
        "x": 358,
        "y": 110
      },
      {
        "id": "result",
        "label": "Median",
        "kind": "note",
        "sub": "per invoice",
        "x": 210,
        "y": 250
      }
    ],
    "events": [
      {
        "kind": "fly",
        "at": 0.3,
        "dur": 1,
        "from": "assistant",
        "to": "sheet",
        "label": "64 invoices"
      },
      {
        "kind": "say",
        "at": 1.4,
        "actor": "sheet",
        "text": "before: 7 min",
        "tone": "warn"
      },
      {
        "kind": "fly",
        "at": 2.6,
        "dur": 1,
        "from": "assistant",
        "to": "sheet",
        "label": "61 invoices"
      },
      {
        "kind": "say",
        "at": 3.7,
        "actor": "sheet",
        "text": "after: 1 min",
        "tone": "good"
      },
      {
        "kind": "say",
        "at": 4.1,
        "actor": "result",
        "text": "7 min to 1 min",
        "tone": "good"
      },
      {
        "kind": "verdict",
        "at": 4.8,
        "text": "Time it as it is done today",
        "tone": "good"
      }
    ],
    "loop": 8.5
  }
};
