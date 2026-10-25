---
artifact: canvas-spec
course: career-brand
chapter: "5.4"
beat: 5
slug: career-m5-screenshot-first
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Screenshot first on weak data

## Teaching claim
Show a screenshot first and link the video with its size stated. No autoplay, so a reader on weak or costly data pays only for what they choose.

## Why this visual
A reader opens a light page quickly and then decides to tap the video.

## Data
Light pages are an authoring rule for this platform: no autoplay, state the size, give a text path. Many readers and fellows are on weak, costly data.

```json
{
  "title": "Screenshot first on weak data",
  "purpose": "A reader on weak data opens a light demo page that shows a screenshot first. A link says 'watch the 90-second demo' and states its size. Nothing plays until the reader taps.",
  "limits": "The 90 seconds and the size are the example in the module brief; state the real size of your own file. This is a platform authoring rule, not a research finding.",
  "hint": "A light page, video on request.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "weak data", "x": 62, "y": 110 },
      { "id": "page", "label": "Demo page", "kind": "note", "sub": "image first", "x": 358, "y": 110 },
      { "id": "video", "label": "90 s demo", "kind": "note", "sub": "size stated", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "reader", "to": "page", "label": "opens fast" },
      { "kind": "say", "at": 1.4, "actor": "page", "text": "no autoplay", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "reader", "to": "video", "label": "tap to watch" },
      { "kind": "say", "at": 3.5, "actor": "video", "text": "plays on tap", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "Light page, video on request", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The reader chose to spend data on the video. Nothing was spent for them.
