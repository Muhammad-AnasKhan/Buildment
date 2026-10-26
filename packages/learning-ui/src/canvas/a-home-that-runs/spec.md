---
artifact: canvas-spec
course: one-percent-better
chapter: 12.03-home-responsibility-neighbours-and-guests
slug: a-home-that-runs
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A home where everyone carries something

## Teaching claim
Responsibility at home, from your own room to helping siblings, is a sourced habit, and so are the rights of neighbours and guests.

## Why a canvas
Everyone in a home is a shepherd of something. The Prophet himself served his family, and the Sunnah gives neighbours and guests clear rights. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, Home, Neighbours, guests.
- Steps: 1. Your own room; 2. Helping at home is Sunnah; 3. Promises; 4. No blame-shifting; 5. The neighbour; 6. Guests.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 47, Sahih al-Bukhari 33, Sahih al-Bukhari 6014, Sahih al-Bukhari 676, Sahih al-Bukhari 7138).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one Saturday at home and see responsibility, neighbours and guests with their sources.
- Try this:
  1. Before step 2, predict: did the Prophet help with work at home?
  2. What is one thing in your home that is clearly 'your flock'?
- Limits of the model: Every home divides work differently; this shows one family. Neighbour rights include not harming them with noise, parking or waste, as well as kindness.

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
