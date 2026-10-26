---
artifact: canvas-spec
course: career-brand
chapter: "9.2"
beat: 5
slug: career-m9-keep-the-term
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: When the feedback is wrong

## Teaching claim
A model can be wrong. You decide, with reasons, and the mentor's review counts. A "jargon" flag on "composite index" can stay for engineering readers if the case study explains it.

## Why this visual
A flag arrives, the learner decides to keep the term, and the explanation goes to the case study.

## Data
From the canon: at gate 6.8 the new resume draws one "jargon without explanation" flag on "composite index", which Areej keeps for engineering readers and explains in the case study.

```json
{
  "title": "When the feedback is wrong",
  "purpose": "A 'jargon' flag lands on 'composite index'. Areej decides to keep the term for engineering readers, and sends the explanation to her case study. The decision is hers, with a reason.",
  "limits": "A flag is feedback, not a rule, but a flag you reject needs a reason a reader can follow. The mentor's review counts alongside any tool. The companion course, The Founder Interview, teaches reading feedback critically.",
  "hint": "A flag you keep needs a reason.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "flag", "label": "Flag: jargon", "kind": "note", "sub": "composite index", "x": 62, "y": 110 },
      { "id": "areej", "label": "Areej", "kind": "user", "sub": "decides", "x": 358, "y": 110 },
      { "id": "case", "label": "Case study", "kind": "note", "sub": "explains it", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "flag", "to": "areej", "label": "explain it?" },
      { "kind": "say", "at": 1.4, "actor": "areej", "text": "keeps the term", "tone": "good" },
      { "kind": "fly", "at": 2.4, "dur": 1.0, "from": "areej", "to": "case", "label": "explain there" },
      { "kind": "say", "at": 3.5, "actor": "case", "text": "term explained", "tone": "good" },
      { "kind": "verdict", "at": 4.2, "text": "You decide, with reasons", "tone": "accent" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
She did not ignore the flag. She answered it by putting the explanation where an engineering reader would look.
