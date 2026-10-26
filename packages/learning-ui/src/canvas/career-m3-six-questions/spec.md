---
artifact: canvas-spec
course: career-brand
chapter: "3.4"
beat: 1
slug: career-m3-six-questions
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Six questions for any number

## Teaching claim
Before you quote a number from a dashboard you did not set up, ask six questions: what it measures, which statistic, over what window, where the data comes from, what else changed, and who owns it.

## Why this visual
Six short questions go from the learner to one tile, one at a time, with the tile's owner as the person to ask. Seeing the whole set once makes it easy to recall.

## Data
```json
{
  "title": "Six questions for any number",
  "purpose": "You meet a dashboard tile you did not set up. Six questions go to the tile one at a time, and its owner is the person who can answer the ones the tile cannot.",
  "limits": "The six questions are this course's method, drawn from the SRE books and the monitoring documentation. They do not cover every dashboard. Ask the owner how a number is collected rather than guessing.",
  "hint": "Ask all six before you quote it.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "you", "label": "You", "kind": "user", "sub": "six questions", "x": 62, "y": 110 },
      { "id": "tile", "label": "The tile", "kind": "note", "sub": "a number", "x": 358, "y": 110 },
      { "id": "owner", "label": "Tile's owner", "kind": "user", "sub": "knows the rest", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 0.9, "from": "you", "to": "tile", "label": "measures what?" },
      { "kind": "fly", "at": 1.4, "dur": 0.9, "from": "you", "to": "tile", "label": "which statistic?" },
      { "kind": "fly", "at": 2.5, "dur": 0.9, "from": "you", "to": "tile", "label": "what window?" },
      { "kind": "fly", "at": 3.6, "dur": 0.9, "from": "you", "to": "tile", "label": "data from where?" },
      { "kind": "fly", "at": 4.7, "dur": 0.9, "from": "you", "to": "tile", "label": "what else changed?" },
      { "kind": "fly", "at": 5.8, "dur": 0.9, "from": "you", "to": "tile", "label": "who owns it?" },
      { "kind": "say", "at": 6.8, "actor": "owner", "text": "ask me", "tone": "good" },
      { "kind": "verdict", "at": 7.3, "text": "Ask all six before you quote it", "tone": "good" }
    ],
    "loop": 10.5
  }
}
```

## What the learner should notice
The tile can answer some of the six. The owner answers the rest. The last question is also a permission question: may the number be used in public.
