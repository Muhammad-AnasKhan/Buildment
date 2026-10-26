---
artifact: canvas-spec
course: one-percent-better
chapter: 01.02-small-and-steady
slug: one-percent-a-day
version: 1
owner: interaction-designer
renderer: slider (HTML controls, bars)
---

# Canvas spec: 1% a day, with real days in it

## Teaching claim
Small daily steps add up slowly at first and a lot over a year, and one slip day a week does not cancel the good days. This is the arithmetic behind James Clear's "1% better every day" picture, and it supports the Sunnah's teaching that the most beloved deeds are the most consistent, even if small (Sahih al-Bukhari 6465).

## Why a canvas
Learners have usually seen the "x37" number. What they have not seen is what real weeks, with slip days, do to it. Moving the slip days slider shows that the habit survives bad days, which is the course's main message against all-or-nothing thinking.

## Model
- Inputs: daily step p (0.5% to 2%, step 0.5, default 1), days n (30 to 365, step 5, default 365), slip days a week s (0 to 3, default 0).
- Slip days over n days: round(n x s / 7); the rest are good days.
- Outputs: steady (1 + p)^n, with slips (1 + p)^good x (1 - p)^slip, backwards (1 - p)^n, and the start (x1.00).
- Defaults: x37.8 steady, x0.03 backwards. One slip a week: x13.4. Three slips a week: x1.67. Thirty days: x1.35.
- Assumptions: each good day adds the same percentage and each slip takes the same amount away.
- Limitations: as in `limits`. It never models faith, reward or the worth of a deed.

## Rendering
- Primary: the shared slider renderer, three stats and four bars on one scale.
- Static fallback: chapter 1.2 gives the same numbers in prose and a mermaid diagram of Hamza's one-habit-a-week ladder.

## Controls
Three sliders. Labels at most 28 characters.

## Copy
- What this shows: where small daily steps add up to, with slip days included.
- Try this: as in `tryThis` (defaults, one slip day, 30 days, three slip days).
- What changed: names the input that moved and the new level with slip days.
- Limits of the model: as in `limits`.

## Edge cases
Inputs outside the range, or not numbers, snap to the nearest allowed value. The backwards level at 2% over 365 days is about x0.0006 and displays as x0.00.

## Accessibility
Shared slider keyboard support; `summary` reads the whole result in one sentence; tone on bars always has a text value.

## Acceptance criteria
- [ ] The claim is testable (the quiz after the canvas asks what one slip day a week does).
- [ ] The model is tested (frontend/tests/unit/canvas/one-percent-a-day.test.ts and the registry corner tests).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists.
