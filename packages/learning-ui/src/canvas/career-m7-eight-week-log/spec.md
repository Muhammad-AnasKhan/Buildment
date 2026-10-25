---
artifact: canvas-spec
course: career-brand
chapter: "7.4"
beat: 6
slug: career-m7-eight-week-log
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Grow slowly, measure eight weeks

## Teaching claim
No one has a proof of what makes a LinkedIn audience grow. Post real work, comment well, and measure your own results over eight weeks. Results are tracked, never promised.

## Why this visual
An eight-week strip with a log that counts posts, comments, replies and profile views. It shows the habit of counting, not a result.

## Data
No controlled study shows a posting habit causes more followers or offers; LinkedIn says to share frequently and gives no number. Areej's plan is one post a week and five useful comments a week, with replies and profile views logged for eight weeks (canon). No results are shown.

```json
{
  "title": "Grow slowly, measure eight weeks",
  "purpose": "Areej posts once a week and writes five useful comments a week. She logs posts, comments, replies and profile views for eight weeks, then compares. The picture shows the counting, not a result.",
  "limits": "Areej is a fictional fellow. No result is shown or promised. The log is your own evidence about your own audience, not a study.",
  "hint": "Count for eight weeks, then compare.",
  "scene": {
    "width": 420,
    "height": 320,
    "actors": [
      { "id": "areej", "label": "Areej", "kind": "user", "sub": "logs weekly", "x": 62, "y": 110 },
      { "id": "log", "label": "The log", "kind": "note", "sub": "posts, comments", "x": 358, "y": 110 }
    ],
    "strip": { "y": 275, "from": 0, "to": 8, "unit": "wk", "caption": "weeks of logging", "every": 2 },
    "events": [
      { "kind": "tag", "at": 0.3, "row": 0, "value": 1, "label": "wk 1: start", "tone": "accent" },
      { "kind": "fly", "at": 0.8, "dur": 1.0, "from": "areej", "to": "log", "label": "post, comments" },
      { "kind": "say", "at": 2.0, "actor": "log", "text": "replies: count", "tone": "accent" },
      { "kind": "say", "at": 2.8, "actor": "log", "text": "views: count", "tone": "accent" },
      { "kind": "tag", "at": 3.4, "row": 0, "value": 8, "label": "wk 8: compare", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "Measure your own eight weeks", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Nothing in the picture says the log will rise. It says the log is how the learner will find out.
