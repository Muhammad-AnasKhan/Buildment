---
artifact: canvas-spec
course: career-brand
chapter: "6.3"
beat: 1
slug: career-m6-duty-vs-bullet
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: "Responsible for" is a job description

## Teaching claim
A duty says what you were supposed to do. A bullet says what changed because you did it.

## Why this visual
The same reader meets a duty line and an owned bullet, and the question each one answers is different.

## Data
Waed's rewrite is from the canon: "Built a shared delivery tracker that cut missed delivery confirmations from about 90 to 18 (team tracker, three months before and after)."

```json
{
  "title": "\"Responsible for\" is a job description",
  "purpose": "A duty line says what Waed was supposed to do. Her owned bullet says what changed because she did it: missed delivery confirmations fell from 90 to 18, counted from the team tracker over three months before and after, while teammates also began a daily check.",
  "limits": "Her numbers are illustrative. A duty line is not wrong; it just does not answer the reader's next question.",
  "hint": "Two lines, two questions.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "duty", "label": "Duty line", "kind": "note", "sub": "responsible for", "x": 62, "y": 110 },
      { "id": "bullet", "label": "Her bullet", "kind": "note", "sub": "90 to 18", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "wants a change", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "duty", "to": "reader", "label": "what the job was" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "what changed?", "tone": "warn" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "bullet", "to": "reader", "label": "what changed" },
      { "kind": "say", "at": 3.7, "actor": "reader", "text": "has an answer", "tone": "good" },
      { "kind": "verdict", "at": 4.4, "text": "A duty is not a result", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The first line leaves the reader's question open. The second answers it before it is asked.
