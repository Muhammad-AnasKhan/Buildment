---
artifact: canvas-spec
course: one-percent-better
chapter: 08.02-wudu-through-the-day
slug: staying-in-wudu
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A day in wudu

## Teaching claim
Wudu done carefully and kept through the day is a small habit with a large reward; it is done with little water, and anger is met first with sitting and seeking refuge.

## Why a canvas
Wudu is needed for prayer, and it can also be a state you keep through the day. The Sunnah links it to sins washed away, to calm, and to sleep. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, The tap, His day.
- Steps: 1. Wudu, carefully; 2. Little water; 3. Check before leaving; 4. When anger comes; 5. Wudu before sleep.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Sahih Muslim 244, Sahih al-Bukhari 201, Sahih al-Bukhari 247, Sahih al-Bukhari 3282, Sunan Abi Dawud 4782, Sunan Ibn Majah 277).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza through a day in which he tries to stay in wudu, and see each step with its source.
- Try this:
  1. Before step 4, predict: what is the first thing the Sunnah tells an angry person to do with his body?
  2. Which time of your day is easiest for keeping wudu?
- Limits of the model: A popular hadith 'make wudu when angry' (Sunan Abi Dawud 4784) is graded weak, so this course uses sitting and seeking refuge, which are sound. A hadith against wasting water even at a flowing river (Sunan Ibn Majah 425) is also weak; the Prophet's own small measure (Sahih al-Bukhari 201) is the sound guide. What breaks wudu is fiqh: ask your scholar.

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
