---
artifact: canvas-spec
course: career-brand
chapter: "6.4"
beat: 3
slug: career-m6-empty-phrases
kind: phrase-fixer
playable: true
status: existing slug, data revised
version: 2
owner: interaction-designer
---

# Canvas spec: Tap the empty phrases

## Teaching claim
An AI-written summary can read well and still hold no fact a reader can check. Each empty phrase has to be replaced by something the writer can back up.

## Why this visual
The phrase fixer shows Waed's text as a phone card and counts the facts a reader can check from 0 to 3 as each empty phrase is replaced.

## Revision of the existing data
The data in `packages/learning-ui/src/canvas/career-m6-empty-phrases/data.ts` invents a "five-person online shop", "2 years" and "order packing time from 3 hours to 2 hours a day", none of which is in the canon (`module-briefs/00-areej-and-cast.md`). Waed is an operations coordinator on an NGO's logistics team. Her resume says "Responsible for coordinating shipments" and her AI tool wrote "Dynamic, results-driven professional who leverages cross-functional synergies." Her real result: a shared tracker cut missed delivery confirmations from about 30 a month to 6 a month, counted from the team's tracker over three months before and three after. Replace the data with the version below. The slug does not change.

## Data
```json
{
  "title": "Tap the empty phrases",
  "purpose": "Tap the phrases in Waed's AI-written summary and duty line that a reader cannot check; each one says why and offers a checkable fix, and the card becomes the rewrite once all are found.",
  "limits": "Which phrases count as empty is a judgment, and a word on its own proves nothing: the same words can be fine in another sentence. Every fix is a fact Waed must be able to back up; an edit pass can remove filler but cannot invent results. Waed and her numbers are fictional and illustrative.",
  "config": {
    "segments": [
      { "id": "dynamic", "text": "Dynamic, results-driven professional", "weak": { "why": "Adjectives. Nobody can check them.", "fix": "Operations coordinator on an NGO's logistics team" } },
      { "id": "synergies", "text": "who leverages cross-functional synergies.", "weak": { "why": "Which work? There is nothing to check.", "fix": "who built a shared tracker; missed delivery confirmations fell from about 30 to 6 a month (three months before and after)." } },
      { "id": "responsible", "text": "Responsible for coordinating shipments.", "weak": { "why": "A duty. It says the job, not what changed.", "fix": "Source: the team's tracker." } }
    ],
    "cardLabel": "Waed's AI-written summary",
    "checkableBefore": 0,
    "hint": "Tap each phrase you think a reader cannot check.",
    "endNote": "Every empty phrase now holds something a reader can ask about: a role, a result with its window, and where the numbers came from."
  }
}
```

## What the learner should notice
The facts counter reaches 3 only when each empty phrase is replaced by a role, a result with its window, or a source. Deleting words alone leaves it at 0.
