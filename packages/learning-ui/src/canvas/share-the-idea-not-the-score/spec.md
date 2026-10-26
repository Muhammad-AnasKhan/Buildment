---
artifact: canvas-spec
course: one-percent-better
chapter: 01.03-intention-and-showing-off
slug: share-the-idea-not-the-score
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Share the idea, not the score

## Teaching claim
You can guard a deed from showing off by keeping your record private and checking your intention, and you can still spread the good by sharing the idea, which carries its own reward (Sahih Muslim 1893).

## Why a canvas
Hamza's tracker is going well, and he feels the pull to post a screenshot. Showing off (riya) is doing a deed so that people see it. The cure the sources point to is a checked intention, a private record, and sharing the way to good rather than your own score. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, His tracker, Friends' group.
- Steps: 1. A record only he sees; 2. The pull to be seen; 3. He checks his intention; 4. He shares the idea, not his ticks; 5. Praise he did not ask for; 6. He does not stop the deed.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 1893, Sahih Muslim 2642, Sahih al-Bukhari 1, Sahih al-Bukhari 1423, Sahih al-Bukhari 6499).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one week of Hamza's tracker and see where showing off could creep in, and what he does instead.
- Try this:
  1. Before step 2, predict: is the danger in doing the deed where people can see it, or in why it is done?
  2. At step 4, compare what Hamza posts with what he did not post. Which part spreads the good, and which part would only show his score?
- Limits of the model: This shows one person and one chat group. Only Allah knows what is in a heart, so never use these steps to judge whether someone else is showing off. Praying in congregation is meant to be seen and is not showing off. Where you are unsure about your own intention, renew it and ask a scholar you trust.

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
