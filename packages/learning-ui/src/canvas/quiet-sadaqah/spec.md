---
artifact: canvas-spec
course: one-percent-better
chapter: 14.03-sadaqah
slug: quiet-sadaqah
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A small, quiet sadaqah

## Teaching claim
A small, regular, quiet sadaqah, from money or from things you no longer need, is a habit with a clear promise: it does not decrease wealth.

## Why a canvas
Sadaqah does not decrease wealth. A small weekly amount, given quietly, is a habit even a child can keep. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, His sadaqah box, Those in need.
- Steps: 1. A fixed small amount; 2. Quietly; 3. Things, not only money; 4. Easing hardship.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 2588, Sahih Muslim 2699, Sahih al-Bukhari 1423).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Musa's weekly sadaqah and see each step with its source.
- Try this:
  1. Before step 2, predict: is sadaqah better given openly or quietly, according to this canvas?
  2. What small fixed amount could you set aside each week?
- Limits of the model: Zakat is an obligation with its own rules and is different from voluntary sadaqah; ask a scholar about zakat. Giving openly can also be good when it encourages others; the habit here guards the heart.

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
