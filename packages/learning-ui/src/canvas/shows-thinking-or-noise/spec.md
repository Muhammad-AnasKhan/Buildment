---
artifact: canvas-spec
course: build-with-ai
chapter: 08.03-build-more-to-show
slug: shows-thinking-or-noise
version: 1
owner: interaction-designer
renderer: custom, on the reusable Sorter primitive (primitives/sorter.tsx, model models/sorter.ts)
---

# Canvas spec: Shows thinking or noise?

## Teaching claim
Public work is evidence others can check, never a hiring promise (dossier B78, B80, v1 S105). Work that shows thinking gives a reader a choice, a reason, a user or a failure to check: a series with a log, a small tool someone uses, a write-up of a failure, a clone whose README says what you changed and why. Volume alone does not: forty tutorial clones, an unchanged fork, faked commits, or a large app with no reasons. The sorting rule is the course's own reading; no source found compares kinds of public work (U13).

## Why a canvas
"Show your thinking" is easy to nod at and hard to apply. Sorting eight pieces of work one at a time, with a reason after each wrong try, makes the learner apply the one question: can a reader check how this person decides? The tricky cards are the clone with a README of changes (it looks like noise but is not) and the large AI-built app (it looks impressive but is noise).

## Model
- Inputs: one bucket choice per card, by tap or drag.
- Outputs: the bucket counts and the number of cards that took a second try.
- Rule: a right bucket moves the card; a wrong bucket keeps it, shows the reason written for that card and bucket, and marks it missed (shared Sorter model).
- Buckets: Shows thinking (a reader can check); Noise (more, not clearer).
- Cards (8, all made up): forty tutorial clones with the tutorial's README (noise); a weekly lab series of eight entries with one failed test explained (thinking, v1 chapter 4.5); a tutorial clone whose README lists 3 changes and why (thinking, tricky); a fork with no changes (noise); a small tool that 3 classmates use, with a README of 2 trade-offs (thinking); 300 commits made in one night by a script (noise, faked activity, C63 to C67); a write-up of a 2-day bug with cause, fix and next check (thinking); a big AI-built app whose README says only "built with AI" (noise, the explain-back rule of chapter 7.4).
- Distribution: 4 thinking, 4 noise. In data order the answers run noise, thinking, thinking, noise, thinking, noise, thinking, noise, so no bucket repeats more than twice in a row.
- Assumptions: each card has one best bucket under the chapter's question.
- Limitations: real work sits between the buckets; the buckets are a first question, not a verdict.

## Rendering
Shared Sorter primitive: 420 by 300 viewBox, one card on top, two trays below, a banner and a reason line. Card text is at most 73 characters (three lines of 40 are allowed); each reason is at most 68 characters; the prompt is 29 characters; the end note has 96 characters (three lines of 46).

## Controls
Tap a bucket or drag the card onto it. Keyboard: each bucket is a button.

## Copy
- What this shows: eight pieces of public work, sorted by whether a reader can check the thinking.
- Try this: sort once, then press "Sort again" for a new order and see which card you missed.
- What changed: the banner states the result of each try; the end verdict counts second tries.
- Limits: as in `limits`.

## Edge cases
- The faked-commits card is in the deck so that the course's rule (never fake activity) appears once as a sorting reason, not as a lecture.
- Nothing on a card says a person was or was not hired. Figures in the chapter match dossier B78 with its limits.

## Accessibility
Shared Sorter: bucket buttons labelled with name, gloss and count; a polite live region reads each result and reason; reduced motion removes flight and shake.

## Acceptance criteria
- [x] The claim is testable: the quick check after the chapter asks the learner to choose the piece of public work that gives a reader the most to check.
- [x] The model is tested by the shared Sorter tests and `checkDeck` (every wrong bucket has a reason).
- [x] Prediction before the canvas (the chapter's predict), transfer after.
- [x] Reader fallback: the chapter's fold explains each bucket with the same examples.

## Build plan
`packages/learning-ui/src/canvas/shows-thinking-or-noise/data.ts`, exports `THINKING_BUCKETS`, `THINKING_CARDS` and `showsThinkingOrNoise` (CustomCanvasSpec). To be registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`.

## Placement
Chapter 8.3, beat 3 ("Sort the work"), after the predict and the beat that compares two reviewers' ten minutes.
