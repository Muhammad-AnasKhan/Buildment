---
artifact: canvas-spec
course: career-brand
chapter: "2.3"
beat: 6
slug: career-m2-volunteer-full
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Study and volunteer roles count

## Teaching claim
A volunteer or study role can be as full as a paid one. The caveat in it is part of honesty, not a weakness.

## Why this visual
Two cards of equal weight, and a reader pulling the numbers out of the volunteer card one by one, including the caveat.

## Data
Numbers are from the canon (the sign-up migration). Areej is a fictional fellow and her numbers are illustrative.

```json
{
  "title": "Study and volunteer roles count",
  "purpose": "Areej's volunteer card is as full as her internship card: 412 rows, 57 duplicates, 355 imported, and clashes from 9 to 1. The caveat is on the card too: sessions also dropped from three to two a week.",
  "limits": "Areej is a fictional fellow and her numbers are illustrative. Most learners have at least a study or volunteer role to write up; school projects, helping a family business and club roles all count.",
  "hint": "Watch the reader ask what changed.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "intern", "label": "Internship", "kind": "note", "sub": "a full card", "x": 62, "y": 110 },
      { "id": "volunteer", "label": "Volunteer", "kind": "note", "sub": "a full card", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "asks", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "reader", "to": "volunteer", "label": "what changed?" },
      { "kind": "say", "at": 1.4, "actor": "volunteer", "text": "412 rows", "tone": "accent" },
      { "kind": "say", "at": 2.1, "actor": "volunteer", "text": "57 duplicates", "tone": "accent" },
      { "kind": "say", "at": 2.8, "actor": "volunteer", "text": "355 imported", "tone": "accent" },
      { "kind": "say", "at": 3.5, "actor": "volunteer", "text": "clashes 9 to 1", "tone": "good" },
      { "kind": "say", "at": 4.4, "actor": "volunteer", "text": "sessions 3 to 2", "tone": "warn" },
      { "kind": "verdict", "at": 5.0, "text": "Volunteer work counts, caveat too", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The last line, the caveat, is the one that makes the others believable.

## Limits
In the `limits` field of the data.
