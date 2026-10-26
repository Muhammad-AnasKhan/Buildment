---
artifact: canvas-spec
course: one-percent-better
chapter: 11.03-rights-friends-and-humour
slug: rights-friends-humour
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A borrowed charger, a joke and a friend

## Teaching claim
Respecting others' rights, returning what you borrow, seeking pardon for wrongs, choosing good friends and keeping humour true and kind are daily habits with clear sources.

## Why a canvas
Every person has rights over us: their property, their honour, their feelings. Friends shape us, and humour has limits. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, Classmates, Friends.
- Steps: 1. Return what you borrow; 2. Seek pardon today; 3. Humour that is true; 4. Not at someone's cost; 5. Good company.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 1990, Jami' at-Tirmidhi 2378, Quran 4:58, Sahih al-Bukhari 2101, Sahih al-Bukhari 2442, Sahih al-Bukhari 2449, Sunan Abi Dawud 3565, Sunan Abi Dawud 4990).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Musa through a week at school and see the sourced rule for each moment.
- Try this:
  1. Before step 2, predict: when does the hadith say to seek pardon from someone you wronged?
  2. Is there anything you have borrowed and not yet returned?
- Limits of the model: The bankrupt person in Sahih Muslim 2581 shows how serious others' rights are; this canvas shows small daily cases. Bigger disputes may need a trusted adult or scholar to help settle them.

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
