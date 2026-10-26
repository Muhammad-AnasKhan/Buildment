---
artifact: canvas-spec
course: career-brand
chapter: "3.2"
beat: 2
slug: career-m3-percent-needs-start
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A percent needs its starting number

## Teaching claim
"Up 12 percent" means very different things from 25 users and from 10,000. A percentage alone misleads; the starting number comes with it.

## Why this visual
Two identical sentences with two different bases, read by one reader, show it without a lecture. This is a short recap for fellows who took course 14.

## Change from the module brief
The brief uses "10 to 11.2 users", which is a fractional person. This spec uses 25 to 28 users (exactly 12 percent) and 10,000 to 11,200 (also exactly 12 percent).

## Data
```json
{
  "title": "A percent needs its starting number",
  "purpose": "Two products both report 'up 12 percent'. One went from 25 to 28 users. The other went from 10,000 to 11,200. The same words, very different news.",
  "limits": "Both examples are made up and rounded to be exact. A percentage is not wrong; it is incomplete without the number it started from.",
  "hint": "Same percent, two starting numbers.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "small", "label": "Small base", "kind": "note", "sub": "up 12 percent", "x": 62, "y": 110 },
      { "id": "big", "label": "Big base", "kind": "note", "sub": "up 12 percent", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "how many?", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "reader", "to": "small", "label": "from what?" },
      { "kind": "say", "at": 1.4, "actor": "small", "text": "25 to 28", "tone": "warn" },
      { "kind": "fly", "at": 2.5, "dur": 1.0, "from": "reader", "to": "big", "label": "from what?" },
      { "kind": "say", "at": 3.6, "actor": "big", "text": "10k to 11.2k", "tone": "good" },
      { "kind": "say", "at": 4.0, "actor": "reader", "text": "not the same", "tone": "accent" },
      { "kind": "verdict", "at": 4.6, "text": "Same percent, very different news", "tone": "accent" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
Three extra words, "from what?", change how the number reads.
