---
artifact: canvas-spec
course: build-with-ai
chapter: 08.05-habits-that-build-trust
slug: trust-or-erode
version: 1
owner: interaction-designer
renderer: custom, on the reusable Sorter primitive (primitives/sorter.tsx, model models/sorter.ts)
---

# Canvas spec: Builds trust or erodes it?

## Teaching claim
In a team that uses AI, trust is built by small pull requests you can explain, short written updates that name the blocker, and early questions that say what you tried. It is eroded by large changes you cannot explain, silence until the deadline, hidden problems, and decisions nobody writes down. The reading rests on three practices from large companies, each with limits: the code review standard (approve a change that clearly improves code health, even if not perfect; B75), psychological safety as the first of five team dynamics (B76), and written, asynchronous updates (B77). Outreachy's rule against unexplained, unedited AI contributions (B67) supports the AI cards.

## Why a canvas
"Be a good teammate" is too vague to practise. Sorting eight habits one at a time, with a reason after each wrong try, shows which habits teammates can rely on and which make them guess. Four cards have AI in the loop (the 40-line pull request that says what AI drafted, the 1,200-line pull request that nobody can explain), so the course's explain-back rule appears as a team habit.

## Model
- Inputs: one bucket choice per card, by tap or drag.
- Outputs: the bucket counts and the number of cards that took a second try.
- Rule: a right bucket moves the card; a wrong bucket keeps it, shows the reason written for that card and bucket, and marks it missed (shared Sorter model).
- Buckets: Builds trust (teammates can rely on it); Erodes trust (teammates must guess).
- Cards (8, all made up): a 40-line pull request that says what AI drafted and what you checked (builds); a Friday update with done, next and one named blocker (builds, B77); five quiet days then "almost done" on deadline day (erodes); approving a clear improvement with one optional note (builds, B75); a 1,200-line pull request of AI code you cannot explain (erodes, B67); a call that decides something nobody writes down (erodes, B77); asking on day 1 with what you tried (builds, B76); staying stuck for a week so nobody thinks you are slow (erodes, B76).
- Distribution: 4 builds, 4 erodes. In data order the answers run builds, builds, erodes, builds, erodes, erodes, builds, erodes, so no bucket repeats more than twice in a row.
- Assumptions: each card has one best bucket under the chapter's reading.
- Limitations: practices from large companies are not proof that one way is better everywhere; real teams differ.

## Rendering
Shared Sorter primitive: 420 by 300 viewBox, one card on top, two trays below, a banner and a reason line. Card text is at most 61 characters; each reason is at most 71 characters; the prompt is 34 characters; the end note has 92 characters (three lines of 46).

## Controls
Tap a bucket or drag the card onto it. Keyboard: each bucket is a button.

## Copy
- What this shows: eight team habits, sorted by whether teammates can rely on them.
- Try this: sort once, then press "Sort again" for a new order and see which card you missed.
- What changed: the banner states the result of each try; the end verdict counts second tries.
- Limits: as in `limits`.

## Edge cases
- Nothing on a card claims one style is better for every team. The reasons talk about what the teammate can do next.
- Names are not used on cards; the chapter story names Faisal and Mira.

## Accessibility
Shared Sorter: bucket buttons labelled with name, gloss and count; a polite live region reads each result and reason; reduced motion removes flight and shake.

## Acceptance criteria
- [x] The claim is testable: the quick check after the chapter transfers it to a new team and habit.
- [x] The model is tested by the shared Sorter tests and `checkDeck`.
- [x] Prediction before the canvas, transfer after.
- [x] Reader fallback: the chapter's fold explains each practice with its source and limit.

## Build plan
`packages/learning-ui/src/canvas/trust-or-erode/data.ts`, exports `TRUST_BUCKETS`, `TRUST_CARDS` and `trustOrErode` (CustomCanvasSpec). To be registered by the orchestrator.

## Placement
Chapter 8.5, beat 2 ("Sort the team habits"), after the predict and the beat that compares two pull requests.
