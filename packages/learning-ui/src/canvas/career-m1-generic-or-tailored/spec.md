---
artifact: canvas-spec
course: career-brand
chapter: "1.3"
beat: 5
slug: career-m1-generic-or-tailored
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Real tailoring shows you looked

## Teaching claim
An application that mentions trying the product and one change you would make shows you looked. The same text sent to everyone does not.

## Why this visual
One reader meets two applications in turn. The difference in what the reader does next is the claim.

## Data
```json
{
  "title": "Real tailoring shows you looked",
  "purpose": "A reader opens a generic application and skims it. Then the reader opens one that says the writer tried the product and names a change, and reads on.",
  "limits": "One company says its review checks whether the application was tailored and whether the candidate tried the product or read its handbook. That is one company's practice. Real tailoring changes which evidence comes first (module 6); pasting the posting's words carries nothing.",
  "hint": "Watch what the reader does with each one.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "two letters", "x": 210, "y": 105 },
      { "id": "generic", "label": "Generic", "kind": "note", "sub": "same for all", "x": 62, "y": 250 },
      { "id": "tailored", "label": "Tailored", "kind": "note", "sub": "tried product", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "generic", "to": "reader", "label": "Dear Sir or Madam" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "skims", "tone": "warn" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "tailored", "to": "reader", "label": "tried your product" },
      { "kind": "say", "at": 3.7, "actor": "reader", "text": "reads on", "tone": "good" },
      { "kind": "mark", "at": 3.7, "actor": "tailored", "tone": "good" },
      { "kind": "verdict", "at": 4.4, "text": "Tailoring shows you looked", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The tailored application is not longer. It is specific to this reader's work.

## Limits
In the `limits` field of the data.
