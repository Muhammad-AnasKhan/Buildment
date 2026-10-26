---
artifact: canvas-spec
course: career-brand
chapter: "6.1"
beat: 2
slug: career-m6-missing-tracker
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: The work that is missing

## Teaching claim
Waed's best result, a shared tracker that cut missed delivery confirmations, is not on her resume at all.

## Why this visual
The result is drawn next to the resume that leaves it out.

## Data
From the canon: Waed built a shared tracker that recorded 90 missed delivery confirmations in three months before and 18 in three months after (30 to 6 a month), counted from the team's tracker over three months before and three months after.

```json
{
  "title": "The work that is missing",
  "purpose": "Waed built a shared tracker. Her team's tracker shows 90 missed delivery confirmations in the three months before and 18 in the three months after. The team also began a daily check in that time. None of it is on her resume.",
  "limits": "Her numbers are illustrative. The picture shows an omission, not a lie: the result is real and simply missing. Part of the fall came from the team's daily check, not from the tracker alone.",
  "hint": "A real result, left off the page.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "waed", "label": "Waed", "kind": "user", "sub": "built a tracker", "x": 62, "y": 110 },
      { "id": "tracker", "label": "Her tracker", "kind": "note", "sub": "90 to 18", "x": 358, "y": 110 },
      { "id": "resume", "label": "Her resume", "kind": "note", "sub": "no tracker", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "waed", "to": "tracker", "label": "built it" },
      { "kind": "say", "at": 1.4, "actor": "tracker", "text": "3 months each", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "tracker", "to": "resume", "label": "left off" },
      { "kind": "say", "at": 3.5, "actor": "resume", "text": "not on it", "tone": "bad" },
      { "kind": "verdict", "at": 4.2, "text": "Her best result is missing", "tone": "bad" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The module's job is to get this result onto the page with its parts, so a reader can ask about it.
