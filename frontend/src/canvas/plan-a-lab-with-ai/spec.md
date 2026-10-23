---
artifact: canvas-spec
course: build-with-ai
chapter: 04.03-plan-a-lab-with-ai
slug: plan-a-lab-with-ai
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Planning lab day 1 with an AI chat

## Teaching claim
Ask an AI chat for a structured lab plan with your goal, time, level, tools and what to break; then cut it to your time and check each command against the official docs and each package on the official package site. In this plan one command is out of date and one package does not exist, and the AI's break idea is worth keeping.

## Why a canvas
The habit is an order of checks across four sources: you, the AI, the docs and the package site. Lanes make it visible who supplies what. Stepping through lets the learner decide whether to keep the AI's break idea before seeing the cut plan, so the canvas does not only say "distrust the AI".

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: four lanes (Yara, Chat assistant, Docker docs, Package site); seven steps: ask with five facts, a 75-minute plan, cut to 40, check commands in the docs, look up the package, ask the AI to fix the command, save the plan and the prompt.
- Fixed data (as in chapter 4.3): AI plan study 15, build 40, break 10, write 10 = 75 minutes; cut plan study 10, build 15, break 5, write 10 = 40 minutes; old command `docker-compose up -d`, current `docker compose up -d`; made-up package `shortlink-cache-helper`.
- Source for the command: Docker's documentation, checked 2026-10-24. Compose v1 (2014) is invoked with `docker-compose`; the supported versions (v2 and v5) are invoked with `docker compose`. The top-level `version` element is obsolete and only produces a warning.
- Assumptions: one out-of-date command and one made-up package, labelled in `limits` as this example's.
- Limitations: a real plan may have no mistakes, or several.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are 15 characters or fewer, and every label was checked to stay inside the picture in both layouts with the registry geometry.
- Static fallback: chapter 4.3's worked example reads the same plan with the same three questions before the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Four lanes, one arrow per step. Tones: warn on the 75-minute plan and the out-of-date command, bad on the package that does not exist, good on the cut and the saved plan, each with a text badge.

## Copy
- What this shows: an AI draft passing through your time and two official sources.
- Try this: 1. Before step 3, decide whether to keep the AI's break idea (matches the chapter's predict). 2. Which parts could only Yara judge, and which could only the official sites check?
- What changed: each step note says what was kept, cut or found.
- Limits of the model: as in `limits`.

## Edge cases
Loop steps on Yara's lane (cut, save) carry outcomes. The step back to the AI (fix the command) has no tone: it is ordinary use of the tool.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole planning flow for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quizzes after the canvas ask what to do with a suspicious package and which request gives a useful plan).
- [x] The model is tested (registry consistency and label-fit tests; checked locally with the registry geometry).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (worked example in 4.3).

## Build plan
`frontend/src/canvas/plan-a-lab-with-ai/data.ts`, export `planALabWithAi`, to be registered in `frontend/src/canvas/registry.ts` and the slug lists by the orchestrator; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
