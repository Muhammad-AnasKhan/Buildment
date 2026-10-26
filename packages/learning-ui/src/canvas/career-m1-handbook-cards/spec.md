---
artifact: canvas-spec
course: career-brand
chapter: "1.3"
beat: 1
slug: career-m1-handbook-cards
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: What hiring teams say they want

## Teaching claim
Hiring teams that publish how they hire describe wanting to see your thinking: what you changed, how you know, and what you would do next.

## Why this visual
Two handbook cards send their stated wants to one reader. Seeing the two lists land on the same person shows what they have in common without a table.

## Data
```json
{
  "title": "What hiring teams say they want",
  "purpose": "Two companies' public hiring handbooks each send a short list of what they look for. Both lists ask to see how you think. One also warns that gold-plated extras can hurt.",
  "limits": "Each handbook is one company's description of itself, not a tested predictor of who gets hired. Do not treat either list as a rule for every employer.",
  "hint": "Watch both lists arrive.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "a", "label": "Handbook A", "kind": "note", "sub": "one company", "x": 62, "y": 110 },
      { "id": "b", "label": "Handbook B", "kind": "note", "sub": "one company", "x": 358, "y": 110 },
      { "id": "you", "label": "You", "kind": "user", "sub": "reading both", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "a", "to": "you", "label": "proactive" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "a", "to": "you", "label": "sees impact" },
      { "kind": "fly", "at": 2.7, "dur": 1.0, "from": "a", "to": "you", "label": "iterates" },
      { "kind": "fly", "at": 3.9, "dur": 1.0, "from": "b", "to": "you", "label": "sound thinking" },
      { "kind": "fly", "at": 5.1, "dur": 1.0, "from": "b", "to": "you", "label": "real problems" },
      { "kind": "say", "at": 6.2, "actor": "b", "text": "extras can hurt", "tone": "warn" },
      { "kind": "say", "at": 6.4, "actor": "you", "text": "show thinking", "tone": "good" },
      { "kind": "verdict", "at": 6.9, "text": "Both want to see your thinking", "tone": "good" }
    ],
    "loop": 10.5
  }
}
```

## What the learner should notice
The words differ, the ask is the same: show what you changed, how you know and what you would do next.

## Limits
In the `limits` field of the data.
