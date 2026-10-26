---
artifact: canvas-spec
course: career-brand
chapter: "8.1"
beat: 2
slug: career-m8-template-site
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A website nobody believes

## Teaching claim
A site built from a template, with stock photos, no dates, no numbers and a line like "I am a passionate DevOps engineer who loves solving problems", gives a visitor no reason to believe it.

## Why this visual
A visitor asks who she is, and the site answers only with things anyone could say.

## Data
```json
{
  "title": "A website nobody believes",
  "purpose": "Diala's personal site came from a template. It has stock photos, no dates and no numbers, and says 'I am a passionate DevOps engineer who loves solving problems'. A visitor wants proof and finds none.",
  "limits": "A template is not wrong; this one has no specifics. The picture does not claim every visitor reacts this way.",
  "hint": "A site with nothing only she could say.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "visitor", "label": "Visitor", "kind": "user", "sub": "wants proof", "x": 62, "y": 110 },
      { "id": "site", "label": "Her site", "kind": "note", "sub": "from a template", "x": 358, "y": 110 },
      { "id": "line", "label": "Intro line", "kind": "note", "sub": "I am passionate", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "visitor", "to": "site", "label": "who is she?" },
      { "kind": "say", "at": 1.4, "actor": "site", "text": "stock photos", "tone": "warn" },
      { "kind": "say", "at": 2.0, "actor": "site", "text": "no dates", "tone": "warn" },
      { "kind": "say", "at": 2.6, "actor": "site", "text": "no numbers", "tone": "bad" },
      { "kind": "say", "at": 3.3, "actor": "line", "text": "anyone's line", "tone": "bad" },
      { "kind": "verdict", "at": 4.0, "text": "A site nobody believes", "tone": "bad" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Her CI result of 22 to 9 minutes is a strong fact, and none of it is on the site.
