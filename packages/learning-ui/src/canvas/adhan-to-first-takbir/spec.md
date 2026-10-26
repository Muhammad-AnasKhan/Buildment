---
artifact: canvas-spec
course: one-percent-better
chapter: 02.02-the-first-takbir
slug: adhan-to-first-takbir
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: From the adhan to the first takbir

## Teaching claim
The first takbir is caught by what you do at the adhan, not at the iqamah: leave early, make wudu, walk with calm, and you are in the row before the imam begins (Sahih al-Bukhari 636 and 722).

## Why a canvas
Catching the first takbir (takbir al-ula, in Urdu takbir-e-ula) means being in the row when the imam says 'Allahu akbar' to start the prayer, and saying your own takbir right after him. The way to catch it is leaving early, not running. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, The mosque, The imam.
- Steps: 1. The adhan is the real start; 2. Wudu before he leaves; 3. Walking, not running; 4. In the row before the iqamah; 5. The first takbir; 6. On a late day.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 251, Sahih al-Bukhari 636, Sahih al-Bukhari 659).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through one Maghrib, from the adhan to the first takbir, and see where the first takbir is really won or lost.
- Try this:
  1. Before step 3, predict: is it better to run the last 100 metres to catch the takbir, or to walk?
  2. Find the step where the first takbir was really decided. Is it at the iqamah, or earlier?
- Limits of the model: This shows one man, one prayer and one mosque six minutes away. Times between adhan and iqamah differ from mosque to mosque. Women and anyone who prays at home or at work have their own version of this habit in chapter 2.2. Questions about who must pray in the mosque are fiqh: ask a scholar you trust.

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
