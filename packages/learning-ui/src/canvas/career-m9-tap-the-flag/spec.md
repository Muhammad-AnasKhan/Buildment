---
artifact: canvas-spec
course: career-brand
chapter: "9.2"
beat: 2
slug: career-m9-tap-the-flag
kind: phrase-fixer
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Tap a flag, see your words

## Teaching claim
Each flag in feedback points at your own words and has a fix: name your part, add the source or an honest gap, or explain the term. The best first move for an unsupported number is to find its source or write a gap, not to delete it.

## Why this visual
The phrase fixer shows a short answer as it was said. Each flagged phrase is tapped to show its flag, why it is weak and the fix.

## Change from the module brief
The brief imagines a feedback card with flags and four possible fixes. The phrase fixer shows one fix per flag, so the learner meets three of the five flags (vague ownership, unsupported number and jargon without explanation) in one answer. The fixes are Areej's from the canon: "my lead deployed it after my migration passed review" and the case study that explains "composite index".

## Data
```json
{
  "title": "Tap a flag, see your words",
  "purpose": "Tap the three phrases in part of Areej's answer that the interviewer flagged: vague ownership, an unsupported number and jargon. Each says why and gives the fix. The card then becomes her corrected answer.",
  "limits": "A feedback tool can be wrong, and the platform keeps a flag only when its quote really appears in your answers. The five flags from gate 1.6 are vague ownership, unsupported number, pseudo-story, invented reason risk and jargon without explanation; this card shows three.",
  "config": {
    "segments": [
      { "id": "we", "text": "We deployed it", "weak": { "why": "Vague ownership. Who did which part?", "fix": "my lead deployed it after my migration passed review" } },
      { "id": "ninety", "text": "and it got about 90 percent faster,", "weak": { "why": "Unsupported number. No window or source.", "fix": "and the report p95 (95 of 100 requests finish within it) fell from 4.6 s to 0.41 s (14 days, team dashboard)," } },
      { "id": "jargon", "text": "using a composite index.", "weak": { "why": "Jargon, with no explanation yet.", "fix": "using a composite index (explained in my case study)." } }
    ],
    "cardLabel": "Part of Areej's answer",
    "checkableBefore": 0,
    "hint": "Tap each phrase the interviewer flagged.",
    "endNote": "Each flag pointed at her own words and had a fix: her part named, the number sourced, the term explained."
  }
}
```

## What the learner should notice
No fix added a new fact. Each used something already in the ledger or the case study.
