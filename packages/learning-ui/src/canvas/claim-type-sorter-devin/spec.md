---
artifact: canvas-spec
course: build-with-ai
chapter: 01.02-why-ai-looks-bigger
slug: claim-type-sorter-devin
version: 1
owner: interaction-designer
renderer: scene (data only)
---

# Canvas spec: A launch claim meets an outside test

## Teaching claim
A maker's launch number and an outside team's trial are different kinds of evidence. Neither supports "fake" or "engineer" (dossier A12, A13).

## Why a canvas
Two results months apart are easy to blur in text. A short story with the maker, the readers and the outside team shows who said what, and in what order.

## Model
- Story: the maker sends "13.86% solved" to the readers (March 2024); the readers hear "maker's test". Later the outside team sends "3 of 20 worked" and says "14 failed" (January 2025); the readers hear "outside, small". Verdict: "A launch claim is not a test".
- Numbers: 13.86% is the maker's reported share of issues solved on its chosen test; 20 tasks with 3 worked, 14 failed and 3 unclear is the outside trial. The 3 unclear tasks are stated in the chapter text and fold.
- Assumptions and limits: two different tests; the trial was one small team and 20 tasks, not a controlled study, and the tool has changed since.

## Rendering
Scene renderer, watch-only, 420 by 280. Second lines and spoken lines are at most 15 characters; the verdict is 28 characters.

## Copy
- What this shows: a launch claim, then an outside test.
- Limits: as in `limits`.

## Accessibility
Shared scene renderer: a text transcript of actors and verdict; reduced motion shows the final frame.

## Acceptance criteria
- [x] Every figure matches chapter 1.2 and dossier A12, A13.
- [x] No colour carries meaning alone: tones come with words.
- [x] Not the playable beat: the chapter's playable canvas is `claim-type-sorter`.

## Placement
Chapter 1.2, beat 1.
