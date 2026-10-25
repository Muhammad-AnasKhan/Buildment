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

# Canvas spec: A demo login that can do everything

## Teaching claim
A "Try the demo" button that opens the full app on a fake shop lets a stranger try every core feature. The safety comes from the data and rights around it, not from hiding features.

## Why this visual
One tap goes straight into the full app and the data inside it is visibly fake.

## Data
Areej's demo plan for Raqim Stock is from the canon: a fake shop with fake stock, a seeded demo account that can do everything, no real email or payments.

```json
{
  "title": "A demo login that can do everything",
  "purpose": "A stranger taps 'Try the demo' and the full app opens on a fake shop with fake stock. Every core feature works, and nothing in it belongs to a real person.",
  "limits": "Areej is a fictional fellow. A demo that can do everything is only safe with the controls in the next beat: fake data, low rights, limits and a reset, and no real keys.",
  "hint": "One tap into the full app.",
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
      { "kind": "say", "at": 2.7, "actor": "app", "text": "fake stock", "tone": "good" },
      { "kind": "say", "at": 3.4, "actor": "stranger", "text": "can try it all", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "A demo login that does everything", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Nothing is hidden from the stranger. What is protected is the data and the world outside the demo.
