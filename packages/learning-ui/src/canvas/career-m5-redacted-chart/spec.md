---
artifact: canvas-spec
course: career-brand
chapter: "5.5"
beat: 5
slug: career-m5-redacted-chart
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Permission and removed names

## Teaching claim
When a case study uses an employer's chart, ask first, remove the company and table names and any customer data, and say it is shared with permission.

## Why this visual
The chart appears with its names blurred and a line under it that says it is shared with permission.

## Data
From the canon: Areej's public title uses "a parcel delivery company"; the redacted chart is what her lead allowed.

```json
{
  "title": "Permission and removed names",
  "purpose": "Areej's case study shows the report chart with the company name and table names blurred. A line under it says it is shared with permission. The numbers stay.",
  "limits": "Permission is a rule of this course, not legal advice. When in doubt keep the number private. The rule is taught in 3.3; this is its use in a case study.",
  "hint": "Names off, numbers kept.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "chart", "label": "Report chart", "kind": "note", "sub": "names blurred", "x": 62, "y": 110 },
      { "id": "caption", "label": "Caption", "kind": "note", "sub": "with permission", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "sees the proof", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "say", "at": 0.6, "actor": "chart", "text": "tables blurred", "tone": "good" },
      { "kind": "fly", "at": 1.2, "dur": 1.0, "from": "chart", "to": "reader", "label": "4.6 s to 0.41 s" },
      { "kind": "fly", "at": 2.5, "dur": 1.0, "from": "caption", "to": "reader", "label": "shared with ok" },
      { "kind": "say", "at": 3.6, "actor": "reader", "text": "trusts it", "tone": "good" },
      { "kind": "verdict", "at": 4.3, "text": "Names removed, permission shown", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Removing the names did not remove the proof. The numbers and the source type are still there.
