---
artifact: canvas-spec
course: one-percent-better
chapter: 06.02-amana-rasul-and-al-mulk
slug: before-sleep-recitations
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Two recitations before sleep

## Teaching claim
The last two verses of al-Baqarah at night are enough for the one who recites them (Sahih al-Bukhari 5009), and al-Mulk, thirty verses, interceded for a man until he was forgiven (Jami' at-Tirmidhi 2891, graded hasan); both fit after Isha.

## Why a canvas
Two recitations close Hamza's day: the last two verses of Surah al-Baqarah (Amana al-Rasul, Quran 2:285 to 286) and Surah al-Mulk (Quran 67). Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His phone, His bed.
- Steps: 1. The phone goes first; 2. Amana al-Rasul; 3. Surah al-Mulk; 4. A tired night.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 2891, Quran 2:285-286, Sahih al-Bukhari 5009).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza's last fifteen minutes of the day and see where the two recitations fit.
- Try this:
  1. Before step 2, predict: which of the two recitations is the better minimum for a tired night, and why?
  2. What is the first step that has to happen for the two recitations to win against the phone?
- Limits of the model: Times are for a steady, unhurried reading; they vary with each reader. A popular report that the Prophet never slept until he recited al-Mulk carries weak gradings in Jami' at-Tirmidhi (2892), so this course does not use it. The sound virtue of al-Mulk is in Jami' at-Tirmidhi 2891.

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
