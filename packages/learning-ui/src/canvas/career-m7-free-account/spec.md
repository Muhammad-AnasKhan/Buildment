---
artifact: canvas-spec
course: career-brand
chapter: "7.4"
beat: 3
slug: career-m7-free-account
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Free accounts: connections and few notes

## Teaching claim
A free account can message only connections and has a small monthly allowance of personalised notes. Plan for three notes a month and count them. Nothing in this course needs Premium.

## Why this visual
Two groups of people, those you can message and those you cannot, and a note allowance that is small and visible.

## Data
LinkedIn's pages (checked 2026-10; if your screen differs, follow your screen): InMail is Premium; a Basic account can message only connections. LinkedIn pages say three personalised notes a month on one page and five on another, 200 characters each; plan for three. Invitations from People You May Know in the mobile app cannot be personalised. Invitation limits apply to everyone; hitting one restricts sending for about a week, and withdrawing pending invitations does not lift it.

```json
{
  "title": "Free accounts: connections and few notes",
  "purpose": "On a free account you can message your connections. For people you are not connected to you have a few personalised notes a month. Plan for three and count them.",
  "limits": "Checked 2026-10; if your screen differs, follow your screen. LinkedIn's pages disagree on whether the allowance is three or five a month; the course plans for three. Limits change, and the mobile app path cannot add a note.",
  "hint": "Who you can message, and what a note costs.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "you", "label": "You", "kind": "user", "sub": "free account", "x": 62, "y": 105 },
      { "id": "connections", "label": "Connected", "kind": "user", "sub": "can message", "x": 358, "y": 105 },
      { "id": "stranger", "label": "Strangers", "kind": "user", "sub": "note or comment", "x": 62, "y": 250 },
      { "id": "notes", "label": "Notes", "kind": "note", "sub": "plan for three", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "you", "to": "connections", "label": "message" },
      { "kind": "say", "at": 1.4, "actor": "connections", "text": "free to send", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "you", "to": "stranger", "label": "needs a note" },
      { "kind": "say", "at": 3.5, "actor": "notes", "text": "count them", "tone": "warn" },
      { "kind": "verdict", "at": 4.2, "text": "Free: connections and a few notes", "tone": "accent" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
Notes are few, so each one has to go to someone with a reason. The next beat is how to spend them.
