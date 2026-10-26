---
artifact: canvas-spec
course: career-brand
chapter: "8.2"
beat: 1
slug: career-m8-visitor-judges
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A visitor judges you by your writing

## Teaching claim
A visitor who reads one post forms a view of how its author thinks: the problem, the test and the trade-off. That is also what a founder looks for.

## Why this visual
One post sends three things to a reader and the reader's view appears at the end.

## Data
Google's people-first guidance asks whether content gives original information or analysis and shows first-hand expertise (checked 2026-10).

```json
{
  "title": "A visitor judges you by your writing",
  "purpose": "A visitor reads one post. It shows the problem, the test and the trade-off. From those three things the visitor forms a view of how the author thinks.",
  "limits": "The visitor is made up. Google's guidance is about search content, not hiring, but it asks for the same things: original information and first-hand experience. Checked 2026-10.",
  "hint": "Three things in one post.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "post", "label": "One post", "kind": "note", "sub": "your own work", "x": 62, "y": 110 },
      { "id": "visitor", "label": "Visitor", "kind": "user", "sub": "reads one post", "x": 358, "y": 110 },
      { "id": "view", "label": "Their view", "kind": "note", "sub": "how you think", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "post", "to": "visitor", "label": "the problem" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "post", "to": "visitor", "label": "the test" },
      { "kind": "fly", "at": 2.7, "dur": 1.0, "from": "post", "to": "visitor", "label": "the trade-off" },
      { "kind": "say", "at": 3.9, "actor": "view", "text": "sees thinking", "tone": "good" },
      { "kind": "verdict", "at": 4.6, "text": "A post shows how you think", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The visitor learned about the author from the writing, before reading any resume line.
