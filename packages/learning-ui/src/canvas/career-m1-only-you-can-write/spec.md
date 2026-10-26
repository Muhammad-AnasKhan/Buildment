---
artifact: canvas-spec
course: career-brand
chapter: "1.4"
beat: 5
slug: career-m1-only-you-can-write
kind: phrase-fixer
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Only you can write this

## Teaching claim
An opening can read well and say nothing. Each empty phrase has to be replaced by something only the writer can back up: a role, a result with its window, a habit.

## Why this visual
The phrase fixer shows the text as a phone card, lets the learner tap what a reader cannot check, and counts "facts a reader can check" from 0 to 3. It uses Areej's own old opening, so the learner meets her before module 6 and sees the same text again in the gate 1.6 baseline.

## Data
Areej's old objective paragraph is from the canon (`module-briefs/00-areej-and-cast.md`, "Her old resume"). The fixes use only her canon facts: final-year software engineering student, the report endpoint p95 from 4.6 s to 0.41 s over 14 days before and after, and her habit of measuring before and after. Areej is a fictional fellow.

```json
{
  "title": "Only you can write this",
  "purpose": "Tap the phrases in Areej's AI-written opening that a reader cannot check. Each one says why and gives a fix only she could write. The card then becomes the rewrite.",
  "limits": "Which phrases count as empty is a judgment, and one word proves nothing: the same words can be fine in another sentence. Every fix is a fact Areej can back up; an edit pass can remove filler but cannot invent results. Areej and her numbers are fictional and illustrative.",
  "config": {
    "segments": [
      { "id": "adjectives", "text": "Highly motivated and passionate", "weak": { "why": "Adjectives. Nobody can check them.", "fix": "Final-year software engineering student and" } },
      { "id": "title", "text": "full-stack developer", "fineWhy": "A plain job title. A reader knows what it means." },
      { "id": "leverage", "text": "seeking to leverage cutting-edge technologies", "weak": { "why": "Which technologies? Seeking is not showing.", "fix": "who cut a daily report's p95 from 4.6 s to 0.41 s (14 days before and after)." } },
      { "id": "dynamic", "text": "in a dynamic environment.", "weak": { "why": "Every workplace says this. No fact in it.", "fix": "I measure before and after, and write it down." } }
    ],
    "cardLabel": "Areej's old opening",
    "checkableBefore": 0,
    "hint": "Tap each phrase you think a reader cannot check.",
    "endNote": "Now each phrase holds something a reader can ask about: a degree, a result with its window, a habit. Only Areej could write it."
  }
}
```

## What the learner should notice
The facts counter climbs from 0 to 3 only when an empty phrase is replaced by something specific. Deleting words leaves it at 0.

## Limits
In the `limits` field of the data.
