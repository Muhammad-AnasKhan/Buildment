---
artifact: canvas-spec
course: one-percent-better
chapter: 04.02-what-to-say-morning-and-evening
slug: morning-evening-starter-set
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A starter set, morning and evening

## Teaching claim
A small, sourced starter set said every morning and evening, grown one item at a time, is easier to keep than a long list said once.

## Why a canvas
The morning and evening adhkar (subah aur sham ke azkar) are words of remembrance the Prophet, peace be upon him, taught for the start and end of the day. Start with a small set you can keep, then add. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Morning, Evening.
- Steps: 1. The master of seeking forgiveness; 2. 'Bismillahilladhi' three times; 3. SubhanAllahi wa bihamdihi; 4. The same set in the evening; 5. When the three are easy: one more.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 3388, Quran 33:42, Sahih Muslim 2692, Sahih Muslim 2723, Sahih al-Bukhari 6306).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: See Hamza's small starter set of morning and evening adhkar, each with its source, and how it grows.
- Try this:
  1. Before step 4, predict: should the evening set be a new list, or the same words?
  2. Which of the three is shortest to say? Which would you keep on your hardest day?
- Limits of the model: This is a starter set of a few sound adhkar, not the full collection. There are many more in the books of adhkar. Learn the Arabic from a trusted teacher or a reliable book. Scholars differ on the exact times of morning and evening; the times here are one common practice.

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
