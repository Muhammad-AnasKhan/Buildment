---
artifact: canvas-spec
course: career-brand
chapter: "8.2"
beat: 5
slug: career-m8-say-it-back
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: The say-it-back test

## Teaching claim
Ask someone to say your post back to you in their own words. If they cannot, rewrite. Test at least twice.

## Why this visual
A classmate repeats the post and a gap appears between what was written and what was heard. The gap is what the writer fixes.

## Data
Paraphrase testing suits short documents; plan to test at least twice (plain language guidance, checked 2026-10). From the canon: Areej's classmate says "she made the list faster by keeping a copy for 30 seconds, and proved it with the same test before and after". Good enough; she adds one sentence on why the copy can be stale.

```json
{
  "title": "The say-it-back test",
  "purpose": "Areej's classmate reads her post and says it back: she made the list faster by keeping a copy for 30 seconds, and proved it with the same test before and after. One thing is missing: why the copy can be stale. She adds a sentence.",
  "limits": "Areej is a fictional fellow. The test needs a person, not a tool. One listener is a small sample, so test at least twice. Plain-language guidance, not a trial.",
  "hint": "Say it back, then fix the gap.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "areej", "label": "Areej", "kind": "user", "sub": "wrote the post", "x": 62, "y": 110 },
      { "id": "classmate", "label": "Classmate", "kind": "user", "sub": "says it back", "x": 358, "y": 110 },
      { "id": "gap", "label": "The gap", "kind": "note", "sub": "what was lost", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "areej", "to": "classmate", "label": "reads the post" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "classmate", "to": "areej", "label": "kept a copy 30 s" },
      { "kind": "say", "at": 2.8, "actor": "gap", "text": "stale? missing", "tone": "warn" },
      { "kind": "say", "at": 3.4, "actor": "areej", "text": "adds a line", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "If they cannot say it back, rewrite", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The listener got most of it right. The one missing piece is exactly what the test is for.
