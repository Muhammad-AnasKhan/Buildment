---
artifact: canvas-spec
course: career-brand
chapter: "6.5"
beat: 3
slug: career-m6-tailoring-reorder
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Tailoring changes what comes first

## Teaching claim
Tailoring means changing what goes first, not copying the posting's words. For a posting about PostgreSQL performance work, the report bullet moves up and the summary starts with the backend focus.

## Why this visual
The posting, the same resume and the reader: the facts do not change, only their order.

## Data
From the canon: a backend developer posting at a small logistics software startup that asks for PostgreSQL performance work. Areej moves the report bullet first, moves Campus Board above Volunteer, and changes the summary to start with "Backend-leaning full-stack developer". She does not copy the posting's words.

```json
{
  "title": "Tailoring changes what comes first",
  "purpose": "A posting asks for database speed work. Areej moves her report bullet to the top and starts her summary 'Backend-leaning full-stack developer'. The facts are the same; the order is new.",
  "limits": "One company says it checks whether an application was tailored and whether the candidate tried the product. Tailoring is a habit, not a guarantee of a reply.",
  "hint": "Same facts, new order.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "posting", "label": "The posting", "kind": "note", "sub": "database speed", "x": 62, "y": 110 },
      { "id": "resume", "label": "Her resume", "kind": "note", "sub": "same facts", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "looks for speed", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "posting", "to": "reader", "label": "asks for speed" },
      { "kind": "say", "at": 1.4, "actor": "resume", "text": "report first", "tone": "good" },
      { "kind": "say", "at": 2.0, "actor": "resume", "text": "new summary", "tone": "accent" },
      { "kind": "fly", "at": 2.8, "dur": 1.0, "from": "resume", "to": "reader", "label": "report bullet" },
      { "kind": "say", "at": 3.9, "actor": "reader", "text": "finds it fast", "tone": "good" },
      { "kind": "verdict", "at": 4.6, "text": "Same facts, new order", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
No line was added. Three things moved: the first bullet, the project order and the summary.
