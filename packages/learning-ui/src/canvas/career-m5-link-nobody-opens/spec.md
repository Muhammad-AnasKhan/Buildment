---
artifact: canvas-spec
course: career-brand
chapter: "5.1"
beat: 1
slug: career-m5-link-nobody-opens
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A GitHub link nobody opens

## Teaching claim
A link to a repository whose README starts with install commands asks the reader to do work first. Most readers will not.

## Why this visual
One link, one glance at the first README lines, and a reader who moves on.

## Data
Moath is from the canon (scene cast, 5.1). Card register is used; the illustrated register needs custom code. No number of seconds is given for the founder's patience.

```json
{
  "title": "A GitHub link nobody opens",
  "purpose": "Moath sends a founder a link to his recipe app's repository. The README starts with install commands. The founder moves on without cloning it.",
  "limits": "The picture does not say every founder behaves this way. It shows what a README that starts with install steps asks of a reader.",
  "hint": "A link, a README, a reader who moves on.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "moath", "label": "Moath", "kind": "user", "sub": "sent the link", "x": 62, "y": 110 },
      { "id": "founder", "label": "Founder", "kind": "user", "sub": "reads mail", "x": 358, "y": 110 },
      { "id": "repo", "label": "README", "kind": "note", "sub": "install first", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "moath", "to": "founder", "label": "GitHub link" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "founder", "to": "repo", "label": "open it" },
      { "kind": "say", "at": 2.7, "actor": "repo", "text": "install steps", "tone": "warn" },
      { "kind": "say", "at": 3.4, "actor": "founder", "text": "moves on", "tone": "bad" },
      { "kind": "verdict", "at": 4.2, "text": "The founder never ran it", "tone": "bad" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The app might be good. The reader never got far enough to find out.
