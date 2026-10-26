---
artifact: canvas-spec
course: career-brand
chapter: "2.4"
beat: 1
slug: career-m2-football-notebook
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: One true, human detail

## Teaching claim
One true detail, such as a sport or a hobby, gives a reader something to remember and ask about. It is optional, never graded, and never invented to look interesting.

## Why this visual
The detail sits next to Areej's name and a reader asks about it. The question and the short answer show what the detail buys.

## Data
The detail is from the canon (her football statistics notebook, since she was 12). Areej is a fictional fellow.

```json
{
  "title": "One true, human detail",
  "purpose": "Areej has kept a notebook of football match statistics since she was 12. A reader asks what it taught her, and her answer connects to her work.",
  "limits": "Areej is a fictional fellow. A human detail is a course suggestion, not research. It must be true, it is optional, and nobody is graded on it. Do not invent a hobby to look interesting.",
  "hint": "Watch the reader's question.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "notebook", "label": "Notebook", "kind": "note", "sub": "match stats", "x": 62, "y": 110 },
      { "id": "areej", "label": "Areej", "kind": "user", "sub": "since age 12", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "curious", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "notebook", "to": "areej", "label": "kept for years" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "reader", "to": "areej", "label": "what did it teach" },
      { "kind": "fly", "at": 2.9, "dur": 1.0, "from": "areej", "to": "reader", "label": "averages hide it" },
      { "kind": "say", "at": 4.0, "actor": "reader", "text": "wants more", "tone": "good" },
      { "kind": "verdict", "at": 4.6, "text": "A true detail invites a question", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The detail is small. Its value is the question it invites, and her answer leads straight back to her work.

## Limits
In the `limits` field of the data.
