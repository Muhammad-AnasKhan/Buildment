---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 9.6 Let AI critique your work
slug: act-on-feedback
version: 1
owner: interaction-designer
---

# Canvas spec: Fix, test or reject?

## Teaching claim
AI critique is a list of claims to test. Fix what you can see is true, test what might be true, and reject what does not fit your goal, with one written reason. Praise is not a point.

## Why a canvas
A learner who reads "do not act on everything" still acts on everything. Sorting eight real-looking points, and getting a reason when a bucket is wrong, practises the judgement the chapter names.

## Model
- Buckets: Fix now (true, easy to see), Test first (could be true), Reject (write one reason).
- Cards (eight, mixed order; three Test first, two Fix now, three Reject), all about Shelf, Nabil's school library page (fictional):
  | Card | Bucket | Why |
  |---|---|---|
  | Dates break for loans that start on 31 January (not run yet) | Test first | He has not seen it fail |
  | Great work! No changes needed | Reject | Praise is not a point; ask for the three weakest points (C58) |
  | The README has no steps for running the page (Nabil checks: none) | Fix now | True and visible |
  | Rewrite the page in a big framework (the page has 60 lines) | Reject | Does not fit the goal |
  | The page needs the internet (not tried offline yet) | Test first | Unverified |
  | No LICENSE file (Nabil checks: none) | Fix now | True and visible |
  | Use a faster sort for the book list (40 books) | Reject | Nothing to gain at this size |
  | The run command in the README is wrong (not run yet) | Test first | Run it first |
- Rule: the shared sorter model.
- Dossier ids: C56 (AI review is not guaranteed to spot all problems and will make mistakes; supplement with a human review), C58 (assistants lean towards agreeing, so ask for problems, not praise), C57 only for the chapter's evidence beat. The three buckets are the course's method (C56 to C58 give the cautions, not the buckets).
- Assumptions: each card states what Nabil has already checked, so the sort can be decided from the card alone.
- Limitations: stated in `limits`.

## Rendering
- Primary: the shared sorter primitive.
- Why this renderer: the learner must choose and get a consequence.
- Controls: tap a bucket or drag the card. Labels: bucket labels at most 15 characters, sub lines at most 18, card text at most 72.
- Static fallback: the primitive's text alternative.

## Controls
Three bucket buttons, drag as an alternative, "Sort again".

## Visualisation
One card on top, three trays, a red reason after a wrong try, a verdict after the last card.

## Copy
- What this shows: what to do with each point from an AI critique.
- Try this:
  1. Put the "Great work" card in Fix now and read why it fails.
  2. Notice which cards say "not run yet" and what that means.
  3. Notice that a reject always comes with a reason.
- What changed: counts in the trays and the verdict.
- Limits of the model: set in `limits`.

## Edge cases
A point can be both quick to check and quick to fix; here, a point you can confirm by looking is Fix now. A second round deals in a new order.

## Accessibility
Real buttons for the buckets, a polite live region for results, reduced motion removes the flight and the shake.

## Acceptance criteria
- [x] The claim is testable: the learner can sort a new critique point.
- [x] `checkDeck` returns no problems.
- [x] No dash characters.
- [x] Prediction before (chapter 9.6), transfer check after.
- [x] Reader fallback exists.

## Build plan
`packages/learning-ui/src/canvas/act-on-feedback/data.ts` (exports `FEEDBACK_BUCKETS`, `FEEDBACK_CARDS`, `actOnFeedback`), primitive `makeSorterCanvas`. The orchestrator registers the slug.
