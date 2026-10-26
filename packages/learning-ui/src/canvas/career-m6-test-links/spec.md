---
artifact: canvas-spec
course: career-brand
chapter: "6.5"
beat: 2
slug: career-m6-test-links
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Test every link on a phone

## Teaching claim
Open every link on a phone before you send a resume. A link to a free demo can fail when the plan ends. A static case study keeps working.

## Why this visual
One phone taps two links in turn. The first opens, the second says not found.

## Data
Links on a resume are two or three stable labelled links (see the previous beat). A LinkedIn custom address can be changed up to five times in six months and an old address can be claimed by others once released; pick one and keep it (checked 2026-10).

```json
{
  "title": "Test every link on a phone",
  "purpose": "A phone taps each link on the resume. The case study opens. The old demo link shows 'not found' because a free plan ended.",
  "limits": "Plan rules change; trust your own screen. LinkedIn's rules on custom addresses are checked 2026-10 and may differ for you. Testing on a phone is the minimum, since many readers open a link on one.",
  "hint": "Tap each link the way a reader would.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "phone", "label": "Phone", "kind": "phone", "sub": "tests each link", "x": 210, "y": 105 },
      { "id": "case", "label": "Case study", "kind": "note", "sub": "static page", "x": 62, "y": 250 },
      { "id": "old", "label": "Old demo", "kind": "note", "sub": "free plan ended", "x": 358, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "phone", "to": "case", "label": "tap link 1" },
      { "kind": "say", "at": 1.4, "actor": "case", "text": "opens", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "phone", "to": "old", "label": "tap link 2" },
      { "kind": "say", "at": 3.5, "actor": "old", "text": "not found", "tone": "bad" },
      { "kind": "verdict", "at": 4.2, "text": "Test every link on a phone", "tone": "accent" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The broken link was a good link when it was added. Only a test just before sending would have caught it.
