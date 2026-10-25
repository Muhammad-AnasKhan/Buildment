---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.1
slug: two-teams-same-answer
version: 1
owner: interaction-designer
---

# Canvas spec: Two teams, one question, one answer

## Teaching claim
Two people can ask an assistant the same question, get the same answer, and need different ones, because of a fact the assistant never saw.

## Why a canvas
The set-the-scene chapter must show the problem before it names a term. Two messages crossing at one assistant and returning as one word, followed by two different outcomes, shows the gap faster than a paragraph.

## Model
A scene (`kind: "scene"`, renderer `renderers/scene`). Watch-only; the learner can replay.

- Actors: Tala (user, "internal tool"), Munir (user, "sells caching"), Assistant (server, "one sentence").
- Events: both ask "which cache?"; the assistant says "Redis"; both receive "Redis"; Tala's line becomes "fits her use" (good); Munir's becomes "check licence" (warn) with a ring; the verdict "Same answer, different right answer".
- Sources: B29 and B31 (the licence change and what RSALv2 forbids) are told in the chapter's fold; the assistant's words are an illustration. Tala, Munir and the school office are fictional.
- Assumptions: none about real tools.
- Limitations: stated in `limits`.

## Rendering
The shared scene player in a `BeatFrame` with Replay. 420 by 300 viewBox, three actors, loop 7 seconds. Checked: no two boxes overlap at any moment (0.25 second steps) and all actors sit inside the picture.

## Controls
Replay only.

## Copy
- What this shows: one question, one answer, two situations.
- Try this: Watch the two small lines under the names after the answer arrives.
- What changed: Tala's line turns green and Munir's turns amber.
- Limits of the model: see `limits`.

## Edge cases
Under `prefers-reduced-motion` the scene shows the final frame, which carries the verdict. Sub-lines are 14 characters or fewer.

## Accessibility
The scene has a text alternative from `purpose`; the verdict is a live banner; colour is paired with the words "fits her use" and "check licence".

## Acceptance criteria
- [x] The claim is testable (the learner can say what differs between the two people).
- [x] The scene is checked for collisions and containment.
- [ ] Prediction before, transfer check after (not applicable to a Read chapter; the chapter ends with an open question in everyday words).
- [x] Reader fallback exists (the chapter's text and fold tell the story).

## Placement
Course 13 v2, chapter 6.1 "Set the scene", beat 1. Data: `two-teams-same-answer/data.ts` (`twoTeamsSameAnswer`). The orchestrator registers the slug.
