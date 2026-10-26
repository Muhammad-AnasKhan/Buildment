---
artifact: canvas-spec
course: one-percent-better
chapter: 12.02-parents-and-relatives
slug: parents-first
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A week of honouring parents

## Teaching claim
Honouring parents is built from small daily actions, listening fully, a lowered voice, help without being asked, dua for them, and kinship ties kept with a regular call or visit.

## Why a canvas
After Allah's rights, the Quran places parents. The Sunnah adds ties of kinship as a daily and weekly habit. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His mother, Relatives.
- Steps: 1. Listen fully; 2. A lowered voice; 3. Help without being asked; 4. Dua for parents; 5. Kinship ties.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 17:23, Quran 17:24, Sahih al-Bukhari 5971, Sahih al-Bukhari 5986).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: See small daily and weekly actions for parents and relatives, each with its source.
- Try this:
  1. Before step 2, predict: what is the smallest word of impatience the Quran forbids to parents?
  2. Which relative have you not called for a long time?
- Limits of the model: Honouring parents does not include obeying them in sin, and some families are hard or harmful places; if that is your situation, talk to a scholar or a counsellor you trust. Kinship ties take different forms in different families.

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
