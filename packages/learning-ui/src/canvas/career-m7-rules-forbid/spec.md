---
artifact: canvas-spec
course: career-brand
chapter: "7.3"
beat: 5
slug: career-m7-rules-forbid
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: What the rules forbid

## Teaching claim
LinkedIn's rules say you may not use bots or tools to connect, message, comment, like or post for you, you may not agree in advance to like each other's content, and you may not run fake accounts. Accounts can be restricted or closed. The honest way is slower, and it is the only one this course teaches.

## Why this visual
Three forbidden things go to the platform and it answers with a restriction.

## Data
Based on the LinkedIn User Agreement (effective 3 November 2025), section 8.2, the prohibited software page, and the Community Policies (all checked 2026-10): no bots or unauthorised automation to connect, message, comment, like or share; no inauthentic engagement or algorithm manipulation; one real account; do not agree with others ahead of time to like or re-share each other's content.

```json
{
  "title": "What the rules forbid",
  "purpose": "Auto-comment tools, groups that agree in advance to like each other's posts, and fake accounts all go to LinkedIn. It answers with a restriction. The honest way is slower, and it is the only one this course teaches.",
  "limits": "Checked 2026-10; rules change, and if your screen differs, follow your screen. The picture simplifies the policies, which also cover other things. LinkedIn does not use the word pod.",
  "hint": "Three things you may not do.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "tools", "label": "Bots, tools", "kind": "worker", "sub": "auto-comment", "x": 62, "y": 105 },
      { "id": "group", "label": "Like groups", "kind": "user", "sub": "agree to like", "x": 210, "y": 105 },
      { "id": "fake", "label": "Fake account", "kind": "note", "sub": "not a person", "x": 358, "y": 105 },
      { "id": "linkedin", "label": "LinkedIn", "kind": "server", "sub": "checks rules", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "tools", "to": "linkedin", "label": "auto-commenting" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "group", "to": "linkedin", "label": "pre-agreed likes" },
      { "kind": "fly", "at": 2.7, "dur": 1.0, "from": "fake", "to": "linkedin", "label": "fake account" },
      { "kind": "say", "at": 3.9, "actor": "linkedin", "text": "restricted", "tone": "bad" },
      { "kind": "verdict", "at": 4.6, "text": "These get an account restricted", "tone": "bad" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
None of the three needs a clever workaround to avoid. Not doing them is the whole rule.
