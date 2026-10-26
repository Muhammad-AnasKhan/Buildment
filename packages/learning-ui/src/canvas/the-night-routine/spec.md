---
artifact: canvas-spec
course: one-percent-better
chapter: 06.04-the-night-routine
slug: the-night-routine
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: The last five minutes

## Teaching claim
A short Sunnah sequence before sleep, wudu, the right side and the sleep duas, plus a one-minute look back at the day, closes the day with Allah and prepares tomorrow.

## Why a canvas
Before sleep the Sunnah gives a short sequence: wudu, lying on the right side, the dua for sleep, and a moment to look back at the day. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His bed.
- Steps: 1. Wudu before bed; 2. The right side, and al-Bara's dua; 3. In Your name I die and live; 4. A one-minute look back; 5. Forgiveness, then sleep.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 59:18, Sahih al-Bukhari 247, Sahih al-Bukhari 6312).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 2 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through Hamza's last five minutes before sleep and see each Sunnah step with its source.
- Try this:
  1. Before step 4, predict: should the look back be long and detailed, or short enough to do every night?
  2. Which of the four questions is hardest for you to answer honestly?
- Limits of the model: This is a short version for every night. Longer duas and adhkar before sleep exist in the books of adhkar. The look back is for honest planning, not self-punishment; if guilt keeps you awake for long, talk to someone you trust.

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
