---
artifact: canvas-spec
course: one-percent-better
chapter: 11.04-mercy-and-courage
slug: mercy-and-courage
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Gentle and brave in one day

## Teaching claim
Mercy and courage are both daily habits: kindness to the weak and to animals, and saying no to wrong with your hand, your tongue or at least your heart.

## Why a canvas
Mercy to the young, the old, the weak and animals, and the courage to say no to wrong, are two sides of the same character. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, The weak, Friends.
- Steps: 1. Respect the old, love the young; 2. Animals; 3. Saying no; 4. When someone is wronged; 5. Help the wronged.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 1919, Jami' at-Tirmidhi 1924, Sahih Muslim 49, Sahih al-Bukhari 2443, Sahih al-Bukhari 2466, Sahih al-Bukhari 3318).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one day and see where mercy and courage are needed, each with its source.
- Try this:
  1. Before step 4, predict: what is the weakest level of responding to a wrong in Sahih Muslim 49?
  2. Where could you show mercy to someone weaker this week?
- Limits of the model: Changing a wrong 'with the hand' is for those with authority and where it causes no greater harm; for most people, especially young people, the safe way is the tongue: telling a responsible adult. Some animals may be dealt with for harm; the default is mercy (Sunan Abi Dawud 5267 forbids killing ants and some birds without cause).

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
