---
artifact: canvas-spec
course: career-brand
chapter: "3.3"
beat: 4
slug: career-m3-time-saved-net
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Time saved is net, not gross

## Teaching claim
Time saved is what the task took, minus what it still takes, minus the upkeep. Use the median of a task you timed as it is done today, and subtract upkeep.

## Why this visual
Four boxes show the arithmetic as flows: the gross saving goes in, the upkeep comes out, and the net is what is left.

## Data
Numbers are the canon's (the print shop invoice script). Per invoice 7 minutes become 1 minute, so 6 minutes are saved on each of about 31 invoices a week: 186 minutes gross. Upkeep is about 7 minutes a week. Net 179 minutes, about 3 hours a week.

```json
{
  "title": "Time saved is net, not gross",
  "purpose": "Areej's script saves 6 minutes on each of about 31 invoices a week, 186 minutes gross. Upkeep takes about 7 minutes a week. The net is 179 minutes, about 3 hours a week.",
  "limits": "31 is the average of about 32 and 30.5 invoices a week in the two timed fortnights. A timer beats memory, which is easy to bend, so time the task as it is done today and use the median.",
  "hint": "Gross in, upkeep out, net left.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "invoices", "label": "Invoices", "kind": "note", "sub": "31 a week", "x": 62, "y": 110 },
      { "id": "script", "label": "Script", "kind": "worker", "sub": "7 min to 1 min", "x": 358, "y": 110 },
      { "id": "upkeep", "label": "Upkeep", "kind": "clock", "sub": "7 min a week", "x": 62, "y": 250 },
      { "id": "net", "label": "Net saving", "kind": "note", "sub": "after upkeep", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "invoices", "to": "script", "label": "6 min x 31" },
      { "kind": "say", "at": 1.4, "actor": "script", "text": "186 min gross", "tone": "accent" },
      { "kind": "fly", "at": 2.2, "dur": 1.0, "from": "script", "to": "net", "label": "gross 186" },
      { "kind": "fly", "at": 3.4, "dur": 1.0, "from": "upkeep", "to": "net", "label": "minus 7" },
      { "kind": "say", "at": 4.6, "actor": "net", "text": "179 min = 3 h", "tone": "good" },
      { "kind": "verdict", "at": 5.2, "text": "Time saved is net, not gross", "tone": "good" }
    ],
    "loop": 9
  }
}
```

## What the learner should notice
The 186 is the number that sounds best and the 179 is the one that is true. The difference is small here and larger when upkeep is bigger.
