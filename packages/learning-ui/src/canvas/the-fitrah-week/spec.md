---
artifact: canvas-spec
course: one-percent-better
chapter: 08.03-cleanliness-and-the-fitrah
slug: the-fitrah-week
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Clean, on a rhythm

## Teaching claim
Cleanliness is half of faith, and its habits have clear rhythms: daily care, a bath at least every week, the fitrah practices within forty nights, and clean, simple clothes.

## Why a canvas
Personal hygiene in Islam is part of faith. Some habits are daily, some weekly, and some have a limit of forty nights. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, Daily, Weekly.
- Steps: 1. Teeth, every day; 2. A bath, at least weekly; 3. The fitrah, within forty nights; 4. Clean clothes, not show; 5. Shoes and the right side; 6. Why it matters.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 223, Sahih Muslim 258, Sahih Muslim 91, Sahih al-Bukhari 168, Sahih al-Bukhari 5889, Sahih al-Bukhari 887, Sahih al-Bukhari 898, Sunan an-Nasa'i 5).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: See which hygiene habits are daily, weekly and monthly, each with its source.
- Try this:
  1. Before step 3, predict: what is the longest the fitrah practices should be left, in nights?
  2. Which rhythm, daily or weekly, is your weakest?
- Limits of the model: This covers personal hygiene in general terms. Rulings on ghusl, purification after the toilet and similar matters are fiqh; learn them from a scholar or a reliable fiqh book for your school.

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
