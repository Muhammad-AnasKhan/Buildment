---
artifact: canvas-spec
course: build-with-ai
chapter: 08.02-learn-adopt-research-fast
slug: adopt-a-tool-loop-sources
version: 1
owner: interaction-designer
renderer: scene (watch-only)
---

# Canvas spec: Three sources, one question

## Teaching claim
When you adopt a tool, its docs give a version, a date and a limit you can check. A post and an AI answer can be fluent and wrong, or right and undated. Check the docs first: read the licence page and the dated announcement, compare release notes, note the date (dossier section 7; B29, B31, B32, B33).

## Why a canvas
The beat before the loop needs the learner to see one question put to three kinds of source, and only one of them carrying a version. Motion shows the same question travelling three times and one answer coming back with a date.

## Model
- Actors: Yazan (a fictional fellow), a post, an AI answer, and the docs of Mawid (a made-up tool, version 3.2).
- Events: the question "restart?" goes to each source in turn. The post gives no limit, the AI answer says "yes, on disk", and the docs say the jobs live in memory (version 3.2). A ring marks the docs. A verdict says only the docs give a version.
- Assumptions: in this example the docs are right for the installed version.
- Limitations: a real AI answer is sometimes right, and a post sometimes links to the docs. Stated in `limits`.

## Rendering
The shared scene renderer, 420 by 300. Four actor cards with second lines of at most 15 characters. The verdict has 28 characters.

## Copy
- What this shows: three sources asked one question.
- Limits: as in `limits`.

## Edge cases
Under reduced motion the final frame shows the verdict and every second line. Names, version and answers match chapter 8.2 and the `adopt-a-tool-loop` canvas.

## Accessibility
The scene player has a text alternative from `purpose`. Replay is a 44px button. Reduced motion shows the final frame.

## Acceptance criteria
- [x] Watch-only: the chapter's predict and its playable beat come after it.
- [x] Names, version and answers match the chapter and the `adopt-a-tool-loop` canvas.
- [x] No colour in the data except the shared tones.

## Build plan
`packages/learning-ui/src/canvas/adopt-a-tool-loop-sources/data.ts`, export `adoptAToolLoopSources` (SceneSpec). To be registered by the orchestrator.

## Placement
Chapter 8.2, beat 2 ("Ask the docs, not the post").
