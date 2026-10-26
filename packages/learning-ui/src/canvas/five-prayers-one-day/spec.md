---
artifact: canvas-spec
course: one-percent-better
chapter: 02.03-a-plan-for-each-prayer
slug: five-prayers-one-day
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Five prayers, five plans

## Teaching claim
Each prayer has its own obstacle and needs its own if-then plan; Fajr is won the night before, by sleep and preparation.

## Why a canvas
Each of the five prayers falls in a different part of the day, so each one needs its own cue and its own plan. Fajr is planned the night before. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Home and mosque, Office.
- Steps: 1. Fajr starts the night before; 2. Fajr: if the alarm, then feet on the floor; 3. Dhuhr: a calendar block; 4. Asr: the one that slips; 5. Maghrib: the short window; 6. Isha links to tomorrow's Fajr.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 2:238, Sahih Muslim 656, Sahih al-Bukhari 1142).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza through one office day and see the cue and the plan behind each prayer.
- Try this:
  1. Before step 1, predict: which prayer does this plan start with, and why is it not Fajr's alarm?
  2. Match each prayer to its obstacle: sleep, meetings, the busiest hour, a short window, the phone at night.
- Limits of the model: This shows one office day for one man who lives near a mosque. Your prayers, times and obstacles will differ. Women, students and remote workers adapt the same plan to home, campus or a shared room. Prayer times change through the year, so plans need checking each month.

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
