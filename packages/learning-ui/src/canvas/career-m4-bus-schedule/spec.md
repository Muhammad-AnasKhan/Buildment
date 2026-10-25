---
artifact: canvas-spec
course: career-brand
chapter: "4.3"
beat: 3
slug: career-m4-bus-schedule
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Useful with one user

## Teaching claim
A tool that works for one person, or one small group you already know, is useful on day one without waiting for anyone else to join.

## Why this visual
Sireen's reshaped idea has a driver and 14 families on the first day. Nothing waits for a second side.

## Data
Sireen's reshaped idea is from the canon: a pickup schedule for her cousin's school bus run, one driver she knows and 14 families.

```json
{
  "title": "Useful with one user",
  "purpose": "Sireen reshapes her idea into a pickup schedule for her cousin's school bus run. There is one driver she knows and 14 families, and the schedule is useful on day one.",
  "limits": "Sireen is a fictional fellow. One practitioner essay argues that many network products began with a mode that was useful without other users; that is an essay, not a study. A small known group on day one is the second safe shape.",
  "hint": "One driver, 14 families, day one.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "sireen", "label": "Sireen", "kind": "user", "sub": "reshaped idea", "x": 62, "y": 105 },
      { "id": "app", "label": "Pickup times", "kind": "phone", "sub": "for one bus run", "x": 358, "y": 105 },
      { "id": "driver", "label": "One driver", "kind": "user", "sub": "she knows him", "x": 62, "y": 250 },
      { "id": "families", "label": "14 families", "kind": "user", "sub": "see the times", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "sireen", "to": "app", "label": "bus run times" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "app", "to": "driver", "label": "today's route" },
      { "kind": "fly", "at": 2.9, "dur": 1.0, "from": "app", "to": "families", "label": "pickup times" },
      { "kind": "say", "at": 4.0, "actor": "driver", "text": "uses it", "tone": "good" },
      { "kind": "say", "at": 4.2, "actor": "families", "text": "use it", "tone": "good" },
      { "kind": "verdict", "at": 4.8, "text": "Useful on day one, with one driver", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
Nobody had to wait for a second group. The number to measure here would be missed pickups, and the reader can ask the driver.
