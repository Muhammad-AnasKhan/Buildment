---
artifact: canvas-spec
course: build-with-ai
chapter: 04.04-watch-it-run-then-break-it
slug: url-shortener-stop-a-part
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Stop one part of Qasir and watch

## Teaching claim
Breaking one part on purpose shows what it is for. With the cache stopped, and kept stopped by `restart: unless-stopped`, Qasir's links still open but every lookup goes to the database, which is slower in this lab. With the database stopped, links the cache holds still open, but a new short link cannot be saved and the app returns an error.

## Why a canvas
The order matters: one part at a time, started again before the next. Lanes show which part answers each request, so the move from source=cache to source=db is a visible change of arrow, and the learner predicts each result before it appears.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips (commands and log lines).
- Rule: four lanes (Browser, App, Cache, Database); eight steps: open /k7Qa, cache hit, stop cache, lookup from the database, start cache, stop db, saving a new link fails, start db.
- Fixed data (invented for this example, not measured; labelled so in the chapter and in `limits`): cache hit about 4 ms; database lookup about 38 ms; a new link with the database stopped returns 500. Log lines carry no HTTP status for lookups, to keep the chapter's load low.
- Docker facts (dossier S54, S55, S56; Docker docs checked 2026-10-24): `docker compose stop <service>` stops a container without removing it, and `docker compose start <service>` starts it again; stopping asks the program to shut down and forces it after a short wait; with `unless-stopped`, a container you stop stays stopped, even after the Docker daemon restarts.
- Assumptions: Qasir's code treats a cache that does not answer like a cache miss and asks the database.
- Limitations: an app without that rule would return errors when the cache stops; the timings are invented for this example.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are 13 characters or fewer; the loop labels on the Cache and Database lanes were checked to stay inside the picture in both layouts with the registry geometry.
- Static fallback: chapter 4.4 describes the same results in prose after the canvas, so a fellow with only a phone can predict and then read.

## Controls
Shared stepper controls only.

## Visualisation
Four lanes, one arrow per step. Tones: good on the cache hit and on each start, warn on each stop and on the slower lookup, bad on the failed save, each with a text badge.

## Copy
- What this shows: what each part of a link shortener is for, found by stopping it.
- Try this: 1. Go to step 4 to check the chapter's prediction (the link still opens, and the log changes from source=cache to source=db). 2. Before step 7, predict what happens to a cached link and to a new link.
- What changed: each step note gives the command, the log line and what it means.
- Limits of the model: as in `limits`.

## Edge cases
Loop steps on the Cache and Database lanes stand for commands Yara types in her terminal, not requests between parts; their notes and chips quote the command. Long log lines are chips, not arrow labels.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole lab for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quizzes after the canvas ask what a database stop shows in another app, and why stopping two parts at once fails).
- [x] The model is tested (registry consistency and label-fit tests; checked locally with the registry geometry).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 4.4, and the phone path).

## Build plan
`packages/learning-ui/src/canvas/url-shortener-stop-a-part/data.ts`, export `urlShortenerStopAPart`, to be registered in `packages/learning-ui/src/canvas/registry.ts` and the slug lists by the orchestrator; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
