---
artifact: canvas-spec
course: career-brand
chapter: "9.1"
beat: 1
slug: career-m9-line-picked
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: "Where did 40 percent come from?"

## Teaching claim
In the capstone a mentor can pick any line of your kit and ask where its number came from. You should be ready to show the row.

## Why this visual
One mentor, one line and one question. The line is Ismail's: "reduced escaped bugs by 40 percent".

## Data
Ismail is from the canon (scene cast, 9.1). Card register is used; the illustrated register needs custom code.

```json
{
  "title": "\"Where did 40 percent come from?\"",
  "purpose": "A mentor points at Ismail's resume line 'reduced escaped bugs by 40 percent' and asks where the number came from. Ismail is ready to show the row behind it.",
  "limits": "The capstone defence works the same way for any line of any learner's kit; the mentor may pick any one.",
  "hint": "Any line can be picked.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "mentor", "label": "Mentor", "kind": "user", "sub": "picks any line", "x": 62, "y": 110 },
      { "id": "line", "label": "Resume line", "kind": "note", "sub": "40% fewer bugs", "x": 358, "y": 110 },
      { "id": "ismail", "label": "Ismail", "kind": "user", "sub": "QA engineer", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "mentor", "to": "line", "label": "where is 40 from?" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "mentor", "to": "ismail", "label": "show me" },
      { "kind": "say", "at": 2.8, "actor": "ismail", "text": "opens ledger", "tone": "good" },
      { "kind": "verdict", "at": 3.6, "text": "Any line can be picked", "tone": "accent" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
The question is not hostile. It is the one the whole course has been preparing the learner to answer.
