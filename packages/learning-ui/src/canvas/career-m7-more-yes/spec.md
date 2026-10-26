---
artifact: canvas-spec
course: career-brand
chapter: "7.4"
beat: 1
slug: career-m7-more-yes
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: People say yes more than you expect

## Teaching claim
In studies of asking for help, people underestimated, by as much as 50 percent in some studies, how likely others were to say yes to a direct, small request. Send the message.

## Why this visual
An asker who expects a no, and people who say yes more often than expected. The mismatch is the claim.

## Data
Flynn and Lake: across six studies, people underestimated by as much as 50 percent the chance a stranger would agree to a direct request. Asking for advice made seekers look more competent, more so on hard tasks and when asking an expert personally. No bars with numbers are drawn, because the figure is a range across studies, not one value.

```json
{
  "title": "People say yes more than you expect",
  "purpose": "An asker expects a no and sends a small, direct request. The other person says yes. In studies of asking for help, people underestimated how often others say yes, by as much as 50 percent in some studies.",
  "limits": "The asker is made up. The studies were mostly about small, direct requests, not job offers, and the effect varied. This is a reason to send the message, not a promise of a reply.",
  "hint": "A small, direct ask.",
  "scene": {
    "width": 420,
    "height": 300,
    "actors": [
      { "id": "asker", "label": "Asker", "kind": "user", "sub": "expects a no", "x": 62, "y": 120 },
      { "id": "others", "label": "Others", "kind": "user", "sub": "often say yes", "x": 358, "y": 120 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.2, "from": "asker", "to": "others", "label": "small direct ask" },
      { "kind": "fly", "at": 1.8, "dur": 1.2, "from": "others", "to": "asker", "label": "yes" },
      { "kind": "say", "at": 3.1, "actor": "asker", "text": "surprised", "tone": "good" },
      { "kind": "verdict", "at": 3.8, "text": "People say yes more than you expect", "tone": "good" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
The fear of a no was bigger than the real chance of one. A small, direct message is cheap to send.
