---
artifact: canvas-spec
course: one-percent-better
chapter: 10.02-the-tongue
slug: before-you-speak
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Five seconds before speaking

## Teaching claim
One question before speaking, 'is this good, true and needed?', guards the tongue from lies, backbiting, tale-bearing, mockery and harshness.

## Why a canvas
Speech is the habit we use most. The Sunnah gives one rule for all of it, say good or be silent, and names the kinds of speech to avoid. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Colleagues.
- Steps: 1. The rule; 2. Mockery; 3. Backbiting; 4. Tale-bearing; 5. Gentle and truthful; 6. Why it matters.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 31:19, Quran 49:11, Sahih Muslim 2589, Sahih Muslim 47, Sahih al-Bukhari 6056, Sahih al-Bukhari 6094, Sahih al-Bukhari 6474).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 2 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one lunch break and see where the tongue is tested, and the source for each test.
- Try this:
  1. Before step 3, predict: if what is said about Sara is true, is it still backbiting?
  2. Which of these tests comes up most in your week?
- Limits of the model: Scholars list exceptions where speaking about someone is allowed, such as asking for help against wrong or giving a needed warning; learn them from a scholar. This canvas shows a few common tests, not every case.

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
