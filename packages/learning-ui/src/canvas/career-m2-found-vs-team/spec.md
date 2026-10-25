---
artifact: canvas-spec
course: career-brand
chapter: "2.3"
beat: 3
slug: career-m2-found-vs-team
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: "I did" and "the team did"

## Teaching claim
Say what you did and what the team did, each in its own words. Stating the team's part makes your part believable. Inflating your part is deception, not only invention.

## Why this visual
The report fix is one result with seven steps. Four come from Areej and three from her lead. Two groups of messages landing on one report make the split visible.

## Data
The steps are from the canon (the slow orders report). Areej is a fictional fellow and her numbers are illustrative.

```json
{
  "title": "\"I did\" and \"the team did\"",
  "purpose": "The slow report fix has seven steps. Areej found the query, ran the plan, chose the index and wrote the migration. Her lead reviewed, scheduled and deployed it. The sentence about the result should name both.",
  "limits": "Areej is a fictional fellow and the steps are simplified. Researchers measure three kinds of resume deception: fabrication, embellishment and omission. Leaving out the team's part to look bigger is embellishment.",
  "hint": "Watch who does what.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "areej", "label": "Areej", "kind": "user", "sub": "my part", "x": 62, "y": 105 },
      { "id": "lead", "label": "Her lead", "kind": "user", "sub": "the team's part", "x": 358, "y": 105 },
      { "id": "report", "label": "Report fix", "kind": "note", "sub": "orders report", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 0.8, "from": "areej", "to": "report", "label": "found the query" },
      { "kind": "fly", "at": 1.3, "dur": 0.8, "from": "areej", "to": "report", "label": "ran the plan" },
      { "kind": "fly", "at": 2.3, "dur": 0.8, "from": "areej", "to": "report", "label": "chose the index" },
      { "kind": "fly", "at": 3.3, "dur": 0.8, "from": "areej", "to": "report", "label": "wrote migration" },
      { "kind": "fly", "at": 4.4, "dur": 0.8, "from": "lead", "to": "report", "label": "reviewed" },
      { "kind": "fly", "at": 5.4, "dur": 0.8, "from": "lead", "to": "report", "label": "scheduled" },
      { "kind": "fly", "at": 6.4, "dur": 0.8, "from": "lead", "to": "report", "label": "deployed" },
      { "kind": "say", "at": 7.3, "actor": "report", "text": "both named", "tone": "good" },
      { "kind": "verdict", "at": 7.8, "text": "Name your part and the team's", "tone": "good" }
    ],
    "loop": 11
  }
}
```

## What the learner should notice
Four of the seven steps are Areej's. The sentence "cut the report time" would hide the other three if it said "I" alone.

## Limits
In the `limits` field of the data.
