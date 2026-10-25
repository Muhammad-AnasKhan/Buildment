---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 9.5 CLIs and connectors, read-only first
slug: toolbelt-hidden-instruction
version: 1
owner: interaction-designer
---

# Canvas spec: A hidden order in an issue

## Teaching claim
Text that a stranger wrote, such as a GitHub issue, can hide instructions meant for an AI tool. A wide token lets the instruction reach private data. A narrow token limits the damage, although the tool can still be tricked.

## Why a canvas
The risk is invisible in a screenshot of an issue. Watching the same issue meet two tokens shows that the text is the same and the access decides the harm.

## Model
- Actors: Stranger (user), Issue (note), Private repo (database), AI tool (worker). Made-up case in the shape of a documented risk.
- Events (14.5 second loop): pass one, the tool has a wide token, reads the issue, obeys the hidden order, asks for the private notes, and the verdict says the notes leak. Pass two, the tool has a narrow token, reads the same issue, is tricked but stuck, asks for the notes, gets no access, and the verdict says nothing leaks.
- Dossier ids: C45 (Invariant Labs, 26 May 2025: a malicious issue in a public repository could make an agent with access to public and private repositories leak private data into a pull request; they suggest least privilege such as one repository per session); C43 (tool descriptions and text are untrusted; explicit consent before a tool runs); C44 (read-only mode; lockdown mode is best effort and not an authorization boundary).
- Assumptions: made-up names; the case is "in this example".
- Limitations: stated in `limits`.

## Rendering
- Primary: the shared scene renderer on `BeatFrame`, 420 by 340.
- Checks: as for the other scene (actors inside, second lines at most 15 characters, verdicts at most 38, no overlapping boxes, verdict clear of boxes).
- Static fallback: the final frame under reduced motion shows the good verdict.

## Controls
Replay.

## Visualisation
Four icon cards, flying dots with short labels (drawn where clear), one verdict banner.

## Copy
- What this shows: one issue, two tokens, two outcomes.
- Try this: replay and compare what the tool says about itself in the two passes.
- What changed: the tool's token and the private repository's answer.
- Limits of the model: set in `limits`.

## Edge cases
In pass two the tool is still tricked ("tricked, stuck"); the scene does not claim the attack fails to fool the tool.

## Accessibility
As for the other scene.

## Acceptance criteria
- [x] The claim is testable: the learner can say what limited the harm.
- [x] The scene geometry checks pass.
- [x] No dash characters.
- [x] Prediction before (chapter 9.5), transfer check after.
- [x] Reader fallback exists.

## Build plan
`packages/learning-ui/src/canvas/toolbelt-hidden-instruction/data.ts` (export `toolbeltHiddenInstruction`). The orchestrator registers the slug.
