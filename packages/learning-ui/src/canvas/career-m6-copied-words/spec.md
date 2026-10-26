---
artifact: canvas-spec
course: career-brand
chapter: "6.5"
beat: 5
slug: career-m6-copied-words
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Copied words carry nothing

## Teaching claim
Pasting the posting's words into a resume adds nothing. Tailoring means changing what goes first. If you cannot back a line with proof, take it out. Keyword stuffing and white text are dishonest.

## Why this visual
Two resumes go to the same reader: one stuffed with the posting's words and one with the same facts in a new order.

## Data
A tailored, polished letter lost its signal once AI made it cheap. A resume company's cover-letter study is a company claim and must not be quoted.

```json
{
  "title": "Copied words carry nothing",
  "purpose": "A resume with the posting's own words pasted in gives the reader no proof. A resume with the same facts reordered, proof first, gets read on.",
  "limits": "A made-up reader. This is a course habit, not a measured result. Keyword stuffing and hidden white text are dishonest and are never taught.",
  "hint": "Pasted words, or proof first?",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "stuffed", "label": "Copied", "kind": "note", "sub": "pasted words", "x": 62, "y": 110 },
      { "id": "reordered", "label": "Reordered", "kind": "note", "sub": "same facts", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "looks for proof", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "stuffed", "to": "reader", "label": "their own words" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "sees no proof", "tone": "bad" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "reordered", "to": "reader", "label": "proof first" },
      { "kind": "say", "at": 3.7, "actor": "reader", "text": "reads on", "tone": "good" },
      { "kind": "verdict", "at": 4.4, "text": "Change the order, not the words", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The first resume looked like a match and had nothing behind it. The second looked plainer and had the proof at the top.
