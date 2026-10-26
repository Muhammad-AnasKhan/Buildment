---
artifact: canvas-spec
course: one-percent-better
chapter: 03.03-when-a-day-is-missed
slug: missed-portion-make-up
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: When the page is missed

## Teaching claim
A missed portion can be made up (Sahih Muslim 747), a deed you usually do is written for you when illness or travel stops you (Sahih al-Bukhari 2996), and the habit restarts at the next cue.

## Why a canvas
A missed day is not the end of a habit. The Sunnah gives a way to make up a missed portion, and it records the usual deed for someone who is ill or travelling. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His page.
- Steps: 1. Tuesday: he oversleeps; 2. He makes it up before Dhuhr; 3. He falls ill; 4. First healthy morning: back to normal.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 747, Sahih al-Bukhari 2996).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 2 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through two missed days in Hamza's Quran habit and see what he does after each.
- Try this:
  1. Before step 2, predict: once Fajr has passed, is a missed portion simply lost?
  2. At step 4, why does Hamza not read all the missed pages at once?
- Limits of the model: Sahih Muslim 747 speaks of a portion missed through sleep. Sahih al-Bukhari 2996 speaks of illness and travel, not choosing to skip. This canvas is about a voluntary daily portion. A missed obligatory prayer is a different matter: pray it as soon as you remember (Sahih Muslim 684), and ask a scholar about details.

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
