---
artifact: canvas-spec
course: faith-and-resilience
chapter: 07.02-serving-others
slug: help-passes-on
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Where does the help go?

## Teaching claim
Help passed between people in a circle comes back; Allah helps the one who helps (Sahih Muslim 2699), and the return does not have to come from the person you helped, so there is no need to keep score.

## Why a canvas
The point is where the help travels. In prose the chain reads as a list of favours. Stepping through it lane by lane lets the learner watch each act leave one person and arrive at another, predict whether someone with almost nothing can still give (step 2), and notice at step 4 that help reaches Rania from a person she did not help.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the active arrow between two lanes, the step note, the outcome badge and chips.
- Rule: four lanes (Rania, Khalil, Ahmad, Mariam); six steps. Steps 1 to 4 pass one act each around the circle (Rania to Khalil, Khalil to Ahmad, Ahmad to Mariam, Mariam to Rania). Step 5 is a loop on Rania naming the hadith. Step 6 is Khalil thanking Rania.
- Assumptions: one month, one circle, small acts only. The names and facts match chapters 7.1 and 7.2 exactly (the job lead, 30 minutes at the uncle's shop, two broken links, the CV layout, the report).
- Limitations: help does not always come back through people, and often the learner never sees where it came from. The canvas shows people and acts only; it never shows or measures reward (writer pack, section 6).

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are 16 characters or fewer ("edits her report" is the longest).
- No Arabic script and no brand names in any text.
- Static fallback: chapter 7.2 tells the same chain in prose right after the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about where help travels, not about amounts.

## Visualisation
Four lanes and one arrow per step. Tone `good` with the text badge "help came back" on step 4 only; every other step uses the default accent.

## Copy
- What this shows: four small acts of help moving around a circle of friends.
- Try this: 1. Check the prediction from the chapter at step 2 (can Khalil give anything?). 2. At step 4, from whom did help reach Rania?
- What changed: each step note names who helped whom, with what, and how long it took.
- Limits of the model: as in `limits`.

## Edge cases
Step 5 is a loop on Rania's lane (from equals to). Step 6 runs right to left, from Khalil back to Rania. Actor subtitles are kept short ("English graduate" is the longest).

## Accessibility
Shared stepper keyboard support and focus ring; `summary` tells the whole chain for screen readers; the one tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the first quiz item in 7.2 asks what Sahih Muslim 2699 says about help that is not returned, in a new case).
- [x] The model is tested (registry consistency and label-fit tests, once the slug is registered).
- [x] The design is simple and legible.
- [x] Prediction before (can Khalil serve with almost nothing?), transfer check after.
- [x] Reader fallback exists (prose in 7.2).

## Build plan
`frontend/src/canvas/help-passes-on/data.ts` (export `helpPassesOn`), to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
