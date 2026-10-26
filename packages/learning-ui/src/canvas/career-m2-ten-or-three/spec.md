---
artifact: canvas-spec
course: career-brand
chapter: "2.2"
beat: 2
slug: career-m2-ten-or-three
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Two or three pillars, not ten

## Teaching claim
Fewer pillars are easier for a reader to remember and for you to prove. Ten thin pillars wobble; three solid ones hold.

## Why this visual
One reader tries to remember each set. The first is forgotten, the second is remembered.

## Data
```json
{
  "title": "Two or three pillars, not ten",
  "purpose": "A reader is shown ten thin pillars and forgets them. Then the reader is shown three solid ones and remembers them.",
  "limits": "This is the course's recommendation, not research. Three is a guide, not a law. What matters is that each pillar can be proved.",
  "hint": "Watch which set the reader remembers.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "remembering", "x": 210, "y": 105 },
      { "id": "ten", "label": "Ten pillars", "kind": "note", "sub": "each one thin", "x": 62, "y": 250 },
      { "id": "three", "label": "Three pillars", "kind": "note", "sub": "each one solid", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "ten", "to": "reader", "label": "ten things" },
      { "kind": "say", "at": 1.4, "actor": "ten", "text": "wobbles", "tone": "bad" },
      { "kind": "say", "at": 1.8, "actor": "reader", "text": "forgets them", "tone": "warn" },
      { "kind": "fly", "at": 3.0, "dur": 1.0, "from": "three", "to": "reader", "label": "three things" },
      { "kind": "say", "at": 4.1, "actor": "three", "text": "holds", "tone": "good" },
      { "kind": "say", "at": 4.4, "actor": "reader", "text": "remembers", "tone": "good" },
      { "kind": "verdict", "at": 5.0, "text": "Three solid pillars beat ten thin ones", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The three pillars are not bigger claims. They are claims that each stand on a proof.

## Limits
In the `limits` field of the data.
