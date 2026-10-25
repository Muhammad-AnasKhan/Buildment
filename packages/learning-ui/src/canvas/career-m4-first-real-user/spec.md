---
artifact: canvas-spec
course: career-brand
chapter: "4.4"
beat: 5
slug: career-m4-first-real-user
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: The first real user milestone

## Teaching claim
A project that was fast to build proves less than a project someone used. Find one real user before you build the second feature.

## Why this visual
A week-3 flag on the time box, with the owner's real sales arriving, shows the milestone as a date, not a hope.

## Data
From the canon: the first real user milestone is that the print shop owner records one real week of sales in the tool by the end of week 3.

```json
{
  "title": "The first real user milestone",
  "purpose": "By the end of week 3 of Areej's 6-week box, the print shop owner records one real week of sales in Raqim Stock. That is the first proof the tool is used.",
  "limits": "Areej is a fictional fellow and the plan is illustrative. A first real user is a start, not a result. The number to move still needs its two months of data.",
  "hint": "A flag at week 3.",
  "scene": {
    "width": 420,
    "height": 320,
    "actors": [
      { "id": "owner", "label": "Shop owner", "kind": "user", "sub": "records sales", "x": 62, "y": 110 },
      { "id": "tool", "label": "Raqim Stock", "kind": "phone", "sub": "in real use", "x": 358, "y": 110 }
    ],
    "strip": { "y": 275, "from": 0, "to": 6, "unit": "wk", "caption": "the 6-week time box", "every": 1 },
    "events": [
      { "kind": "tag", "at": 0.3, "row": 0, "value": 3, "label": "wk 3: owner's week", "tone": "accent" },
      { "kind": "fly", "at": 1.0, "dur": 1.0, "from": "owner", "to": "tool", "label": "a real sale" },
      { "kind": "fly", "at": 2.3, "dur": 1.0, "from": "owner", "to": "tool", "label": "a real sale" },
      { "kind": "say", "at": 3.5, "actor": "tool", "text": "real data", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "Find one real user early", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The milestone has a date and a person. Both are what the gate asks the learner to name.
