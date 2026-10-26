---
artifact: canvas-spec
course: one-percent-better
chapter: 10.03-eyes-ears-and-haya
slug: guarding-eyes-and-ears
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: What comes in through the eyes and ears

## Teaching claim
Guarding the eyes and ears works through quick, planned responses: turn away from a sudden glance, leave talk that is harmful, and keep haya as part of your identity.

## Why a canvas
The eyes and the ears take in everything in a day. The Quran commands lowering the gaze, and the Sunnah treats haya as part of faith. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, Screen, Friends.
- Steps: 1. The first glance; 2. Do not take the second look; 3. Talk that turns crude; 4. Not listening to backbiting; 5. Haya as identity.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 17:36, Quran 24:30-31, Quran 28:55, Sahih Muslim 2159, Sahih Muslim 2657, Sahih Muslim 35, Sahih al-Bukhari 6120).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: See moments in one day when eyes and ears are tested, and the planned response for each.
- Try this:
  1. Before step 2, predict: which glance is the habit about, the first or the second?
  2. Where do your eyes and ears get tested most: the street, the screen or friends?
- Limits of the model: This uses a boy's day, but the same applies to men and women of every age. Practical help such as content filters is taking the means; it does not replace the habit of the heart.

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
