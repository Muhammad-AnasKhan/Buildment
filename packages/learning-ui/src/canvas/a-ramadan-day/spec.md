---
artifact: canvas-spec
course: one-percent-better
chapter: 14.04-ramadan
slug: a-ramadan-day
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: One Ramadan day

## Teaching claim
A Ramadan day is a cycle of sourced Sunnahs, suhoor, fasting with faith, guarding the tongue and eyes, a prompt iftar with its words, taraweeh and extra Quran and charity.

## Why a canvas
Ramadan is a yearly season that strengthens every daily habit. Its own Sunnahs, suhoor, a quick iftar, taraweeh and guarding the tongue, make one daily cycle. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, The fast, The night.
- Steps: 1. Suhoor; 2. Fasting with faith; 3. Guard the tongue; 4. A prompt iftar; 5. The night prayer; 6. The month of the Quran.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 2:183, Quran 2:185, Sahih al-Bukhari 1903, Sahih al-Bukhari 1923, Sahih al-Bukhari 1957, Sahih al-Bukhari 37, Sahih al-Bukhari 38, Sunan Abi Dawud 2357).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through one Ramadan day and see each Sunnah with its source.
- Try this:
  1. Before step 4, predict: should iftar be delayed to be safe, or taken promptly at sunset?
  2. Which daily habit from this course will Ramadan grow most for you?
- Limits of the model: Rulings on what breaks the fast, who is excused and how to make up fasts are fiqh; ask your scholar. Those who are ill or travelling have allowances in the Quran (2:185).

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
