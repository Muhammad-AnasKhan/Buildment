---
artifact: canvas-spec
course: career-brand
chapter: "4.2"
beat: 3
slug: career-m4-pile-of-apps
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A working app alone proves less

## Teaching claim
If anyone can generate a working app in a weekend, a working app proves less. What is hard to fake is a real person who used it, a measured result, and a decision with its reason.

## Why this visual
A pile of look-alike apps and one project that carries three things a reader can ask about.

## Data
This is a labelled inference from the studies in beats 1 and 2 and from module 1, not a measured finding. "You are the product": the reader judges how you think and check, not how much code you wrote.

```json
{
  "title": "A working app alone proves less",
  "purpose": "A reader meets a pile of near-identical weekend apps. One project stands out because it carries a real user, a number and a written decision.",
  "limits": "This is an inference, not a measured finding: if a working app is cheap to make, it says less about the maker. The picture does not say building is pointless; it says the build is not the proof.",
  "hint": "One project among many.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "pile", "label": "Many apps", "kind": "note", "sub": "look alike", "x": 62, "y": 110 },
      { "id": "project", "label": "This project", "kind": "note", "sub": "user and number", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "looking", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "pile", "to": "reader", "label": "all alike" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "moves on", "tone": "warn" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "project", "to": "reader", "label": "a real user" },
      { "kind": "fly", "at": 3.6, "dur": 1.0, "from": "project", "to": "reader", "label": "a number" },
      { "kind": "fly", "at": 4.8, "dur": 1.0, "from": "project", "to": "reader", "label": "a decision, why" },
      { "kind": "say", "at": 6.0, "actor": "reader", "text": "stops here", "tone": "good" },
      { "kind": "verdict", "at": 6.5, "text": "A user, a number and a reason", "tone": "good" }
    ],
    "loop": 10
  }
}
```

## What the learner should notice
The standout project is not bigger. It simply gives the reader three things to ask about and answer.
