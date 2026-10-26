---
artifact: canvas-spec
course: career-brand
chapter: "4.1"
beat: 2
slug: career-m4-matching-question
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: "How does the matching work?"

## Teaching claim
A reader who asks how part of your project works is testing whether you understand it. Code you cannot explain does not help you.

## Why this visual
One question, one scroll through unfamiliar code and one answer that does not come.

## Data
```json
{
  "title": "\"How does the matching work?\"",
  "purpose": "In an interview, Sireen is asked how the matching works in her ride app. She scrolls through code an AI tool wrote and cannot explain it.",
  "limits": "The picture does not claim every interviewer asks this. It shows what happens when someone does.",
  "hint": "One question, no answer.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "interviewer", "label": "Interviewer", "kind": "user", "sub": "asks", "x": 62, "y": 110 },
      { "id": "sireen", "label": "Sireen", "kind": "user", "sub": "interviewing", "x": 358, "y": 110 },
      { "id": "code", "label": "The code", "kind": "note", "sub": "an AI wrote it", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "interviewer", "to": "sireen", "label": "how does it match?" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "sireen", "to": "code", "label": "scrolls" },
      { "kind": "say", "at": 2.7, "actor": "code", "text": "not her words", "tone": "warn" },
      { "kind": "say", "at": 3.4, "actor": "sireen", "text": "cannot explain", "tone": "bad" },
      { "kind": "verdict", "at": 4.2, "text": "She could not explain her own app", "tone": "bad" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The code ran. The weak point is the person's understanding of it, which is what module 4 asks you to show.
