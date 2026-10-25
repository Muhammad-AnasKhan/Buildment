---
artifact: canvas-spec
course: career-brand
chapter: "1.2"
beat: 3
slug: career-m1-first-look
kind: budget-stack
playable: true
status: existing slug, data revised
version: 2
owner: interaction-designer
---

# Canvas spec: Your first screen decides what they see

## Teaching claim
A phone shows only a fraction of a page, and whatever fills it is what a quick reader keeps. Moving the proof up is what lets them see it.

## Why this visual
The budget stack is the exact primitive for "what is seen before the budget runs out". The learner changes only the order, so the lesson is the order.

## Revision of the existing data
The data in `packages/learning-ui/src/canvas/career-m1-first-look/data.ts` gave Bashar an "Order API p95 from 1.9 s to 0.4 s" line, 24 tools and a 12 second budget. None of that is in the course canon (`module-briefs/00-areej-and-cast.md`): Bashar has 28 technologies, a nightly import he moved into a queue so it stopped timing out, and no invented number. The pack also says a first look must not be given as seconds. Replace the data with the version below (the unit is lines of a phone screen, not seconds). The slug does not change.

## Data
```json
{
  "title": "Your first screen decides what they see",
  "purpose": "Bashar's resume as a phone shows it. A first screen runs out before the proof; the learner moves the two proof blocks up so the reader sees them.",
  "limits": "The 10 lines and the size of each block are illustrative. Real readers differ: some read every line, some skip around, and no study gives a fixed time. A block counts as seen here when the first screen covers at least half of it. Bashar is a fictional fellow.",
  "config": {
    "blocks": [
      { "id": "name", "label": "Name and contact line", "cost": 2, "kind": "context" },
      { "id": "objective", "label": "Objective paragraph, AI-written", "cost": 5, "kind": "filler", "note": "A paragraph about being motivated." },
      { "id": "skills", "label": "Skills: 28 technologies in a block", "cost": 5, "kind": "context", "note": "Twenty-eight names, no order." },
      { "id": "duties", "label": "Responsible for backend services", "cost": 2, "kind": "filler", "note": "A duty, not a result." },
      { "id": "import", "label": "Moved the nightly import into a queue; it stopped timing out", "cost": 3, "kind": "proof", "note": "His best work. Today it sits on page 2." },
      { "id": "link", "label": "One labelled link to the import code", "cost": 1, "kind": "proof", "note": "One link that says what the reader will see." }
    ],
    "budget": 10,
    "unit": "lines",
    "budgetLabel": "First screen (illustrative)",
    "goal": 2,
    "hint": "Tap a block, then move it up or down. Or drag it."
  }
}
```

## What the learner should notice
Nothing about the proof changed, only its place. Name first, then the proof and its link; the objective paragraph and the skills block fall below the first screen. No number is added to the import line, because the canon gives none.

## Limits
In the `limits` field of the data.
