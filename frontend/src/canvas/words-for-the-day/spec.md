---
artifact: canvas-spec
course: faith-and-resilience
chapter: 03.03-words-for-hard-moments
slug: words-for-the-day
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Words for the day

## Teaching claim
Different hard moments have different words in the Sunnah: the istirja at the news, the dua of distress at night, refuge from worry about tomorrow; and a friend in loss is consoled with presence, few words and practical help, not explanations.

## Why a canvas
The chapter lists the words one by one. The canvas puts them in the order a real week brings them, tied to the moment each one fits, and then turns the same person outward to a friend. Seeing one person move from her own moments to consoling someone else makes the match between moment and words concrete.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Rule: three lanes (Her mother, Mariam, Lamees) and seven steps: the istirja from the mother to Mariam, two loops inside Mariam (night distress, worry about tomorrow), Lamees's call to Mariam, then three arrows from Mariam to Lamees (visit and listen, gentle words, a tutoring lead).
- Assumptions: sources only from the course dossier (Quran 2:156; Sahih Muslim 918; Sahih al-Bukhari 6346, 6369, 1284).
- Limitations: a few of the Sunnah's words, one week, one friendship. No dua is shown with a promised result.

## Rendering
- Primary: the shared sequence renderer.
- Three actors, so lanes stay wide on a phone. Arrow labels are 17 characters or fewer.
- Static fallback: chapter 3.3 teaches each word with its meaning and reference in prose, a mermaid diagram matches moments to words, and the worked example walks through the visit.

## Controls
Shared stepper controls only.

## Visualisation
Three lanes, seven arrows or loops. Tone: warn on the friend's loss, good on the practical help, each with a text badge.

## Copy
- What this shows: which words fit which hard moment, and how Mariam then consoles a friend.
- Try this:
  1. Before step 5, check the prediction: does an explanation or being there help Lamees more?
  2. Match each of the first three steps to its moment, and pick one for your week.
- What changed: each note names the moment, the words and the reference.
- Limits of the model: as in `limits`, including the human contact for anyone who stays overwhelmed.

## Edge cases
Loops (from equals to) draw work inside one lane. No Arabic script in the canvas: duas are given as English meanings with references, so nothing depends on Arabic rendering in SVG.

## Accessibility
Shared stepper keyboard support; `summary` describes the whole week; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz items after the canvas ask which approach to consoling and which use of a dua fits a new case).
- [x] The model is tested (registry label-fit tests, once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and mermaid in 3.3).

## Build plan
`frontend/src/canvas/words-for-the-day/data.ts` (export `wordsForTheDay`), to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
