---
artifact: canvas-spec
course: faith-and-resilience
chapter: 06.02-intention
slug: same-work-two-intentions
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: The same day, two intentions

- **Slug:** `same-work-two-intentions`
- **Export:** `sameWorkTwoIntentions` in `data.ts`

## Teaching claim
The same day of work, done with a good intention, becomes worship; the work does not change, the aim does.

## Why a canvas
In prose, "intention changes the deed" stays abstract. Stepping through one concrete working day, with both aims written beside every step, lets the learner see that each task, message, payment and spending is identical, and that only what the day is for differs. The power-cut step makes the difference sharp: one aim loses the afternoon, the other does not.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow, the step note, chips and outcome badge.
- Rule: four lanes (Tariq, the work, the client, his family). Seven steps: set the aim, build the form, honest update, power cut, payment, money for the household, renew the aim. Every note reads the same step under aim 1 ("finish the list and get paid") and aim 2 ("provide for my family, serve this client well, please Allah").
- Sources: Sahih al-Bukhari 1 (actions by intentions), Sahih al-Bukhari 56 (spending on family seeking Allah's pleasure is rewarded; only that part), Sahih Muslim 130 (intending a good deed that is not done is written as a good deed; cited without numbers, as the dossier requires), Sahih Muslim 1955 (ihsan, referred to chapter 6.3).
- Facts carried from the chapter: the language school's $300 fee, first half $150; power cut at 15:00.
- Assumptions: the tasks are held identical under both aims on purpose.
- Limitations: does not measure reward or sincerity; real intentions also change choices (covered in prose).

## Rendering
- Primary: the shared sequence renderer.
- Why this renderer: one actor's day moving between work, client and family is a flow between lanes.
- Controls: shared stepper.
- Static fallback: chapter 6.2 tells the same day in prose and in a mermaid diagram.

## Controls
Shared stepper only. No numeric inputs: no number may be attached to reward.

## Visualisation
Four lanes and seven arrows. Tone: warn on the power cut (badge "work stops"), good on the payment and on the evening step (badge "worship"). Arrow labels are 14 characters or fewer.

## Copy
- What this shows: one working day read under two aims.
- Try this:
  1. Predict whether the good intended for the afternoon is lost when the power cut stops the work.
  2. Compare what the power cut costs under each aim.
  3. Write one step with your own aim beside it.
- What changed: each step note names what the step is under aim 1 and under aim 2.
- Limits of the model: as in `limits`.

## Edge cases
Three loops on Tariq's lane (steps 1, 4 and 7). The client-to-Tariq payment arrow runs right to left. Notes are plain text with no numbers on reward.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` describes the day and both aims for screen readers; tone is always paired with a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quiz asks about work that "does not count" and a plan stopped by a power cut).
- [ ] The model is tested (registry consistency and label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose and diagram in 6.2).
- [ ] No reward, faith or decree is measured; no reward numbers appear.

## Build plan
`packages/learning-ui/src/canvas/same-work-two-intentions/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
