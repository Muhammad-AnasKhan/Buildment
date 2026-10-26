---
artifact: canvas-spec
course: one-percent-better
chapter: 15.02-a-tracker-that-helps
slug: weekly-review
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: The Friday review

## Teaching claim
Counting days done, not a streak, and reviewing once a week to change one thing, keeps a long list of habits growing without shame.

## Why a canvas
A tracker should help you see patterns and restart quickly, not punish you or feed showing off. A weekly review on one fixed day turns ticks into decisions. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His tracker, Next week.
- Steps: 1. Count, do not judge; 2. Find the habit with the most misses; 3. Change one thing; 4. Ready for the next habit?; 5. Renew the intention.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih al-Bukhari 1).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through Hamza's weekly review and see how he turns a week of ticks into one decision.
- Try this:
  1. Before step 4, predict: should Hamza add next week's new habit even though Fajr was 4 of 7?
  2. Look at step 2. What would Hamza have missed if he had only counted, without writing a few words on each missed day?
- Limits of the model: The 5-of-7 rule is Hamza's own rule, not a teaching of the sources; pick a rule that fits you. Obligatory prayers are not optional habits to drop when the count is low; the review only helps you plan how to keep them. Keep the tracker private.

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
