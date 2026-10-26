---
artifact: canvas-spec
course: one-percent-better
chapter: 07.03-eating-and-drinking
slug: the-sunnah-meal
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: One meal, done the Sunnah way

## Teaching claim
The meal is a daily cue for a small, sourced set of manners: Bismillah, the right hand, eating from in front of you, moderation, drinking in breaths, and praise at the end.

## Why a canvas
Three times a day, a meal gives the same cue. The Sunnah of eating and drinking is a short set of manners that a whole family can learn at one table. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, Hamza, The table.
- Steps: 1. Bismillah, right hand, in front; 2. If you forget at the start; 3. No complaining about food; 4. Stop before full; 5. Drinking; 6. Praise at the end.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 2380, Quran 7:31, Sahih Muslim 2028, Sahih Muslim 2734, Sahih al-Bukhari 5376, Sahih al-Bukhari 5409, Sahih al-Bukhari 5630, Sunan Abi Dawud 3767, Sunan Abi Dawud 4023).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Sit at Hamza's family table and see each manner of eating and drinking with its source.
- Try this:
  1. Before step 2, predict: if Musa forgets Bismillah, is the chance lost for that meal?
  2. Which manner would be easiest for your whole family to start at the next meal?
- Limits of the model: These are the core sourced manners; scholars discuss details such as standing to drink, which this course presents with both narrations. There is no single sound dua specific to drinking water beyond Bismillah and Alhamdulillah.

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
