---
artifact: canvas-spec
course: career-brand
chapter: "9.2"
beat: 3
slug: career-m9-one-change
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: One change to the kit

## Teaching claim
Turn a flag into one change in the kit: fix the source of the problem, the line and its ledger row, not only the wording of your answer.

## Why this visual
A flag goes to the kit line and to the ledger row, and both change.

## Data
From the canon: Areej's capstone feedback flagged "vague ownership" on "we deployed it". She fixes it to "my lead deployed it after my migration passed review" in the line and in the ledger.

```json
{
  "title": "One change to the kit",
  "purpose": "The interviewer flags 'we deployed it' for vague ownership. Areej changes the kit line to name her part and her lead's, and updates the ledger row so the two match.",
  "limits": "A flag is feedback, not a pass or a fail. Fixing only the spoken answer would leave the kit saying the old thing.",
  "hint": "Fix the line and the row.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "flag", "label": "Flag", "kind": "note", "sub": "vague ownership", "x": 62, "y": 110 },
      { "id": "line", "label": "Kit line", "kind": "note", "sub": "we deployed it", "x": 358, "y": 110 },
      { "id": "ledger", "label": "Ledger row", "kind": "note", "sub": "share to fix", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "flag", "to": "line", "label": "fix the line" },
      { "kind": "say", "at": 1.4, "actor": "line", "text": "names her part", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "line", "to": "ledger", "label": "fix the source" },
      { "kind": "say", "at": 3.5, "actor": "ledger", "text": "share updated", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "Fix the source, not just the words", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The new line is longer and more specific. The ledger row changed with it, so the kit stays consistent.
