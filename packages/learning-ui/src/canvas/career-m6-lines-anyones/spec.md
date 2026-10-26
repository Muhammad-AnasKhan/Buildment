---
artifact: canvas-spec
course: career-brand
chapter: "6.1"
beat: 1
slug: career-m6-lines-anyones
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Lines that could be anyone's

## Teaching claim
"Responsible for coordinating shipments" and an AI-written summary could belong to any applicant. A reader cannot tell the resumes apart.

## Why this visual
Waed's resume and three others send the same words to one reader, who cannot tell them apart.

## Data
Waed is from the canon (scene cast, 6.1). Card register is used; the illustrated register needs custom code.

```json
{
  "title": "Lines that could be anyone's",
  "purpose": "Waed's resume says 'responsible for coordinating shipments' and has an AI-written summary. Three other applicants' resumes use almost the same words. The reader cannot tell them apart.",
  "limits": "The other resumes are made up. The picture does not say AI tools cause this; plain duty lines were common before them.",
  "hint": "Four resumes, one set of words.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "waed", "label": "Waed's resume", "kind": "note", "sub": "AI-written", "x": 62, "y": 110 },
      { "id": "others", "label": "Three others", "kind": "note", "sub": "same words", "x": 358, "y": 110 },
      { "id": "reader", "label": "Reader", "kind": "user", "sub": "hiring", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "waed", "to": "reader", "label": "responsible for" },
      { "kind": "fly", "at": 1.6, "dur": 1.0, "from": "others", "to": "reader", "label": "responsible for" },
      { "kind": "say", "at": 2.8, "actor": "reader", "text": "all the same", "tone": "bad" },
      { "kind": "verdict", "at": 3.5, "text": "Lines that could be anyone's", "tone": "bad" }
    ],
    "loop": 7.5
  }
}
```

## What the learner should notice
Nothing on any resume is false. None of it is hers alone.
