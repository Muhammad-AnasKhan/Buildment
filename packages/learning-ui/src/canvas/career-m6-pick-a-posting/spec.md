---
artifact: canvas-spec
course: career-brand
chapter: "6.5"
beat: 4
slug: career-m6-pick-a-posting
kind: budget-stack
playable: true
version: 1
owner: interaction-designer
---

# Canvas spec: Pick a posting, watch the order change

## Teaching claim
Change three things for a posting: the first bullets, the order of the projects and the summary line, each backed by a ledger row. For a database-speed posting, the two speed bullets must be on the first screen.

## Why this visual
The budget stack shows what a quick reader sees of the untailored resume. The learner moves the two bullets that match the posting up. It is the same primitive as 1.2 beat 3, applied to a posting.

## Change from the module brief
The brief lets the learner pick one of two postings. A budget stack has one goal, so this beat uses the backend posting from the canon (small logistics software startup, PostgreSQL performance work). The second posting (a frontend role at an agency) is described in the beat's text and in the build chapter's template; its tailoring record uses the same three changes with different ledger rows.

## Data
Costs are lines on a first phone screen and are illustrative. The proof blocks are the two that match the posting; the other blocks are real and true, only not what this reader asked for.

```json
{
  "title": "Pick a posting, watch the order change",
  "purpose": "Areej's untailored resume fills its first screen with the summary, the invoice script, the key fix and the club form. The posting asks for database speed work. The learner moves the report bullet and the load-test bullet up so the reader sees them.",
  "limits": "The 10 lines and the size of each block are illustrative. A block counts as seen when the first screen covers at least half of it. Every block is a real ledger row; none is dropped, they only move.",
  "config": {
    "blocks": [
      { "id": "summary", "label": "Summary: a full-stack developer who measures", "cost": 2, "kind": "context", "note": "Her general summary line." },
      { "id": "invoice", "label": "Invoice script: about 3 hours a week saved", "cost": 3, "kind": "context", "note": "True, but not what this posting asks for." },
      { "id": "key", "label": "Replaced a leaked key; push protection on", "cost": 3, "kind": "context", "note": "True, and good for another posting." },
      { "id": "volunteer", "label": "Volunteer: club sign-up form and migration", "cost": 3, "kind": "context", "note": "True, but it sits above Campus Board today." },
      { "id": "report", "label": "Cut a report's p95 from 4.6 s to 0.41 s", "cost": 3, "kind": "proof", "note": "Matches a posting that asks for PostgreSQL speed." },
      { "id": "campus", "label": "Campus Board load test: p95 820 to 95 ms", "cost": 3, "kind": "proof", "note": "A second proof of measured speed work." }
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
Nothing is deleted or rewritten, and no word from the posting appears. Moving true lines to the front is the whole of honest tailoring.
