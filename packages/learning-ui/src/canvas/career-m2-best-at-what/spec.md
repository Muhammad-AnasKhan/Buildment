---
artifact: canvas-spec
course: career-brand
chapter: "2.1"
beat: 1
slug: career-m2-best-at-what
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: "What are you best at?"

## Teaching claim
A founder asks what you are best at and how they would know. A row of tool names does not answer it.

## Why this visual
A call between two people with one short answer coming back makes the gap obvious.

## Data
```json
{
  "title": "\"What are you best at?\"",
  "purpose": "On a first call a founder asks Ruqaya what she is best at and how anyone would know. She answers with a row of tools. The founder is still unsure.",
  "limits": "Ruqaya is a fictional fellow and the call is a story. The picture does not say tools are unimportant; it says a list of tools does not show what you are best at.",
  "hint": "Watch the question and the answer.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "founder", "label": "Founder", "kind": "user", "sub": "on a call", "x": 62, "y": 110 },
      { "id": "ruqaya", "label": "Ruqaya", "kind": "user", "sub": "designer", "x": 358, "y": 110 },
      { "id": "tools", "label": "Tool logos", "kind": "note", "sub": "a long row", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "founder", "to": "ruqaya", "label": "best at what?" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "founder", "to": "ruqaya", "label": "how would I know?" },
      { "kind": "say", "at": 2.8, "actor": "ruqaya", "text": "lists tools", "tone": "accent" },
      { "kind": "fly", "at": 3.1, "dur": 1.0, "from": "tools", "to": "founder", "label": "a row of logos" },
      { "kind": "say", "at": 4.3, "actor": "founder", "text": "still unsure", "tone": "warn" },
      { "kind": "verdict", "at": 5.0, "text": "A list of tools does not answer it", "tone": "warn" }
    ],
    "loop": 9
  }
}
```

## What the learner should notice
The question had two parts. The answer covered neither "best" nor "how would I know".

## Limits
In the `limits` field of the data.
