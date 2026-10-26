---
artifact: canvas-spec
course: career-brand
chapter: "3.2"
beat: 6
slug: career-m3-not-measured
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: "Not measured" is a complete answer

## Teaching claim
"I did not measure that, and here is how I would" is a complete and honest sentence. A gap with a plan is a finished row.

## Why this visual
A reader asks a question the card cannot answer. The card says so, and the plan fills the gap without inventing a number.

## Data
The gap and the plan are from the canon (Areej, freelance): she never measured whether customers received invoices sooner. Areej is a fictional fellow.

```json
{
  "title": "\"Not measured\" is a complete answer",
  "purpose": "A reader asks whether customers got Areej's invoices sooner. She did not measure it. Her card says so and holds a plan: ask the owner for two weeks of order and invoice times and compare.",
  "limits": "Lab studies found that truth tellers give more checkable details than liars; that is research on accounts of events, not resumes, so use it only as a reason to prefer checkable claims.",
  "hint": "An honest gap, with a plan.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "curious", "x": 62, "y": 110 },
      { "id": "card", "label": "Claim card", "kind": "note", "sub": "result: a gap", "x": 358, "y": 110 },
      { "id": "plan", "label": "Her plan", "kind": "note", "sub": "ask for times", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "reader", "to": "card", "label": "sent sooner?" },
      { "kind": "say", "at": 1.4, "actor": "card", "text": "not measured", "tone": "warn" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "card", "to": "plan", "label": "how I would" },
      { "kind": "say", "at": 3.5, "actor": "plan", "text": "two weeks", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "A gap with a plan is complete", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The card did not invent a number to fill the field. The plan is specific enough that someone could carry it out.
