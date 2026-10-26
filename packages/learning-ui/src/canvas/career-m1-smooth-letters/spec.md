---
artifact: canvas-spec
course: career-brand
chapter: "1.4"
beat: 2
slug: career-m1-smooth-letters
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: When everyone writes smoothly, smooth proves less

## Teaching claim
When anyone can produce a smooth cover letter in a minute, a smooth letter proves less. Readers lean on things they can check: what you built, what the numbers were, who vouches for it.

## Why this visual
A stack of alike letters and one line with a result, with the reader's attention moving between them, shows the shift in what counts.

## Data
```json
{
  "title": "When everyone writes smoothly, smooth proves less",
  "purpose": "A reader meets a stack of smooth, polished letters that all sound alike. The reader looks elsewhere and checks the one line that holds a result.",
  "limits": "Read at the level of direction only. After an AI cover-letter tool arrived on one platform, the link between how well a letter matched the job and callbacks (replies asking for an interview) fell, and employers leaned more on other signals such as work history. Do not quote the percentages from those papers.",
  "hint": "Watch where the reader looks when every letter sounds the same.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "letters", "label": "Letters", "kind": "note", "sub": "all sound alike", "x": 62, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "many letters", "x": 358, "y": 110 },
      { "id": "result", "label": "A result line", "kind": "note", "sub": "can be checked", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "letters", "to": "reader", "label": "smooth, polished" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "all alike", "tone": "warn" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "reader", "to": "result", "label": "look here" },
      { "kind": "say", "at": 3.7, "actor": "result", "text": "a real number", "tone": "good" },
      { "kind": "say", "at": 4.0, "actor": "reader", "text": "checks it", "tone": "good" },
      { "kind": "verdict", "at": 4.7, "text": "A line they can check gets noticed", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
The reader did not read worse. The smooth letters simply stopped telling them apart.

## Limits
In the `limits` field of the data.
