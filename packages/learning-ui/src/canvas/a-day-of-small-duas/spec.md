---
artifact: canvas-spec
course: one-percent-better
chapter: 07.02-from-waking-to-the-front-door
slug: a-day-of-small-duas
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A morning of small duas

## Teaching claim
Each ordinary moment of the morning has a short sourced dua, and the moment itself is the cue, so these habits need no reminders once learned.

## Why a canvas
Ordinary moments, waking, the washroom, getting dressed, leaving the house, entering the mosque, coming home, each have a short word from the Sunnah. Together they turn a routine morning into remembrance. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Hamza, Home, Outside.
- Steps: 1. On waking; 2. Entering and leaving the washroom; 3. Getting dressed; 4. Leaving the house; 5. Entering and leaving the mosque; 6. Coming home.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 7, Quran 24:61, Sahih Muslim 2018, Sahih Muslim 713, Sahih al-Bukhari 142, Sahih al-Bukhari 168, Sahih al-Bukhari 245, Sahih al-Bukhari 6312, Sunan Abi Dawud 4023, Sunan Abi Dawud 5095).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow Hamza from waking to the mosque and back, and see the short dua that belongs to each moment.
- Try this:
  1. Before step 3, predict: is there one dua for the whole morning, or a short one for each moment?
  2. Pick the moment in this list that happens to you most often. That is your easiest first dua.
- Limits of the model: These are short, sound duas for each moment; the books of adhkar contain more. A popular specific dua for entering the home (Sunan Abi Dawud 5096) is graded weak, so this course uses Bismillah and the salam, which are sound. Learn the Arabic pronunciation from a teacher.

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
