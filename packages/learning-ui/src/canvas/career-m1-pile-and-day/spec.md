---
artifact: canvas-spec
course: career-brand
chapter: "1.2"
beat: 1
slug: career-m1-pile-and-day
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: More applications than time to read

## Teaching claim
One reader has far more applications than a working day can hold, so only a few get a close read and the first look has to be quick.

## Why this visual
The claim is a comparison of a pile and a day. A day strip with the pile still tall at the end shows it without a statistic.

## Data
```json
{
  "title": "More applications than time to read",
  "purpose": "One reader works through a pile of applications. The day ends and the pile is still tall. Only a few were read closely.",
  "limits": "A made-up reader and a made-up day. The hours are only a frame for the story. One software company that publishes how it hires says it gets more applications than it can read; that is one example, not a rule for every employer.",
  "hint": "Watch one working day go by.",
  "scene": {
    "width": 420,
    "height": 320,
    "actors": [
      { "id": "pile", "label": "Applications", "kind": "note", "sub": "far too many", "x": 62, "y": 115 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "one workday", "x": 358, "y": 115 }
    ],
    "strip": { "y": 275, "from": 0, "to": 8, "unit": "h", "caption": "one working day", "every": 2 },
    "events": [
      { "kind": "tag", "at": 0.2, "row": 0, "value": 0, "label": "9 am: pile", "tone": "accent" },
      { "kind": "fly", "at": 0.5, "dur": 0.7, "from": "pile", "to": "reader", "label": "application" },
      { "kind": "say", "at": 1.2, "actor": "reader", "text": "skims", "tone": "accent" },
      { "kind": "fly", "at": 1.6, "dur": 0.7, "from": "pile", "to": "reader", "label": "application" },
      { "kind": "fly", "at": 2.4, "dur": 0.7, "from": "pile", "to": "reader", "label": "application" },
      { "kind": "say", "at": 3.3, "actor": "reader", "text": "close read: few", "tone": "good" },
      { "kind": "say", "at": 3.6, "actor": "pile", "text": "still tall", "tone": "warn" },
      { "kind": "tag", "at": 4.0, "row": 1, "value": 8, "label": "5 pm: pile left", "tone": "warn" },
      { "kind": "verdict", "at": 4.6, "text": "Only a few get a close read", "tone": "warn" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The reader is not lazy. There is simply more than one day can hold, so the proof has to be easy to find.

## Limits
In the `limits` field of the data.
