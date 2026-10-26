---
artifact: canvas-spec
course: one-percent-better
chapter: 04.03-making-adhkar-stick
slug: adhkar-on-the-way
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Adhkar on the way

## Teaching claim
Adhkar stick best when tied to a moment that happens every day and needs no extra time, with a card or a bookmark until they are learned by heart.

## Why a canvas
Adhkar need no book, no light and no internet once you know them. That makes them easy to tie to moments you already have: the walk home from Fajr, the commute, the minutes after Asr. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His card, The walk.
- Steps: 1. A card in his pocket; 2. Morning: the walk back from Fajr; 3. Evening: after Asr; 4. When the words go; 5. A busy day: the minimum.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 3:191, Sahih al-Bukhari 6407).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza's day and see where his adhkar fit without adding time.
- Try this:
  1. Before step 2, predict: does Hamza need to find ten free minutes for his morning adhkar?
  2. Name a six-minute moment in your own day that happens every day and needs your hands but not your mind.
- Limits of the model: This shows one man's walk to the mosque. Your moment may be making tea, a bus ride or folding the prayer mat. Some adhkar are best said with full attention, and saying them while driving should never take attention from the road.

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
