---
artifact: canvas-spec
course: career-brand
chapter: "5.3"
beat: 5
slug: career-m5-no-hosting
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: When you cannot deploy at all

## Teaching claim
A static case study page with screenshots and a short recording, opened on a phone, counts as a showcase. You do not need hosting to show your work.

## Why this visual
A phone opens a page and a recording without any server or login, so there is nothing to wake or expire.

## Data
```json
{
  "title": "When you cannot deploy at all",
  "purpose": "A phone opens a static case study page with screenshots, then plays a short recording with captions. No login, no hosting of the app, nothing to wake.",
  "limits": "A static page and a recording show the work; they do not let a reader try it. They are the base layer, and a live demo is a bonus when you can have one.",
  "hint": "A page and a recording, no server.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "phone", "label": "Phone", "kind": "phone", "sub": "no login", "x": 62, "y": 110 },
      { "id": "page", "label": "Case study", "kind": "note", "sub": "static page", "x": 358, "y": 110 },
      { "id": "recording", "label": "Recording", "kind": "note", "sub": "short video", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "phone", "to": "page", "label": "opens" },
      { "kind": "say", "at": 1.4, "actor": "page", "text": "screenshots", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "phone", "to": "recording", "label": "plays" },
      { "kind": "say", "at": 3.5, "actor": "recording", "text": "with captions", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "No hosting? The case study counts", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Nothing here can be asleep or expired. That is why it is the layer to lead with.
