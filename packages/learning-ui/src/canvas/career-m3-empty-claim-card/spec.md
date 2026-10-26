---
artifact: canvas-spec
course: career-brand
chapter: "3.2"
beat: 1
slug: career-m3-empty-claim-card
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: "Helped grow the business 50 percent"

## Teaching claim
A bare number fails every part of a claim card: of what, before, after, when, from where, and your part. Rounding up or leaving things out to mislead is deception, not a safe middle.

## Why this visual
One empty claim card meets five questions that cover its six parts, and every part comes back missing.

## Data
```json
{
  "title": "\"Helped grow the business 50 percent\"",
  "purpose": "A reader puts five questions to the sentence 'helped grow the business 50 percent'. Together they cover six parts of a claim card: what was measured, the before, the after, the window, the source and your part. Each comes back missing.",
  "limits": "A made-up sentence. Researchers measure three forms of resume deception: fabrication, embellishment and omission. Embellishing and leaving things out to mislead both count; 'rounding up' is not a safe middle.",
  "hint": "Five questions, one sentence.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "five questions", "x": 62, "y": 110 },
      { "id": "claim", "label": "The claim", "kind": "note", "sub": "grew 50 percent", "x": 358, "y": 110 },
      { "id": "card", "label": "Claim card", "kind": "note", "sub": "all empty", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 0.8, "from": "reader", "to": "claim", "label": "measured what?" },
      { "kind": "say", "at": 1.1, "actor": "card", "text": "no metric", "tone": "bad" },
      { "kind": "fly", "at": 1.4, "dur": 0.8, "from": "reader", "to": "claim", "label": "before and after?" },
      { "kind": "say", "at": 2.2, "actor": "card", "text": "no before/after", "tone": "bad" },
      { "kind": "fly", "at": 2.5, "dur": 0.8, "from": "reader", "to": "claim", "label": "which weeks?" },
      { "kind": "say", "at": 3.3, "actor": "card", "text": "no window", "tone": "bad" },
      { "kind": "fly", "at": 3.6, "dur": 0.8, "from": "reader", "to": "claim", "label": "from where?" },
      { "kind": "say", "at": 4.4, "actor": "card", "text": "no source", "tone": "bad" },
      { "kind": "fly", "at": 4.7, "dur": 0.8, "from": "reader", "to": "claim", "label": "your part?" },
      { "kind": "say", "at": 5.5, "actor": "card", "text": "no share", "tone": "bad" },
      { "kind": "verdict", "at": 6.0, "text": "A bare number fails every part", "tone": "bad" }
    ],
    "loop": 9.5
  }
}
```

## What the learner should notice
Four questions are about the number and one is about the writer. Together they cover the six parts of the card. All five are normal questions for any number.
