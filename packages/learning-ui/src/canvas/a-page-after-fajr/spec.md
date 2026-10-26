---
artifact: canvas-spec
course: one-percent-better
chapter: 03.02-a-little-quran-every-day
slug: a-page-after-fajr
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: One page after Fajr

## Teaching claim
A small, fixed daily portion at a fixed time, kept up, beats a big portion now and then; and the reader who struggles has two rewards (Sahih Muslim 798).

## Why a canvas
Daily Quran recitation (tilawat) grows from a small, fixed amount at a fixed time. Allah says: recite what is easy of the Quran (Quran 73:20). Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His mushaf, His teacher.
- Steps: 1. Week 1: one page, same place; 2. He stumbles on words; 3. Week 2: a weekly check; 4. Week 4: two pages; 5. Hard days: the minimum.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 2910, Quran 73:20, Sahih Muslim 798, Sahih al-Bukhari 5027).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza's Quran habit over five weeks and see how a small portion grows without breaking.
- Try this:
  1. Before step 4, predict: when should Hamza add the second page, when he feels inspired or when the first page feels easy?
  2. Find the step that keeps the habit alive on a bad day. What is its size?
- Limits of the model: One page is Hamza's start; yours may be five verses or a whole juz. The amount that is 'easy' differs from person to person. Learning correct recitation (tajweed) needs a real teacher; this canvas does not teach it.

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
