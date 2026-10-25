---
artifact: canvas-spec
course: build-with-ai
chapter: 08.01-set-the-scene
slug: grow-laith-forty-repos
version: 1
owner: interaction-designer
renderer: scene (watch-only)
---

# Canvas spec: Forty repositories, one question

## Teaching claim
A pile of finished tutorials gives a reader little to check. One question about a choice ("why this design?") has no answer in the repository. This sets the problem of module 8 in everyday words, before any term is taught.

## Why a canvas
The set-the-scene chapter needs the cost of "more" shown quickly. A mentor opening a profile, opening one repository and asking one question shows it in a few seconds.

## Model
- Actors: a mentor with ten minutes, Laith (a fictional fellow, a year after the course) with a profile of forty tutorial repositories, and one repository (number 17, a tutorial clone).
- Events: the mentor opens the profile and sees forty tutorials, opens one repository and finds a one-line README, asks why it was built this way, and gets no reasons. The verdict says there is nothing to check.
- Assumptions: all forty repositories are tutorial clones with one-line READMEs, as the chapter's story says.
- Limitations: real people with many repositories often explain their choices. Neither Laith nor the mentor is real.

## Rendering
The shared scene renderer, 420 by 300. Three actor cards with second lines of at most 15 characters. The verdict has 29 characters.

## Copy
- What this shows: a reader with ten minutes and one question.
- Limits: as in `limits`.

## Edge cases
Under reduced motion the final frame shows the verdict and every second line. The chapter's story fold gives the full case. Names and numbers match it.

## Accessibility
Text alternative from `purpose`. Replay is a 44px button. Reduced motion shows the final frame.

## Acceptance criteria
- [x] Watch-only; no mechanism the module has not taught is named.
- [x] Names and numbers match chapter 8.1 (forty repositories, ten minutes, repository 17).

## Build plan
`packages/learning-ui/src/canvas/grow-laith-forty-repos/data.ts`, export `growLaithFortyRepos` (SceneSpec). To be registered by the orchestrator.

## Placement
Chapter 8.1, beat 1 ("Forty repositories, one question").
