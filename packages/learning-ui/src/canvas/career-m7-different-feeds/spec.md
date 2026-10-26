---
artifact: canvas-spec
course: career-brand
chapter: "7.3"
beat: 1
slug: career-m7-different-feeds
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Each feed is built for one viewer

## Teaching claim
LinkedIn builds a different feed for every person from their profile and what they have read and engaged with. Nobody outside LinkedIn can give you an exact recipe.

## Why this visual
The same five posts go to two people and arrive in a different order for each.

## Data
Based on a LinkedIn Engineering post (listed 12 March 2026): the feed uses profile information and engagement history, a sequential model over more than a thousand past interactions, and never demographic attributes. The Help Center says content goes to a subset of connections and followers depending on connection strength and settings. Checked 2026-10.

```json
{
  "title": "Each feed is built for one viewer",
  "purpose": "The same five posts reach two people. The person who reads about databases sees the database post first. The person who reads about design sees the design post first. Each feed is built for one viewer.",
  "limits": "A simplified picture. LinkedIn does not publish an exact recipe, and what it does publish changes. Checked 2026-10; trust LinkedIn's own pages over any guide that gives exact numbers.",
  "hint": "The same five posts, two feeds.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "posts", "label": "Five posts", "kind": "note", "sub": "the same five", "x": 210, "y": 105 },
      { "id": "p1", "label": "Person 1", "kind": "user", "sub": "reads databases", "x": 62, "y": 250 },
      { "id": "p2", "label": "Person 2", "kind": "user", "sub": "reads design", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "posts", "to": "p1", "label": "database first" },
      { "kind": "say", "at": 1.4, "actor": "p1", "text": "their own feed", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "posts", "to": "p2", "label": "design first" },
      { "kind": "say", "at": 3.5, "actor": "p2", "text": "another feed", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "Each feed is built for one viewer", "tone": "accent" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
There is no single feed to beat. Posting real work for the right readers is the only lever the learner has.
