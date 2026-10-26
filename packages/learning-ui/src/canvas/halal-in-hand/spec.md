---
artifact: canvas-spec
course: one-percent-better
chapter: 13.04-halal-provision-and-money
slug: halal-in-hand
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Honest from first sale to last

## Teaching claim
Halal provision is a set of daily habits: honest work, full measure, no deceit, moderate spending and respect for others' money, because Allah accepts only what is good.

## Why a canvas
What we earn, eat and spend is part of worship. The Sunnah links halal income to accepted dua, and forbids cheating and waste. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: His uncle, A buyer, Musa.
- Steps: 1. No hidden faults; 2. Full measure; 3. Only the good; 4. Moderation; 5. Respecting what is given.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 25:67, Quran 7:31, Quran 83:1-3, Sahih Muslim 1015, Sahih Muslim 102).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one day in a small shop and one month of pocket money, and see each money habit with its source.
- Try this:
  1. Before step 3, predict: according to Sahih Muslim 1015, what can block a dua from being answered?
  2. What is one 'want' you could move out of your spending this month?
- Limits of the model: Rulings on specific kinds of income, interest and contracts are fiqh; ask a qualified scholar. A warning that flesh grown from haram is nearer the Fire is in Jami' at-Tirmidhi 614 (graded sahih by al-Albani); this course teaches it gently, as a reason to choose halal, not to despair.

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
