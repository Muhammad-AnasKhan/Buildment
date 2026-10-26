---
artifact: canvas-spec
course: career-brand
chapter: "5.3"
beat: 3
slug: career-m5-demo-login
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A demo login that opens every core feature

## Teaching claim
A "Try the demo" button that opens the full app on a fake shop lets a stranger try every core feature. The safety comes from the data and rights around it, not from hiding features.

## Why this visual
One tap goes straight into the full app and the data inside it is visibly fake.

## Data
Areej's demo plan for Raqim Stock is from the canon: a fake shop with fake stock, a seeded demo account (filled with fake data made up on purpose) that opens every core feature with small rights, no real email or payments.

```json
{
  "title": "A demo login that opens every core feature",
  "purpose": "A stranger taps 'Try the demo' and the app opens on a fake shop with fake stock. Every core feature works, the account has small rights, and the owner's real rights stay out.",
  "limits": "A demo login is only safe with the controls in the next picture: fake data, low rights, limits with a reset, and no real keys.",
  "hint": "One tap into the app.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "stranger", "label": "Stranger", "kind": "user", "sub": "wants a look", "x": 62, "y": 110 },
      { "id": "button", "label": "Try the demo", "kind": "note", "sub": "one button", "x": 358, "y": 110 },
      { "id": "app", "label": "Raqim Stock", "kind": "phone", "sub": "fake shop", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "stranger", "to": "button", "label": "tap" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "button", "to": "app", "label": "opens" },
      { "kind": "say", "at": 2.5, "actor": "app", "text": "fake stock", "tone": "good" },
      { "kind": "say", "at": 3.2, "actor": "button", "text": "small rights", "tone": "good" },
      { "kind": "say", "at": 3.9, "actor": "stranger", "text": "tries every feature", "tone": "good" },
      { "kind": "verdict", "at": 4.6, "text": "A demo login that opens the core", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Nothing is hidden from the stranger. What is protected is the data and the world outside the demo.
