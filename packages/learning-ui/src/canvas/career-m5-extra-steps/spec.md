---
artifact: canvas-spec
course: career-brand
chapter: "5.3"
beat: 1
slug: career-m5-extra-steps
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Every extra step is a door to leave

## Teaching claim
Every extra step between a reader and your app is a place to leave. Let them in with one click or a ready demo login.

## Why this visual
The same reader meets a four-step sign-up path and a one-button path, one after the other.

## Data
This is a course rule from the brief (instant access). Do not quote a number of lost visitors: the common figure is a shop's claim about carts, not a measurement of demos.

```json
{
  "title": "Every extra step is a door to leave",
  "purpose": "A reader meets a path of sign-up, email confirmation and a profile form before the app, and leaves. Then the reader meets one button that goes straight in, and uses the app.",
  "limits": "A made-up reader. Some readers will make an account, but fewer than will press one button. Do not read any percentage into the picture.",
  "hint": "The same reader, two paths.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "wants a look", "x": 210, "y": 105 },
      { "id": "long", "label": "Sign-up", "kind": "note", "sub": "four steps", "x": 62, "y": 250 },
      { "id": "short", "label": "One button", "kind": "note", "sub": "straight in", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "reader", "to": "long", "label": "sign up first" },
      { "kind": "say", "at": 1.4, "actor": "long", "text": "confirm, form", "tone": "warn" },
      { "kind": "say", "at": 2.0, "actor": "reader", "text": "gives up", "tone": "bad" },
      { "kind": "fly", "at": 3.2, "dur": 1.0, "from": "reader", "to": "short", "label": "one click" },
      { "kind": "say", "at": 4.3, "actor": "short", "text": "in the app", "tone": "good" },
      { "kind": "verdict", "at": 4.9, "text": "Every step is a door to leave by", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The app behind both paths is identical. Only the number of steps before it changed.
