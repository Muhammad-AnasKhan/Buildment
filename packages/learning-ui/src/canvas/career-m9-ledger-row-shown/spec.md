---
artifact: canvas-spec
course: career-brand
chapter: "9.1"
beat: 2
slug: career-m9-ledger-row-shown
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: He opens the ledger

## Teaching claim
An answer is believable when the row is there: the source, the window, the learner's own change, and what else changed. A drop that is partly the team's is said to be shared.

## Why this visual
The ledger row, the learner's change and the team's change appear around one mentor's question.

## Data
From the canon: Ismail's ledger row is escaped bugs per release from the bug tracker, 10 per release over five releases before and 6 per release over five releases after; 10 to 6 is 40 percent. His own change was a regression checklist; the team also started code review in the same period, so he says the drop is shared.

```json
{
  "title": "He opens the ledger",
  "purpose": "Ismail opens his ledger row: escaped bugs per release from the bug tracker, 10 over five releases before and 6 over five after. His regression checklist is his change. The team also began code review in the same period, so he says the drop is shared.",
  "limits": "His numbers are illustrative. 10 to 6 is 40 percent. A plain before and after cannot prove that the checklist caused the drop, which is why he names what else changed.",
  "hint": "Source, window, his change, what else changed.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "ismail", "label": "Ismail", "kind": "user", "sub": "opens the row", "x": 62, "y": 105 },
      { "id": "mentor", "label": "Mentor", "kind": "user", "sub": "asked where", "x": 358, "y": 105 },
      { "id": "ledger", "label": "Ledger row", "kind": "note", "sub": "10 to 6", "x": 62, "y": 250 },
      { "id": "review", "label": "Code review", "kind": "note", "sub": "started too", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "ismail", "to": "ledger", "label": "bug tracker" },
      { "kind": "say", "at": 1.4, "actor": "ledger", "text": "5 releases each", "tone": "accent" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "ismail", "to": "mentor", "label": "my checklist" },
      { "kind": "say", "at": 3.5, "actor": "review", "text": "same period", "tone": "warn" },
      { "kind": "say", "at": 4.0, "actor": "mentor", "text": "believes him", "tone": "good" },
      { "kind": "verdict", "at": 4.7, "text": "A shared drop, shown honestly", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
He did not claim all 40 percent. Naming the team's code review is what made the rest believable.
