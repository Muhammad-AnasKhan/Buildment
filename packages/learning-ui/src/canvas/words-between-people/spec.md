---
artifact: canvas-spec
course: one-percent-better
chapter: 07.04-salam-sneezing-and-visiting-the-sick
slug: words-between-people
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Words between people

## Teaching claim
Short sourced words between people, salam, the sneeze reply and the dua for the sick, together with daily durood and istighfar, build love and remembrance in ordinary days.

## Why a canvas
Some daily duas are said between people: the salam, the reply to a sneeze, the words for a sick friend. Others, durood and istighfar, belong to every hour. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Colleagues, His uncle.
- Steps: 1. Spread the salam; 2. A colleague sneezes; 3. Visiting the sick; 4. Durood through the day; 5. Istighfar through the day.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 3372, Sahih Muslim 2568, Sahih Muslim 408, Sahih Muslim 54, Sahih al-Bukhari 5675, Sahih al-Bukhari 6224, Sahih al-Bukhari 6307).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one office day and see the short words the Sunnah gives for moments with other people.
- Try this:
  1. Before step 2, predict: how many lines does the sneeze exchange have, and who says each?
  2. Who could you visit or call this week who is unwell?
- Limits of the model: These are a few of the words between people in the Sunnah. A popular wording, 'dua is the marrow of worship' (Jami' at-Tirmidhi 3371), is graded weak; the sound wording is 'dua is worship' (Jami' at-Tirmidhi 3372).

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
