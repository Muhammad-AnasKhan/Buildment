---
artifact: canvas-spec
course: career-brand
chapter: "5.4"
beat: 3
slug: career-m5-show-the-hard-part
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Show the hard part, not a tour

## Teaching claim
Linger on the one thing that was hard to build, such as a stock count that stays right when two sales arrive at the same moment. It invites the reader's question.

## Why this visual
Two sales hit one stock count together and the count stays right. That one moment is what the demo should linger on.

## Data
From the canon: the AI-use log example. An AI suggested a stock update without a transaction; Areej tested two sales at once, saw the count go wrong and wrapped the update in a transaction.

```json
{
  "title": "Show the hard part, not a tour",
  "purpose": "Two sales arrive at the same moment and hit one stock count. The count stays right because the update runs in one transaction. That is the part of the demo to linger on.",
  "limits": "Areej is a fictional fellow and the plan is illustrative. A tour of menus proves little; the core flow and one hard detail invite a reader's question.",
  "hint": "Two sales, one count.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "sale1", "label": "Sale 1", "kind": "user", "sub": "one customer", "x": 62, "y": 110 },
      { "id": "sale2", "label": "Sale 2", "kind": "user", "sub": "same moment", "x": 358, "y": 110 },
      { "id": "stock", "label": "Stock count", "kind": "database", "sub": "must stay right", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "sale1", "to": "stock", "label": "sold 1" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "sale2", "to": "stock", "label": "sold 1" },
      { "kind": "say", "at": 2.8, "actor": "stock", "text": "count right", "tone": "good" },
      { "kind": "verdict", "at": 3.5, "text": "Linger on the one hard thing", "tone": "good" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
The hard part is easy to skip over in a tour, and it is the part that shows the maker understood the problem.
