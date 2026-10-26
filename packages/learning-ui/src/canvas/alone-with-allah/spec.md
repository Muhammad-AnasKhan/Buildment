---
artifact: canvas-spec
course: one-percent-better
chapter: 09.02-taqwa-and-ihsan
slug: alone-with-allah
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Alone, at 1:00

## Teaching claim
Taqwa and ihsan are built in private moments: remembering that Allah sees you, asking 'will Allah be pleased with this?', and following a slip with a good deed.

## Why a canvas
Taqwa is guarding yourself from what displeases Allah, and ihsan is worshipping Allah as if you see Him. Both are tested most when nobody else is watching. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His phone.
- Steps: 1. Nobody is watching; 2. Ihsan: as if you see Him; 3. The question; 4. He closes it; 5. If he slips.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 1987, Quran 79:40-41, Sahih al-Bukhari 50, Sunan Ibn Majah 4245).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 2 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through one late night when Hamza is alone with his phone, and see what taqwa and ihsan look like in that moment.
- Try this:
  1. Before step 3, predict: what single question does Hamza ask himself?
  2. Where in your day are you most often alone with a screen?
- Limits of the model: This shows one kind of private temptation. Taqwa covers every part of life, private and public. A slip is not the end: tawbah is always open. If a habit feels out of your control, talk to someone you trust and get practical help.

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
