---
artifact: canvas-spec
course: one-percent-better
chapter: 10.04-mobile-and-internet
slug: before-you-forward
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Before you forward

## Teaching claim
Verifying before forwarding, respecting privacy, filtering harmful content and setting time limits apply the Sunnah's rules for speech, sight and time to the phone.

## Why a canvas
The phone gathers every test of the tongue, the eyes and time into one device. A few planned rules handle most of it. Stepping through one person's day, one moment at a time, answers the chapter's predict before the prose teaches each part in detail.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and outcome badge.
- Lanes: Group chat, Hamza, His phone.
- Steps: 1. A shocking message; 2. Verify; 3. Not passing it on; 4. Privacy; 5. Limits and filters.
- Honorifics: the first mention of the Prophet in the canvas carries "peace be upon him".
- Assumptions: sources only from the course research dossier (Quran 49:12, Quran 49:6, Sahih Muslim 2563, Sahih al-Bukhari 6412, Sunan Abi Dawud 4992).
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 3 lanes; arrow labels are 18 characters or fewer.
- Static fallback: the chapter teaches every step in prose, and a mermaid diagram shows the same idea for a second case.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one forwarded message and one evening on the phone, and see the sourced rule for each step.
- Try this:
  1. Before step 3, predict: if Hamza cannot verify a message, should he forward it 'just in case'?
  2. Which one setting on your phone would protect you most?
- Limits of the model: Some versions of the hearsay hadith say 'enough of a lie'; the narration checked here (Sunan Abi Dawud 4992) says 'enough of a sin'. App limits and filters are tools; the habit is the choice behind them.

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
