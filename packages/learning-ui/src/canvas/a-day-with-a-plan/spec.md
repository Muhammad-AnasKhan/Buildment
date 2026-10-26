---
artifact: canvas-spec
course: one-percent-better
chapter: 13.02-discipline-and-time
slug: a-day-with-a-plan
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A day with a plan

## Teaching claim
Discipline is a daily habit of planning time, doing the hard important task first, limiting what wastes time, and keeping commitments, because life and time will be asked about.

## Why a canvas
Free time and health are blessings many people lose. Discipline is not harshness; it is a plan that puts the important thing first. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, His plan, Distractions.
- Steps: 1. Plan the night before; 2. The hard task first; 3. Distractions; 4. Commitments come first; 5. Why time matters.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 2417, Quran 79:40-41, Sahih Muslim 2664, Sahih al-Bukhari 33, Sahih al-Bukhari 6412).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one study day and see how a plan protects time, with the source behind each choice.
- Try this:
  1. Before step 2, predict: should the hardest task go first or last?
  2. What is the one thing that steals most of your free time?
- Limits of the model: Rest, family time and halal play are good uses of time, not waste. Discipline is a plan with room for them, not a day with no breaks.

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
