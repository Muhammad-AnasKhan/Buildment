---
artifact: canvas-spec
course: faith-and-resilience
chapter: 07.02-serving-others
slug: help-passes-on
version: 2
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Where does the help go?

## Teaching claim
Help passes on from person to person; the return is with Allah (Sahih Muslim 2699), not with the person you helped, so you can help again even when nothing comes back.

## Why a canvas
The point is where help travels. In prose the chain reads as a list of favours. Stepping through it lane by lane lets the learner watch each act leave one person and arrive at another. The learner predicts whether someone with almost nothing can still give (step 2), notices that help reaches Rania from a person she did not help (step 4), and sees Ahmad help again with nothing returned (step 6).

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the active arrow between two lanes, the step note, the outcome badge and chips.
- Rule: four lanes (Rania, Khalil, Ahmad, Mariam); six steps. Steps 1 to 4 pass one act each around the circle (Rania to Khalil, Khalil to Ahmad, Ahmad to Mariam, Mariam to Rania). Step 5 is Khalil thanking Rania. Step 6 is Ahmad, who has received nothing back, helping Khalil again.
- Assumptions: one month, one circle, small acts only. The names and facts match chapters 7.1 and 7.2 exactly (the job lead, 30 minutes at the uncle's shop, two broken links, the CV layout, the report, the Saturday notes as a voice note).
- Limitations: the return often does not come through people, and the learner may never see it. The canvas shows people and acts only; it never shows or measures reward (writer pack, section 6).

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are 16 characters or fewer ("edits her report" is the longest).
- No Arabic script and no brand names in any text.
- Static fallback: chapter 7.2 tells the same chain in prose right after the canvas, including Ahmad's last step.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about where help travels, not about amounts.

## Visualisation
Four lanes and one arrow per step. No success or failure tone: the canvas does not mark help "coming back" as a win. Step 6 carries the neutral text badge "helps again".

## Copy
- What this shows: small acts of help moving around a circle of friends, with the return left to Allah.
- Try this: 1. Check the chapter's prediction at step 2 (can Khalil give anything?). 2. At step 6, why does Ahmad help again with nothing returned?
- What changed: each step note names who helped whom, with what, and how long it took.
- Limits of the model: as in `limits`.

## Edge cases
Steps 5 and 6 run right to left (Khalil to Rania, Ahmad to Khalil). Actor subtitles are kept short ("English graduate" is the longest).

## Accessibility
Shared stepper keyboard support and focus ring; `summary` tells the whole chain for screen readers; the one badge is text.

## Acceptance criteria
- [ ] The claim is testable (the second quiz item in 7.2 transfers small, steady help to a new case).
- [ ] The model is tested (registry consistency and label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before (can Khalil serve with almost nothing?), transfer check after.
- [ ] Reader fallback exists (prose in 7.2).

## Build plan
`packages/learning-ui/src/canvas/help-passes-on/data.ts` (export `helpPassesOn`), registered in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
