---
artifact: canvas-spec
course: career-brand
chapter: "5.1"
beat: 2
slug: career-m5-sleep-then-signup
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A minute to wake, then a sign-up

## Teaching claim
A demo on a free plan can be asleep when a reader opens it, and then it asks for an account. Many readers will close the tab at either step.

## Why this visual
A wait ring on the demo, then a sign-up form, then a closed tab: the two obstacles come one after the other.

## Data
Free-plan facts are dated: a free web service on one host spins down after 15 minutes without traffic and takes about a minute to wake (checked 2026-10; verify before publish). The minute is the host's wake time, not the founder's patience.

```json
{
  "title": "A minute to wake, then a sign-up",
  "purpose": "The founder opens Moath's demo link. The free service is asleep and takes about a minute to wake. Then a sign-up form asks for an email confirmation. The founder closes the tab.",
  "limits": "Free plans differ and change their rules. Checked 2026-10; check before you rely on it, and trust your own screen. The wait counts up to about a minute only for the story. No number is given for how long a founder waits.",
  "hint": "Two obstacles, one after the other.",
  "scene": {
    "width": 420,
    "height": 340,
    "actors": [
      { "id": "founder", "label": "Founder", "kind": "user", "sub": "opens demo", "x": 358, "y": 110 },
      { "id": "demo", "label": "Demo link", "kind": "server", "sub": "asleep", "x": 62, "y": 250 },
      { "id": "form", "label": "Sign-up form", "kind": "note", "sub": "email needed", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "founder", "to": "demo", "label": "open demo" },
      { "kind": "wait", "at": 1.5, "dur": 2.5, "actor": "demo", "label": "waking {n} s", "doneLabel": "awake", "total": 60 },
      { "kind": "fly", "at": 4.3, "dur": 1.0, "from": "demo", "to": "form", "label": "sign up" },
      { "kind": "say", "at": 5.4, "actor": "form", "text": "confirm email", "tone": "warn" },
      { "kind": "say", "at": 6.0, "actor": "founder", "text": "closes the tab", "tone": "bad" },
      { "kind": "verdict", "at": 6.6, "text": "Asleep, then a sign-up wall", "tone": "bad" }
    ],
    "loop": 10
  }
}
```

## What the learner should notice
Neither obstacle is a bug. Both are normal on a free plan, and together they hide the app.
