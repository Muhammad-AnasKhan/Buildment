---
artifact: canvas-spec
course: build-with-ai
chapter: 01.02-why-ai-looks-bigger
slug: claim-type-sorter
version: 1
owner: interaction-designer
renderer: custom, on the reusable Sorter primitive (primitives/sorter.tsx, model models/sorter.ts)
---

# Canvas spec: Sort claims by kind

## Teaching claim
Before you believe a claim about AI, ask what kind it is: a prediction about the future, a company's or vendor's own report, or a measurement by people outside the company. An official projection is also a prediction (dossier A10 to A16, A21, A29, A51, A52, A61).

## Why a canvas
A definition of "prediction" and "independent measurement" is easy to nod at and hard to apply. Sorting real claims one at a time, with a reason after each wrong try, makes the learner apply the questions. The twist card, a government projection, is where intuition is usually wrong, so the learner finds it by being wrong once, kindly.

## Model
- Inputs: one bucket choice per card, by tap or drag.
- Outputs: the bucket counts and the number of cards that took a second try.
- Rule: a right bucket moves the card; a wrong bucket keeps it, shows the reason written for that card and bucket, and marks it missed (shared Sorter model).
- Buckets: Prediction (about the future); Company claim (the seller's own report); Independent (measured by outsiders).
- Cards (8): the March 2025 "90 percent of code" statement (prediction, A10); Devin's launch number (company claim, A12); the January 2025 outside trial of 20 tasks (independent, A13); Google's "over a quarter of new code" (company claim, A11); the Stanford payroll study (independent, A21); the Veracode security tests (company claim, vendor research, A61); the BLS projection to 2035 (prediction, the twist, A29); the Gartner forecast (prediction, A52).
- Distribution: 3 predictions, 3 company claims, 2 independent measurements. In data order the answers run prediction, company, independent, company, independent, company, prediction, prediction, so no bucket repeats more than twice in a row.
- Assumptions: each card has one best bucket under the chapter's definitions. A company can also report a measurement, and an independent study can be funded by a company; the `limits` text says so.
- Limitations: the buckets are a first question, not a verdict on truth.

## Rendering
Shared Sorter primitive: 420 by 300 viewBox, one card on top, three trays below, a banner and a reason line. Card text is at most 103 characters (three lines of 40); each reason is at most 71 characters (two lines of 60); the end note is at most 89 characters.

## Controls
Tap a bucket or drag the card onto it. Keyboard: each bucket is a button.

## Copy
- What this shows: eight real claims, sorted by kind.
- Try this: sort once, then press "Sort again" for a new order and see which card you missed.
- What changed: the banner states the result of each try; the end verdict counts second tries.
- Limits: as in `limits`.

## Edge cases
- Veracode: a vendor ran real tests. It belongs with company claims because the vendor sells security tools; the chapter labels it "the vendor says".
- Stanford: the study uses payroll records supplied by a payroll company; the chapter calls it independent of AI companies, with its limits (US only, descriptive).
- Dates and figures match chapter 1.2 and dossier part A exactly.

## Accessibility
Shared Sorter: bucket buttons labelled with name, gloss and count; a polite live region reads each result and reason; reduced motion removes flight and shake.

## Acceptance criteria
- [x] The claim is testable: the quick check after the chapter asks the learner to classify a new claim with stated facts.
- [x] The model is tested by the shared Sorter tests and `checkDeck` (every wrong bucket has a reason).
- [x] Prediction before the canvas (the chapter's predict asks about the projection), transfer after.
- [x] Reader fallback: the chapter's fold explains each kind with the same examples.

## Build plan
`packages/learning-ui/src/canvas/claim-type-sorter/data.ts`, exports `CLAIM_TYPE_BUCKETS`, `CLAIM_TYPE_CARDS` and `claimTypeSorter` (CustomCanvasSpec). To be registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`.

## Placement
Chapter 1.2, beat 2 ("Sort eight claims by kind"), after the beat on Devin and its predict.
