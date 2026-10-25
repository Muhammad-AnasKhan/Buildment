---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 9.1 Set the scene
slug: toolbelt-one-line-readme
version: 1
owner: interaction-designer
---

# Canvas spec: Same code, two visitors

## Teaching claim
A good project can look like nothing at a glance. The same repository, with a picture and a short demo added, lets a stranger understand it in a minute.

## Why a canvas
A story of "nobody understood it" is abstract. Watching one visitor leave and the next one understand, with the code unchanged, makes the cause plain.

## Model
- Actors: Visitor (user), Repository (note), Demo (phone). Bashar's study-group timer is fictional; there is no dossier claim.
- Events (12 second loop): the first visitor opens the link, the repository shows one line, the visitor has no idea and the verdict says the visitor leaves unsure. Then the repository shows a picture and a demo, the new visitor opens the link, sees the picture, taps the demo, and the verdict says the visitor understands and tries it.
- Rule: a scene is a timeline of events (`fly`, `say`, `verdict`).
- Assumptions: made-up visitors.
- Limitations: stated in `limits` (showing does not promise users).

## Rendering
- Primary: the shared scene renderer on `BeatFrame`.
- Why this renderer: a story of actors exchanging messages over time.
- Checks (the repository's scene geometry): all actors inside the picture, every second line at most 15 characters, every verdict at most 38 characters, no overlapping boxes at any moment, the verdict clear of the boxes.
- Static fallback: the final frame under reduced motion, which shows the good verdict.

## Controls
Replay. Pressing the picture freezes the motion.

## Visualisation
Three icon cards, flying dots with short labels, one verdict banner.

## Copy
- What this shows: two visitors, one repository, two outcomes.
- Try this: replay and watch what the repository says to each visitor.
- What changed: the repository's second line and the verdict.
- Limits of the model: set in `limits`.

## Edge cases
Chips for messages that have no clear space are not drawn; the second lines and the verdict carry the story.

## Accessibility
Scene text is in the renderer's description; the final frame tells the whole story under reduced motion.

## Acceptance criteria
- [x] The claim is testable: the learner can say what was added for the second visitor.
- [x] The scene geometry checks pass (run with the repository's own geometry functions).
- [x] No dash characters.
- [x] Reader fallback exists.

## Build plan
`packages/learning-ui/src/canvas/toolbelt-one-line-readme/data.ts` (export `toolbeltOneLineReadme`). The orchestrator registers the slug.
