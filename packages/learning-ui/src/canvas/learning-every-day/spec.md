---
artifact: canvas-spec
course: one-percent-better
chapter: 13.03-learning
slug: learning-every-day
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Something new every day

## Teaching claim
Learning grows from small daily habits: one new thing, one question, a page of a book, saying 'I don't know' honestly, and acting on what you learn.

## Why a canvas
Seeking knowledge is a path to Paradise in the Sunnah. A daily learning habit is small: something new, a question, a page, and acting on what you learn. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Musa, Books, teacher.
- Steps: 1. A daily page; 2. Ask; 3. Honest not-knowing; 4. Study on time; 5. Act on it.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 2417, Quran 17:36, Quran 20:114, Sahih Muslim 2699, Sahih al-Bukhari 50).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 2 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one learner's week and see the sourced habits that make learning steady.
- Try this:
  1. Before step 3, predict: what does Quran 17:36 say you should not do with things you do not know?
  2. What one thing did you learn this week, and how will you use it?
- Limits of the model: The popular wording 'seeking knowledge is an obligation on every Muslim' (Sunan Ibn Majah 224) is graded very weak in this chain; some scholars accept the meaning through other chains, and learning what you need for your worship is agreed to be required. This course builds the habit on Sahih Muslim 2699 and Quran 20:114.

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
