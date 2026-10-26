---
artifact: canvas-spec
course: one-percent-better
chapter: 06.03-a-bedtime-routine-that-holds
slug: al-mulk-by-heart
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Al-Mulk by heart, five verses a week

## Teaching claim
A long memorisation goal becomes a weekly habit when it is cut into small pieces, with old pieces reviewed before new ones are added.

## Why a canvas
Reciting al-Mulk from memory frees the habit from the mushaf and the light. Thirty verses, learned a few at a time, take about six weeks. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, New verses, Night review.
- Steps: 1. Week 1: five verses; 2. Review at night; 3. Weeks 2 and 3: five more each; 4. Week 4: a review week; 5. Week 7: the whole surah.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih al-Bukhari 6465).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza's six weeks of learning Surah al-Mulk by heart and see how the review keeps old verses from slipping.
- Try this:
  1. Before step 4, predict: when the old verses slip, should Hamza push on with new ones or stop and review?
  2. Count: at five verses a week with one review week, how many weeks for thirty verses?
- Limits of the model: Five verses a week is one person's pace; some learn faster or slower, and both are fine. Correct pronunciation needs a teacher. Memorising is a bonus, not a condition: reading al-Mulk from the mushaf is the same surah and the same habit.

## Edge cases
Loops (from equals to) draw work inside one lane. No Arabic script in the canvas: adhkar and verses are given as English meanings with references, so nothing depends on Arabic rendering in SVG.

## Accessibility
Shared stepper keyboard support; `summary` describes the whole flow; tone always has a text badge.

## Acceptance criteria
- [ ] The claim is testable (quiz items after the canvas ask which step fits a new case).
- [ ] The model is tested (registry label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose and mermaid in the chapter).
