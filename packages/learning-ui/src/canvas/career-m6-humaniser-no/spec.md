---
artifact: canvas-spec
course: career-brand
chapter: "6.4"
beat: 5
slug: career-m6-humaniser-no
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Never write to sound unlike a model

## Teaching claim
A "humaniser" tool changes style and adds no facts. Nobody can reliably tell if a profile was written with AI, and detectors misjudge second-language English. The question is whether the text says something only you could say.

## Why this visual
A style tool and a sourced bullet go to the same reader. Only the bullet gives the reader something to check.

## Data
Do not give a banned word list: word lists date and one word proves nothing. The finding that AI screeners prefer AI-written resumes comes from a simulation, not the real market.

```json
{
  "title": "Never write to sound unlike a model",
  "purpose": "A humaniser tool changes the style of a bullet and adds no facts. A bullet with a real source gives the reader something to check. Add facts, not a new style.",
  "limits": "Detectors often misjudge second-language English, so passing one is not a goal. Resume-tuning tools are not evaluated here. A text tuned to sound like or unlike a model has no information added by that tuning.",
  "hint": "Style or facts?",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "humaniser", "label": "Humaniser", "kind": "worker", "sub": "changes style", "x": 62, "y": 110 },
      { "id": "bullet", "label": "Real bullet", "kind": "note", "sub": "has a source", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "wants facts", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "humaniser", "to": "reader", "label": "different style" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "no new facts", "tone": "warn" },
      { "kind": "mark", "at": 1.4, "actor": "humaniser", "tone": "bad" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "bullet", "to": "reader", "label": "a sourced fact" },
      { "kind": "say", "at": 3.7, "actor": "reader", "text": "can check it", "tone": "good" },
      { "kind": "verdict", "at": 4.4, "text": "Add facts, not a new style", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The style tool changed how the line sounds. It could not change whether a reader can check it.
