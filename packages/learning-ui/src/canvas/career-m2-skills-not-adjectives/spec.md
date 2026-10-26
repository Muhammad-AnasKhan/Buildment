---
artifact: canvas-spec
course: career-brand
chapter: "2.3"
beat: 4
slug: career-m2-skills-not-adjectives
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Four kinds of skill, each with an example

## Teaching claim
Hard, soft, leadership and initiative skills are each shown by one example, not by an adjective. A skill named with no example is only a claim.

## Why this visual
Four cards start with an adjective and swap it for a real example from Areej's work. The swap is the lesson.

## Data
The examples are from the canon (Areej's skills). Areej is a fictional fellow and her work is illustrative.

```json
{
  "title": "Four kinds of skill, each with an example",
  "purpose": "Four skill cards each start as an adjective and turn into an example from Areej's work: query plans, writing for her lead, training two organisers, and finding the slow query without being asked.",
  "limits": "The four kinds are this course's way to sort material, not a research model. Areej is a fictional fellow and her examples are illustrative.",
  "hint": "Watch each adjective turn into an example.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "hard", "label": "Hard skill", "kind": "note", "sub": "skilled", "x": 62, "y": 110 },
      { "id": "soft", "label": "Soft skill", "kind": "note", "sub": "friendly", "x": 358, "y": 110 },
      { "id": "lead", "label": "Leadership", "kind": "note", "sub": "a leader", "x": 62, "y": 240 },
      { "id": "init", "label": "Initiative", "kind": "note", "sub": "proactive", "x": 358, "y": 240 }
    ],
    "events": [
      { "kind": "say", "at": 1.2, "actor": "hard", "text": "query plans", "tone": "good" },
      { "kind": "say", "at": 2.2, "actor": "soft", "text": "wrote for lead", "tone": "good" },
      { "kind": "say", "at": 3.2, "actor": "lead", "text": "trained two", "tone": "good" },
      { "kind": "say", "at": 4.2, "actor": "init", "text": "found the query", "tone": "good" },
      { "kind": "verdict", "at": 5.0, "text": "An example beats an adjective", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The adjectives were all true and none could be asked about. Each example can be followed by a question.

## Limits
In the `limits` field of the data.
