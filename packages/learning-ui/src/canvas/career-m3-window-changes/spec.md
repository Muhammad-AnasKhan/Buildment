---
artifact: canvas-spec
course: career-brand
chapter: "3.4"
beat: 4
slug: career-m3-window-changes
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: The window changes the number

## Teaching claim
The same traffic looks spiky per second and calm as a one-minute average. A number means something only with its window.

## Why this visual
Two views of one stream of requests, side by side, make the window the only thing that differs.

## Data
No numbers are shown, because the point is the shape, not a value.

```json
{
  "title": "The window changes the number",
  "purpose": "The same requests are shown two ways: second by second the line is spiky, and as a one-minute average it looks calm. A number is only meaningful with its window.",
  "limits": "A made-up stream with no real values. Targets use a window too, so give the window with every target.",
  "hint": "Same traffic, two windows.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "traffic", "label": "Traffic", "kind": "queue", "sub": "same requests", "x": 62, "y": 110 },
      { "id": "second", "label": "Per second", "kind": "note", "sub": "very spiky", "x": 358, "y": 110 },
      { "id": "minute", "label": "One minute", "kind": "note", "sub": "looks calm", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "traffic", "to": "second", "label": "second by second" },
      { "kind": "say", "at": 1.4, "actor": "second", "text": "big peaks", "tone": "bad" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "traffic", "to": "minute", "label": "one-minute mean" },
      { "kind": "say", "at": 3.5, "actor": "minute", "text": "peaks hidden", "tone": "warn" },
      { "kind": "verdict", "at": 4.2, "text": "The window changes the number", "tone": "accent" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Neither view is wrong. If the window is not stated, a reader cannot tell which one they are looking at.
