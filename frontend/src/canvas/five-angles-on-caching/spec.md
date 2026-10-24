---
artifact: canvas-spec
course: build-with-ai
chapter: 03.03-one-topic-five-angles
slug: five-angles-on-caching
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Five angles on caching

## Teaching claim
Each of five angles on one topic (a plain explanation in your own words, a picture, a worked example, a failure case, building or teaching it) catches a gap the others miss.

## Why a canvas
The chapter teaches the five angles in prose and works them through on a different topic (Lina and the library's laptop rule). The canvas shows Yara's week 7 on caching (her plan's caching week) one angle at a time, so the learner can predict which angle will find the click-count gap before it appears, and can see that each gap comes from a different angle.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: four lanes (Yara, Chat assistant, Her notes, Her lab); seven steps: the plain explanation, then one step per angle (own words, picture, worked example, failure case, build: her lab days 3 and 4), then the notes page with five gaps.
- Facts (checked twice, match chapter 3.3): a cache keeps short code and long link pairs so most clicks skip the database; on a miss the app reads the database and saves a copy in the cache; if a click is counted only when the database is read, a click answered from the cache is not counted; an edited link stays old in the cache until the copy expires or is deleted; on lab day 3 Yara makes the log say whether the cache or the database answered each click, because the two look the same to the person clicking; lab day 4 (stopping the cache) is named but its result is left to chapter 4.4, so its predict is not spoiled. This matches the course calendar in revision round 1 (no separate in-memory cache lab).
- Assumptions: one fellow, one topic, angles spread over four evenings.
- Limitations: on other topics angles can overlap or find nothing; five angles is the course's method, not a tested package.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are 16 characters or fewer ("trace two clicks" and "draw it as boxes" are the longest).
- Every arrow starts at Yara: the learner drives each angle; the chat assistant is one lane among four, not the source of every step.
- Static fallback: chapter 3.3 describes all five gaps in prose after the canvas ("What the angles found").

## Controls
Shared stepper controls only.

## Visualisation
Four lanes, one arrow per step. Warn tone on each of the five gaps, good tone on the final notes page, each with a text badge.

## Copy
- What this shows: five angles on caching, five different gaps.
- Try this: 1. At step 4, follow click 2 on the paper trace and see which part answers it, and what that means for the click count (points at the step that answers the chapter's predict). 2. Cover the badges: could a different angle have found each gap?
- What changed: each step note names the angle and the gap it found.
- Limits of the model: as in `limits`.

## Edge cases
No loops (every step goes from Yara to another lane). Tool names are not used: the lane is "Chat assistant". The cache's documentation is named only as "the cache's documentation", with no product name.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole week for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas asks which angle would have found a cost gap in a new case).
- [ ] The model is tested (registry consistency and label-fit tests, run by the orchestrator after registration).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 3.3).

## Placement
Chapter 3.3, section "Yara's five angles on caching", after the predict and before "What the angles found".

## Build plan
`frontend/src/canvas/five-angles-on-caching/data.ts`, exporting `fiveAnglesOnCaching`. To be registered by the orchestrator in `frontend/src/canvas/registry.ts` and the shared slug lists; covered by `frontend/tests/unit/canvas/registry.test.ts`.
