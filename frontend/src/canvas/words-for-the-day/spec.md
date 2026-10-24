---
artifact: canvas-spec
course: faith-and-resilience
chapter: 03.03-words-for-hard-moments
slug: words-for-the-day
version: 2
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Words for the day

## Teaching claim
Different hard moments have different words in the Sunnah: the istirja at the news, the dua of distress at night, refuge from worry about tomorrow, and "Allah is enough for us" before a frightening moment.

Version 2 (revision round 1): the consoling steps moved out of the canvas into the chapter text, so the canvas keeps one claim.

## Why a canvas
The chapter lists the words one by one. The canvas puts them in the order a real week brings them, each tied to the moment it fits. Stepping from moment to moment answers the predict ("did one set of words serve every hard moment?") before the chapter teaches each word in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Rule: two lanes (Her mother, Mariam) and five steps: the istirja from the mother to Mariam, then four loops inside Mariam (night distress, worry about tomorrow, before the interview, her own words).
- Honorifics: the first mention of the Prophet, Umm Salamah and Ibrahim in the canvas carries the honorific.
- Assumptions: sources only from the course dossier (Quran 2:156; Sahih Muslim 918; Sahih al-Bukhari 6346, 6369, 4563).
- Limitations: a few of the Sunnah's words, one week. No dua is shown with a promised result.

## Rendering
- Primary: the shared sequence renderer.
- Two actors, so lanes stay wide on a phone. Arrow labels are 17 characters or fewer.
- Static fallback: chapter 3.3 teaches each word with its meaning and reference in prose, and a mermaid timeline shows a second person's day.

## Controls
Shared stepper controls only.

## Visualisation
Two lanes, one arrow and four loops. Tone: warn on the frightening moment, good on "her own words", each with a text badge.

## Copy
- What this shows: which words fit which kind of hard moment.
- Try this:
  1. Before step 2, check the prediction: did one set of words serve every hard moment?
  2. Match each of the first four steps to its moment, and pick one for your week.
- What changed: each note names the moment, the words and the reference.
- Limits of the model: as in `limits`, including the human contact for anyone who stays overwhelmed.

## Edge cases
Loops (from equals to) draw work inside one lane. No Arabic script in the canvas: duas are given as English meanings with references, so nothing depends on Arabic rendering in SVG.

## Accessibility
Shared stepper keyboard support; `summary` describes the whole week; tone always has a text badge.

## Acceptance criteria
- [ ] The claim is testable (quiz items after the canvas ask which use of a dua fits a new case).
- [ ] The model is tested (registry label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose and mermaid in 3.3).

## Build plan
`frontend/src/canvas/words-for-the-day/data.ts` (export `wordsForTheDay`), registered in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
