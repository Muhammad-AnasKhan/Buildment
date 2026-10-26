---
artifact: canvas-spec
course: career-brand
chapter: "6.4"
beat: 4
slug: career-m6-adjectives-or-fact
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Three adjectives or one fact

## Teaching claim
One fact a reader can check does more than any number of adjectives. "Dynamic, results-driven, passionate" gives a reader no question; "missed confirmations from about 90 to 18 in 3 months" gives them one.

## Why this visual
Two lines go to the same reader. The reader has no question for the first and a good question for the second.

## Data
Waed's fact is from the canon: missed delivery confirmations from 90 in the three months before to 18 in the three months after (30 a month to 6 a month), from the team's tracker. The team also began a daily check in that period.

```json
{
  "title": "Three adjectives or one fact",
  "purpose": "A reader gets 'dynamic, results-driven, passionate' and has no question. Then the reader gets 'missed confirmations fell from 90 to 18 in three months' and asks how it was measured.",
  "limits": "Her numbers are illustrative. One fact does not make a resume; it shows what the rest of the lines should do.",
  "hint": "Which line gives the reader a question?",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "adjectives", "label": "Adjectives", "kind": "note", "sub": "nothing to ask", "x": 62, "y": 110 },
      { "id": "fact", "label": "One fact", "kind": "note", "sub": "can be checked", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "curious", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "adjectives", "to": "reader", "label": "dynamic, driven" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "no question", "tone": "warn" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "fact", "to": "reader", "label": "90 to 18 in 3 months" },
      { "kind": "say", "at": 3.7, "actor": "reader", "text": "asks: how?", "tone": "good" },
      { "kind": "verdict", "at": 4.4, "text": "One fact outweighs three adjectives", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
A good line is one that invites the next question. Adjectives never do.
