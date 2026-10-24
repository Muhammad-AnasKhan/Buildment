---
artifact: canvas-spec
course: faith-and-resilience
chapter: 01.03-life-as-a-test
slug: a-hard-week-two-readings
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: One hard week, two readings

- **Export:** `aHardWeekTwoReadings` in `data.ts`

## Teaching claim
The same hard week, read as "Allah is angry with me", leads to giving up; read as a test with a purpose, it leads to patience and good work.

## Why a canvas
The claim is a fork: one set of facts, two readings, two very different next actions. Stepping through both branches from the same starting pill makes the learner see that the week never changes, only the reading does. A static diagram shows the fork but lets the eye skip straight to the good branch.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states. The starting state "A hard week" sits in the middle of the top row. Reading 1 goes left ("Allah is angry", then "Give up" below it). Reading 2 goes right ("A test, a purpose", then "Patience" below it) and then left along the bottom row to "Good work". Six steps: the facts, reading 1 and where it leads, reading 2 and where it leads in two moves.
- Facts from chapter 1.3: ten days since the draft; follow-up unanswered; power mostly from 01:00 to 07:00; younger brother has a fever; two hours of paid work since Saturday; cousin sits with her brother for an hour each evening; alarm at 05:00; two proposals sent. Sources in notes: Quran 67:2, 29:2, 2:286 (opening clause only), 94:5 to 6, Jami' at-Tirmidhi 2398.
- Assumptions: the two readings are presented as the two the chapter names; real thoughts are mixed.
- Limitations: the canvas never explains why a hardship happens to anyone and attaches no number to reward, sin or Allah's anger. It models what each reading leads a person to do.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows. The two edges that cross rows in one column are labelled "so" (two characters), because they turn sideways on phones with about 22px between the pills. No diagonal edges.
- Static fallback: chapter 1.3 tells both readings in prose and in a worked example, and a mermaid diagram shows the fork.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about two paths from one starting point.

## Visualisation
Six labelled pills and five arrows. Tone: bad on "Give up", good on "Good work", each with a text outcome badge.

## Copy
- What this shows: one hard week, read two ways, and where each reading leads.
- Try this: 1. At step 4, check the prediction (who is tested most severely). 2. Compare step 3 and step 6: the week is the same.
- What changed: each step note says what the reading claims and what Yasmin does because of it.
- Limits of the model: as in `limits`.

## Edge cases
The first step has no edge (it shows the facts only). Two edges share the label "read as"; they sit on opposite sides of the starting pill. State names are 17 characters or fewer. No Arabic script, no brand names, no dashes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both readings for screen readers; tone always has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quiz transfers it to a new person told that hardship means anger).
- [ ] The model is tested (registry consistency and label-fit tests once registered).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose readings and worked example in 1.3).

## Build plan
`frontend/src/canvas/a-hard-week-two-readings/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
