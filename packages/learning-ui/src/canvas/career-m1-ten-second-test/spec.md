---
artifact: canvas-spec
course: career-brand
chapter: "1.2"
beat: 5
slug: career-m1-ten-second-test
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: The ten-second test

## Teaching claim
You can test your own kit: a partner looks at your phone for ten seconds, then says what they remember, and you compare it with your best proof.

## Why this visual
The test is a short procedure with one wait in the middle. A scene with a timer ring walks the learner through the steps they will do at gate 1.6.

## Data
```json
{
  "title": "The ten-second test",
  "purpose": "A partner looks at your resume on a phone for ten seconds, then says what they remember. You write it down and check it against your best proof.",
  "limits": "The ten seconds are a practice limit chosen by this course. They are not a research finding and not how long a real reader looks.",
  "hint": "Run this test on your own kit at the end of the module.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "partner", "label": "Partner", "kind": "user", "sub": "ten-second look", "x": 62, "y": 110 },
      { "id": "phone", "label": "Your phone", "kind": "phone", "sub": "your resume", "x": 358, "y": 110 },
      { "id": "notes", "label": "Your notes", "kind": "note", "sub": "what stuck", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 0.9, "from": "partner", "to": "phone", "label": "look" },
      { "kind": "wait", "at": 1.4, "dur": 3.0, "actor": "partner", "label": "looking {n} s", "doneLabel": "time up", "total": 10 },
      { "kind": "say", "at": 4.5, "actor": "partner", "text": "recalls two", "tone": "accent" },
      { "kind": "fly", "at": 4.7, "dur": 1.0, "from": "partner", "to": "notes", "label": "what stuck" },
      { "kind": "say", "at": 5.8, "actor": "notes", "text": "write it down", "tone": "good" },
      { "kind": "verdict", "at": 6.4, "text": "Was your best proof one of them?", "tone": "accent" }
    ],
    "loop": 10.5
  }
}
```

## What the learner should notice
The question is not "did they like it" but "was my best proof among the few things they remembered". That answer is the baseline saved at gate 1.6.

## Limits
In the `limits` field of the data.
