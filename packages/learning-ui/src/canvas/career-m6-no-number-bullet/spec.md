---
artifact: canvas-spec
course: career-brand
chapter: "6.3"
beat: 5
slug: career-m6-no-number-bullet
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: No number? Show the change another way

## Teaching claim
Never invent a number to fit a pattern. A bullet with no number can still name a checkable action. An honest gap is also fine.

## Why this visual
Three acts arrive at the reader one by one, and each can be checked in the team repository.

## Data
From the canon: Areej revoked and replaced a leaked email-service key, moved secrets to environment variables and turned on push protection for a four-person team repository. Nothing shows that bullets with numbers win more interviews.

```json
{
  "title": "No number? Show the change another way",
  "purpose": "Areej's key bullet has no number. It names three acts a reader can check in the repository: the key was revoked and replaced, secrets moved to environment variables, and push protection was turned on.",
  "limits": "Areej is a fictional fellow. Nothing we found shows that bullets with numbers get more interviews. A checkable action or an honest gap is a good bullet; an invented number is not.",
  "hint": "Three acts, no number.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "bullet", "label": "Key bullet", "kind": "note", "sub": "no number", "x": 62, "y": 110 },
      { "id": "repo", "label": "Team repo", "kind": "database", "sub": "4-person team", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "wants to check", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "bullet", "to": "reader", "label": "revoked, replaced" },
      { "kind": "fly", "at": 1.5, "dur": 1.0, "from": "bullet", "to": "reader", "label": "secrets in env" },
      { "kind": "fly", "at": 2.7, "dur": 1.0, "from": "bullet", "to": "reader", "label": "push protection" },
      { "kind": "say", "at": 3.9, "actor": "repo", "text": "settings on", "tone": "good" },
      { "kind": "say", "at": 4.1, "actor": "reader", "text": "can verify", "tone": "good" },
      { "kind": "verdict", "at": 4.8, "text": "No number? Name a checkable act", "tone": "good" }
    ],
    "loop": 8.5
  }
}
```

## What the learner should notice
Each act can be checked. None of them needed a made-up percentage.
