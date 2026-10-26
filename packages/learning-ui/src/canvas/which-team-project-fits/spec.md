---
artifact: canvas-spec
course: build-with-ai
chapter: 08.04-go-deep-with-a-team
slug: which-team-project-fits
version: 1
owner: interaction-designer
renderer: custom, on the reusable Context picker primitive (primitives/context-picker.tsx, model models/context-picker.ts)
---

# Canvas spec: Which team project fits?

## Teaching claim
Which time-boxed team project to read about first depends on the fellow's hours, whether a stipend is needed, and whether open source is new. Each program has its own length, pay, eligibility and AI rule, so every verdict ends with "read its rules page". A community project you join yourself is always an option.

## Why a canvas
A table of programs is read once and forgotten. Changing one fact about a fellow and watching the pick move shows that the answer depends on the fellow, and that the same fellow gets another answer at 10 hours than at 30. The table itself stays in the chapter's fold.

## Model
- Inputs: one choice per factor. Hours a week: under 10, about 15, about 30. Need a stipend: yes, no. Open source so far: new to it, contributed. Default (`start`): about 15 hours, stipend needed, new to it.
- Outputs: the option that fits (`pick`), the one-line reason, the index of the rule that fired.
- Rule: `resolveContext`; the first rule whose facts all match wins. Rules, in order (checked 2026-10-25 on the programs' own pages):
  1. Stipend needed and has contributed: LFX Mentorship. GSoC is "not for experienced open source developers" (B70); LFX lists no experience limit and pays a stipend (B72, B73).
  2. No stipend needed: a community project you join yourself (no application, no stipend, you set the pace).
  3. Stipend needed, new, about 30 hours: Outreachy, 30 hours a week for 13 weeks, $7,000 in the December 2026 round (B74). The reason sends the fellow to check who qualifies.
  4. Stipend needed, new, about 15 hours: GSoC. A 175-hour project over the common 12 weeks is 175 / 12 = 14.6, about 15 hours a week (B70).
  5. Stipend needed, new, under 10 hours: GSoC. A 90-hour project over 12 weeks is 90 / 12 = 7.5, about 8 hours a week (B70).
  Fallback: a community project.
- All 12 contexts are covered (3 hours x 2 stipend x 2 experience): rule 1 covers 3, rule 2 covers 6, rules 3 to 5 cover 3. Every option is reachable, so `checkContextConfig` passes.
- Assumptions: GSoC projects run 12 weeks, as about 75% do; programs are open to the fellow.
- Limitations: eligibility is not a model. Outreachy asks about under-representation, GSoC and LFX apply country and sanctions rules, dates change every year, and the next rounds had no dates on the pages read (U7). The LFX amount for Palestine was not found (U8), and how stipends reach a fellow in Gaza is not confirmed (U9). Hacktoberfest is left out: in 2026 it does not count pull requests (B69).

## Rendering
The shared Context picker primitive: question chip, three factor rows of pills, four option cards, a ring with a "Fits" pill, and a note banner with the reason. The question has 39 characters; option labels are at most 9 characters; each reason is at most 88 characters.

## Controls
The pills set the context. Reset returns to `start`.

## Visualisation
Four option cards: GSoC (90 to 350 hours), LFX (set by project), Outreachy (13 weeks, 30 hours a week), Community (you join yourself). The accent ring marks the pick.

## Copy
- What this shows: the team project to read about first for one fellow's facts.
- Try this: change the hours with the stipend set to yes, then change the stipend to no.
- What changed: the ring moves and the reason changes.
- Limits: as in `limits`.

## Edge cases
- Every reason ends with a pointer to the rules page (for a community project, its contributing page).
- No reason claims a fellow is eligible. Pay amounts are not on the canvas; the chapter's fold has the dated table.

## Accessibility
Every pill is keyboard reachable with a visible focus ring and the name "Factor: Choice". An `aria-live="polite"` line announces the best fit and the reason. The ring moves with a 300 ms transition that is off under `prefers-reduced-motion`.

## Acceptance criteria
- [x] The claim is testable: the quick check after the chapter transfers it to a new fellow with stated hours.
- [x] The model is tested by `checkContextConfig` and the shared Context picker tests.
- [x] The design is legible at 375 px: three factors, four options.
- [x] Prediction before (the chapter's predict about hours), transfer check after.
- [x] Reader fallback: the chapter's dated rules table and its prose.

## Build plan
`packages/learning-ui/src/canvas/which-team-project-fits/data.ts`, exports `WHICH_TEAM_PROJECT_FITS` and `whichTeamProjectFits` (CustomCanvasSpec). To be registered by the orchestrator.

## Placement
Chapter 8.4, beat 2 ("Same fellow, different facts"), after the predict.
