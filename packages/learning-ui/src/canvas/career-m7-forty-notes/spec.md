---
artifact: canvas-spec
course: career-brand
chapter: "7.1"
beat: 1
slug: career-m7-forty-notes
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Forty identical notes

## Teaching claim
Sending the same note to many strangers brings no replies and can get your invitations restricted. LinkedIn's policy forbids using invitations for promotional messages to people you do not know.

## Why this visual
The same note leaves four times in a row, and the result is silence and a restriction banner.

## Data
Amjad is from the canon (scene cast, 7.1). He paid for one month of Premium, which lets members personalise unlimited invitations, and sent 40 identical notes to founders he did not know. LinkedIn's policy forbids using invitations to send promotional messages to people you do not know. His invitations were restricted for about a week. His headline was "Passionate developer | Lifelong learner". Card register is used; the illustrated register needs custom code. Platform facts are checked 2026-10.

```json
{
  "title": "Forty identical notes",
  "purpose": "Amjad, whose headline reads 'Passionate developer | Lifelong learner', sends 40 identical notes to founders he does not know. There are no replies, and his invitations are restricted for about a week.",
  "limits": "Platform rules change; checked 2026-10, and if your screen differs, follow your screen. Only four of the forty notes are drawn.",
  "hint": "Watch the same note leave again and again.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "amjad", "label": "Amjad", "kind": "user", "sub": "same note x40", "x": 62, "y": 110 },
      { "id": "founders", "label": "Founders", "kind": "user", "sub": "strangers", "x": 358, "y": 110 },
      { "id": "banner", "label": "Restriction", "kind": "note", "sub": "about a week", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 0.8, "from": "amjad", "to": "founders", "label": "same note" },
      { "kind": "fly", "at": 1.2, "dur": 0.8, "from": "amjad", "to": "founders", "label": "same note" },
      { "kind": "fly", "at": 2.1, "dur": 0.8, "from": "amjad", "to": "founders", "label": "same note" },
      { "kind": "fly", "at": 3.0, "dur": 0.8, "from": "amjad", "to": "founders", "label": "same note" },
      { "kind": "say", "at": 3.9, "actor": "founders", "text": "no replies", "tone": "bad" },
      { "kind": "say", "at": 4.4, "actor": "banner", "text": "invites limited", "tone": "bad" },
      { "kind": "verdict", "at": 5.0, "text": "Forty identical notes, no replies", "tone": "bad" }
    ],
    "loop": 9
  }
}
```

## What the learner should notice
Paying for Premium did not change the rule. A note that is the same for everyone is not personal, however many are allowed.
