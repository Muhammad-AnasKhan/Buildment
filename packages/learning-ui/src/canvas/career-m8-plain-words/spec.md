---
artifact: canvas-spec
course: career-brand
chapter: "8.2"
beat: 4
slug: career-m8-plain-words
kind: scene
playable: false
version: 1
owner: interaction-designer
---

# Canvas spec: Plain words, short sentences

## Teaching claim
Write the way you would explain it to a colleague who is tired: short words, active verbs, one idea per sentence. Plain does not mean childish.

## Why this visual
A tangled long sentence meets a tired reader, then three short sentences meet the same reader.

## Data
Based on the US government's plain language guides (checked 2026-10): shorter words, short sections, active voice and present tense are easier to understand, and hidden verbs ("conduct an analysis of" for "analyse") slow readers down. It is government guidance, not a trial.

```json
{
  "title": "Plain words, short sentences",
  "purpose": "A long sentence with hidden verbs makes a tired reader read it twice. The same idea in three short sentences with active verbs is understood the first time.",
  "limits": "Government plain-language guidance, not a trial. Plain does not mean childish: a precise term still belongs where it is needed. Checked 2026-10.",
  "hint": "Same idea, two ways.",
  "scene": {
    "width": 420,
    "height": 330,
    "actors": [
      { "id": "long", "label": "Long sentence", "kind": "note", "sub": "hidden verbs", "x": 62, "y": 110 },
      { "id": "short", "label": "Three short", "kind": "note", "sub": "active verbs", "x": 358, "y": 110 },
      { "id": "reader", "label": "Tired reader", "kind": "user", "sub": "end of the day", "x": 210, "y": 250 }
    ],
    "events": [
      { "kind": "fly", "at": 0.3, "dur": 1.0, "from": "long", "to": "reader", "label": "conduct analysis" },
      { "kind": "say", "at": 1.4, "actor": "reader", "text": "re-reads it", "tone": "warn" },
      { "kind": "fly", "at": 2.6, "dur": 1.0, "from": "short", "to": "reader", "label": "we analysed it" },
      { "kind": "say", "at": 3.7, "actor": "reader", "text": "gets it", "tone": "good" },
      { "kind": "verdict", "at": 4.4, "text": "Write for a tired colleague", "tone": "good" }
    ],
    "loop": 8
  }
}
```

## What the learner should notice
The short version is not simpler in meaning. It just does not make the reader work to find the verb.
