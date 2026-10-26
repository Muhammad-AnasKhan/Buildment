---
artifact: canvas-spec
course: career-brand
chapter: "2.3"
beat: 1
slug: career-m2-one-line-opens
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: One line hides a whole role

## Teaching claim
A resume line is the last step. The career arc keeps everything behind it, so you can choose later what to show.

## Why this visual
One short line opens into the parts that sit behind it: the fix, the numbers and the permission.

## Data
This is private material (the arc). Areej is a fictional fellow and her numbers are illustrative.

```json
{
  "title": "One line hides a whole role",
  "purpose": "'Intern, 2025' opens into what sits behind it: the report fix with her lead's review, the numbers, and the permission to show them.",
  "limits": "Areej is a fictional fellow and her numbers are illustrative. In public she writes 'a parcel delivery company's back office'; the company name stays in the private arc.",
  "hint": "Watch one line open.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "line", "label": "Resume line", "kind": "note", "sub": "Intern, 2025", "x": 210, "y": 105 },
      { "id": "fix", "label": "The fix", "kind": "note", "sub": "lead reviewed", "x": 62, "y": 250 },
      { "id": "numbers", "label": "Numbers", "kind": "note", "sub": "4.6 s to 0.41 s", "x": 210, "y": 250 },
      { "id": "permission", "label": "Permission", "kind": "note", "sub": "names removed", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "line", "to": "fix", "label": "what I did" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "line", "to": "numbers", "label": "what changed" },
      { "kind": "fly", "at": 2.7, "dur": 1.0, "from": "line", "to": "permission", "label": "may I show it?" },
      { "kind": "say", "at": 3.9, "actor": "line", "text": "one short line", "tone": "accent" },
      { "kind": "verdict", "at": 4.4, "text": "One line hides a whole role", "tone": "accent" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The line on a resume is short. The three things behind it are what the arc keeps.

## Limits
In the `limits` field of the data.
