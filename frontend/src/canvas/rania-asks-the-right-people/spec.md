---
artifact: canvas-spec
course: faith-and-resilience
chapter: 05.03-shura
slug: rania-asks-the-right-people
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Rania asks the right people

- **Slug:** `rania-asks-the-right-people`
- **Export:** `raniaAsksTheRightPeople` in `data.ts`

## Teaching claim
Ask each person what they know: family about family needs, a mentor about the career, someone inside about the work. A vote of many people adds opinions; asking the right person adds knowledge. You still decide.

## Why a canvas
In prose, Rania's three conversations read as one list of advice. Lanes make it visible that each answer comes from a different person and carries something only that person knew. Stepping through also puts the "family vote" first, so the learner can compare it with the targeted questions that follow.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the active arrow, the step note, chips and outcome badge.
- Rule: four lanes (Rania, her mother, Reem, people inside the work). Nine steps: a warning loop (the group vote), a loop (write questions), three question-and-answer pairs, a final loop (she decides).
- Facts carried from the chapter: Muath can help Jana on two evenings; startup calls now on two evenings at 18:00; the startup renewed two of its three contractors last year; NGO work is steady with little learning; Rania's updated totals are NGO 39, startup 38 (free evenings for the startup from 2 to 3: 36 + 2 = 38).
- Assumptions: each person answers honestly and within their knowledge.
- Limitations: real consultation is longer and people disagree; the canvas does not choose an offer.

## Rendering
- Primary: the shared sequence renderer.
- Why this renderer: the claim is about who is asked what, which is a message between actors.
- Controls: shared stepper (Back, Next, Play, step chips).
- Static fallback: the three conversations are written out in chapter 5.3 before and after the canvas.

## Controls
Shared stepper only. No numeric inputs: the claim is about whom to ask, not about quantities.

## Visualisation
Four lanes and nine numbered arrows. Tone: warn on the group vote (with a text badge), good on answers that add new facts and on the final decision. Every arrow label is 18 characters or fewer.

## Copy
- What this shows: Rania's consultation, one person and one question at a time.
- Try this:
  1. Predict whether the vote or the three targeted questions will help more.
  2. Name what each person knew that nobody else did.
  3. Why does Reem answer with questions?
- What changed: each step note names the new fact or the care the answer brought.
- Limits of the model: as in `limits`.

## Edge cases
Loops on Rania's lane (steps 1, 2 and 9) have no second actor. Long notes stay plain text. "Inside the work" is one lane for two people (Samah and Jumana) to keep to four lanes on a phone.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` describes the whole flow for screen readers; tone is always paired with a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks whom to ask about what in a new case).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 5.3).
- [x] No reward, faith or decree is measured.

## Build plan
`frontend/src/canvas/rania-asks-the-right-people/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
