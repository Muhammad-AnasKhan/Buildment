---
artifact: canvas-spec
course: career-brand
chapter: "8.3"
beat: 5
slug: career-m8-first-published-line
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: One honest line on every copy

## Teaching claim
At the top or bottom of every copy, write one honest line: "First published at [your site]." with a link. Readers use it even if search engines do not.

## Why this visual
The line is added at the top of a copy, and it sends a reader back to the original page.

## Data
```json
{
  "title": "One honest line on every copy",
  "purpose": "A copy of the article on another platform gets a line at the top: 'First published at' and a link to Areej's site. Readers follow the link home.",
  "limits": "Areej is a fictional fellow. This does not depend on any search engine, so it also works on platforms whose canonical settings are unverified. Cross-posting is for readers, not a ranking trick.",
  "hint": "One line, one link home.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "line", "label": "Top line", "kind": "note", "sub": "first published", "x": 62, "y": 110 },
      { "id": "copy", "label": "A copy", "kind": "note", "sub": "on a platform", "x": 358, "y": 110 },
      { "id": "site", "label": "Your site", "kind": "note", "sub": "the original", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "line", "to": "copy", "label": "add at the top" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "copy", "to": "site", "label": "link home" },
      { "kind": "say", "at": 2.8, "actor": "site", "text": "readers arrive", "tone": "good" },
      { "kind": "verdict", "at": 3.5, "text": "One honest line on every copy", "tone": "good" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
The line costs nothing and is true. It is what makes a copy a way home and not a replacement.
