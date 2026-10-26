---
artifact: canvas-spec
course: one-percent-better
chapter: 02.04-inside-the-prayer
slug: inside-the-prayer
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Around and inside one prayer

## Teaching claim
The minutes around and inside the prayer hold several small sourced habits, each attached to the prayer itself: answer the adhan, make wudu with care, pray the sunnah, and know what you are saying.

## Why a canvas
A prayer on time is the base. Around it the Sunnah adds small habits: answering the adhan, a careful wudu, the sunnah prayers, and attention (khushu) inside the prayer. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: The adhan, Hamza, The prayer.
- Steps: 1. Answer the adhan; 2. Wudu with care; 3. The sunnah before Dhuhr; 4. Attention inside the prayer; 5. Two after; 6. Why it matters most.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Jami' at-Tirmidhi 413, Jami' at-Tirmidhi 415, Sahih Muslim 244, Sahih Muslim 728, Sahih al-Bukhari 611, Sahih al-Bukhari 614).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Step through one Dhuhr and see the small habits that sit around and inside the obligatory prayer.
- Try this:
  1. Before step 3, predict: how many sunnah rak'ahs a day does Sahih Muslim 728 speak of?
  2. Which of these steps could you add to the prayer you already pray most steadily?
- Limits of the model: This is one man's Dhuhr. The sunnah prayers are voluntary, and details such as which are most emphasised differ between schools; ask your scholar. Khushu cannot be measured, and a distracted prayer is still a prayer: the habit is to keep returning the mind to it.

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
