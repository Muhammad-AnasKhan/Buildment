---
artifact: canvas-spec
course: one-percent-better
chapter: 09.03-a-clean-heart
slug: cleaning-the-heart
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: When a friend is promoted

## Teaching claim
Diseases of the heart are treated with action: loving for others what you love for yourself, praying for the person you envy, and refusing pride's two signs, rejecting truth and looking down on people.

## Why a canvas
Envy, pride and hatred are sins of the heart that nobody sees. The Sunnah gives words and actions to clean them. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Bilal, Others.
- Steps: 1. The feeling; 2. He names it; 3. Dua for the person; 4. Sincere words; 5. No belittling; 6. Accepting the truth.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 2563, Sahih Muslim 91, Sahih al-Bukhari 13).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza when a colleague is promoted over him, and see how envy is met with sourced actions.
- Try this:
  1. Before step 3, predict: what does the Sunnah tell you to want for the person you envy?
  2. Who in your life is easiest for you to envy? What dua could you make for them?
- Limits of the model: Feelings come uninvited; what you do with them is the habit. This canvas does not judge feelings, only actions. Healthy ambition is not envy; wanting the same good for yourself without wishing it gone from someone else is allowed.

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
