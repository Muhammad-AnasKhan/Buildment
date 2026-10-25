---
artifact: canvas-spec
course: career-brand
chapter: "6.4"
beat: 2
slug: career-m6-old-bullet-marked
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: What an empty sentence looks like

## Teaching claim
Remove every word a reader cannot check from Areej's old bullet and almost nothing is left. Check your own drafts for the habits that make text empty.

## Why this visual
A reader questions the old bullet's phrases one at a time, and each comes back empty.

## Data
The old bullet is from the canon: "Responsible for leveraging cutting-edge technologies to drive seamless performance improvements across robust backend systems." Patterns that make text empty are for orientation only (inflated significance, unnamed experts, trailing -ing phrases, "not just X but also Y", lists of three, promotional adjectives); word lists date by model era and one word proves nothing.

```json
{
  "title": "What an empty sentence looks like",
  "purpose": "A reader questions Areej's old bullet one phrase at a time: leveraging, seamless, robust. Each comes back empty, and almost nothing a reader can check is left.",
  "limits": "Areej is a fictional fellow. The patterns are for orientation, not a banned list: one word proves nothing, and the same words can be fine in another sentence. The edit is about information, not about sounding human.",
  "hint": "Question each phrase.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "bullet", "label": "Old bullet", "kind": "note", "sub": "responsible for", "x": 62, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "checks words", "x": 358, "y": 110 },
      { "id": "left", "label": "What is left", "kind": "note", "sub": "after the edit", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 0.9, "from": "reader", "to": "bullet", "label": "leveraging?" },
      { "kind": "fly", "at": 1.4, "dur": 0.9, "from": "reader", "to": "bullet", "label": "seamless?" },
      { "kind": "fly", "at": 2.5, "dur": 0.9, "from": "reader", "to": "bullet", "label": "robust?" },
      { "kind": "say", "at": 3.5, "actor": "bullet", "text": "all empty", "tone": "bad" },
      { "kind": "say", "at": 4.1, "actor": "left", "text": "no facts", "tone": "bad" },
      { "kind": "verdict", "at": 4.8, "text": "Almost nothing is left", "tone": "bad" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The bullet was not wrong. It just held no fact a reader could ask about.
