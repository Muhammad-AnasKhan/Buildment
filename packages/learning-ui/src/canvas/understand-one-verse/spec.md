---
artifact: canvas-spec
course: one-percent-better
chapter: 03.04-understanding-tajweed-and-hifz
slug: understand-one-verse
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: One page, three small additions

## Teaching claim
Understanding, tajweed and hifz grow best as tiny additions to the daily page: one verse's meaning, one correction a week, a few verses learned and reviewed.

## Why a canvas
Reading is the first habit. Understanding, correct recitation and memorising are three more, each built small and attached to the daily page. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His mushaf, His teacher.
- Steps: 1. One verse, understood; 2. One question in a notebook; 3. Tajweed, a little at a time; 4. Hifz in small pieces; 5. Review before new.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 38:29, Quran 73:4, Sahih al-Bukhari 50, Sahih al-Bukhari 5033).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza's daily page and see where understanding, tajweed and memorising fit without a new block of time.
- Try this:
  1. Before step 4, predict: is memorising mainly about learning new verses or about keeping old ones?
  2. Which of the three additions would cost you the least time tomorrow?
- Limits of the model: These are one learner's sizes. Meaning in a translation is a help, not a full tafsir; for deeper study, learn from a qualified teacher. Correct recitation needs a teacher's ear.

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
