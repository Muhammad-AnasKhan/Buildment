---
artifact: canvas-spec
course: one-percent-better
chapter: 14.02-jumuah
slug: a-friday-done-well
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A Friday done well

## Teaching claim
Friday's Sunnahs are one weekly chain: ghusl, clean clothes and fragrance, going early, sitting without stepping over people, listening in silence, and much durood.

## Why a canvas
Friday is the weekly anchor. Its Sunnahs, ghusl, clean clothes, going early, silence during the khutbah, and abundant durood, form one weekly routine. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Home, The mosque.
- Steps: 1. Ghusl and fragrance; 2. Going early; 3. Sitting with manners; 4. Silence in the khutbah; 5. Durood on Friday.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih al-Bukhari 881, Sahih al-Bukhari 883, Sahih al-Bukhari 934, Sunan Abi Dawud 1047).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza's Friday from morning to the prayer and see each Sunnah with its source.
- Try this:
  1. Before step 4, predict: is it allowed to tell someone 'be quiet' during the khutbah?
  2. Which Friday Sunnah could you add this week?
- Limits of the model: Whether Friday ghusl is obligatory or strongly recommended is a fiqh difference; follow your scholar. Women are not required to attend Jumu'ah; many of these Sunnahs, such as durood, apply to everyone.

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
