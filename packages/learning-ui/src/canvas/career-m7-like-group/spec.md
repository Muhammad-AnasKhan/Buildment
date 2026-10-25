---
artifact: canvas-spec
course: career-brand
chapter: "7.1"
beat: 2
slug: career-m7-like-group
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: A group that likes everything

## Teaching claim
A group that agrees in advance to like each other's posts brings likes from the same few people and no founders. LinkedIn's policy forbids agreeing in advance to like or re-share each other's content.

## Why this visual
The same few likes arrive on every post, and the people he wanted to reach stay silent.

## Data
From the canon: Amjad joined a group that agreed to like each other's posts, which the policy forbids. Checked 2026-10; the word used for this on the web is "pod", which LinkedIn does not use.

```json
{
  "title": "A group that likes everything",
  "purpose": "Amjad joins a group whose members agree to like each other's posts. His posts get the same few likes every time. The founders he wanted to reach do not reply.",
  "limits": "Amjad is a fictional fellow. LinkedIn's Community Policies do not use the word pod; they say not to agree with others ahead of time to like or re-share each other's content. Rules change; checked 2026-10.",
  "hint": "Likes from the same few people.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "group", "label": "The group", "kind": "user", "sub": "agreed to like", "x": 62, "y": 110 },
      { "id": "post", "label": "His posts", "kind": "note", "sub": "same few likes", "x": 358, "y": 110 },
      { "id": "founders", "label": "Founders", "kind": "user", "sub": "he wanted them", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "group", "to": "post", "label": "likes" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "group", "to": "post", "label": "likes again" },
      { "kind": "say", "at": 2.8, "actor": "post", "text": "same few likes", "tone": "warn" },
      { "kind": "say", "at": 3.4, "actor": "founders", "text": "no replies", "tone": "bad" },
      { "kind": "verdict", "at": 4.2, "text": "A like group brings no founders", "tone": "bad" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The likes were real clicks and meant nothing. The people who could reply never saw a reason to.
