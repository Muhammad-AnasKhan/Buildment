---
artifact: canvas-spec
course: one-percent-better
chapter: 09.04-gratitude-dua-and-the-akhirah
slug: living-with-allah
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A day lived with Allah

## Teaching claim
Daily gratitude, turning to Allah in every need, quick tawbah and remembering the akhirah keep the heart connected to Allah through an ordinary day.

## Why a canvas
A relationship with Allah lives in small daily words: Alhamdulillah for each blessing, dua in every need, istighfar and tawbah after mistakes, and remembering where the journey ends. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His day.
- Steps: 1. Alhamdulillah, out loud; 2. Ask Allah first; 3. Tawbah, quickly; 4. A brief remembrance; 5. Ask for Paradise.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 2307, Jami' at-Tirmidhi 2516, Jami' at-Tirmidhi 2572, Quran 14:7, Quran 3:135, Quran 40:60, Sahih al-Bukhari 6416).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 2 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through one ordinary day and see where gratitude, dua, tawbah and the akhirah come in.
- Try this:
  1. Before step 2, predict: when a problem comes, what does Jami' at-Tirmidhi 2516 say to do first?
  2. Name three small blessings from today you have not yet thanked Allah for.
- Limits of the model: Remembering death is meant to bring focus and hope, not fear that stops you living. If thoughts of death feel heavy or frightening for a long time, talk to someone you trust or a counsellor.

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
