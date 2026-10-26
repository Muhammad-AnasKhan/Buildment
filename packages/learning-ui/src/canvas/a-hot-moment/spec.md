---
artifact: canvas-spec
course: one-percent-better
chapter: 11.02-truth-thanks-forgiveness-and-anger
slug: a-hot-moment
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: An angry meeting

## Teaching claim
Good character in a hard moment is a sequence of small sourced actions: sit, seek refuge, speak truthfully and gently, apologise for your part, forgive, and thank.

## Why a canvas
Good character shows most in hard moments. One angry meeting tests truth, anger control, apology and forgiveness all at once. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Usman, The team.
- Steps: 1. Unfair blame; 2. Control first; 3. Truth, gently; 4. Apologise for your part; 5. Forgive; 6. Thank people.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 3:134, Sahih Muslim 2588, Sahih al-Bukhari 3282, Sahih al-Bukhari 6094, Sahih al-Bukhari 6114, Sunan Abi Dawud 4811).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through one tense meeting and see the sourced action at each moment.
- Try this:
  1. Before step 2, predict: what does the Sunnah call real strength?
  2. Which step would be hardest for you in a moment like this?
- Limits of the model: Forgiving does not mean accepting continued harm; where there is real wrong, seek fair help. This canvas shows a workplace conflict; the same steps apply at home.

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
