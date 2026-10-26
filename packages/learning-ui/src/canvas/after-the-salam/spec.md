---
artifact: canvas-spec
course: one-percent-better
chapter: 05.02-after-the-salam
slug: after-the-salam
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: After the salam

## Teaching claim
The salam is a perfect cue: it happens five times a day, in the same place, and the sourced adhkar after it take about three minutes.

## Why a canvas
The adhkar after each prayer (namazon ke baad ke azkar) are the easiest habit to stack, because the cue, the salam, already happens five times a day. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: The imam, Hamza.
- Steps: 1. The cue: the salam; 2. Forgiveness, then peace; 3. Tasbih, tahmid, takbir; 4. The dua for every prayer; 5. When he must leave quickly.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 3:191, Sahih Muslim 591, Sahih Muslim 597, Sunan Abi Dawud 1522).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 2 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through the three minutes after one prayer and see the order of the adhkar and their sources.
- Try this:
  1. Before step 3, predict: how long do all of these take, said at a normal pace? Time yourself after your next prayer.
  2. Which one would you start with this week if you could add only one?
- Limits of the model: This is one common order of the sourced adhkar after the prayer; there are others in the books of adhkar, and scholars describe the order differently. It takes roughly three minutes at a normal pace, more when learning. Women and men praying at home use the same adhkar after their own salam.

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
