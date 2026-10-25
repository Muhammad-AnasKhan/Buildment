---
artifact: canvas-spec
course: build-with-ai (v2)
chapter: 6.2
slug: likely-next-word-agrees
version: 1
owner: interaction-designer
---

# Canvas spec: A leaning question invites a yes

## Teaching claim
An assistant may agree with the way a question leans, so ask for the case against your idea as well as for confirmation of it.

## Why a canvas
The agreeing habit is a tendency, easy to nod at and forget. Two questions on the same idea, with two kinds of reply, shows the difference in one short story.

## Model
A scene (`kind: "scene"`, renderer `renderers/scene`). Watch-only; Replay.

- Actors: You (user, "asks twice"), Assistant (server, "may agree").
- Events: "best, right?" goes out and "yes" comes back (amber: agreement without new facts); "when wrong?" goes out and "3 cases" comes back (green: reasons to check); verdict "Ask for the case against, too".
- Sources: sycophancy was found in five assistants in one study (B7); OpenAI rolled back an update in April 2025 for being overly agreeable and gave its account in May 2025 (B8, B9). The "3 cases" are an illustration. The course's own method of asking what was left out has not been tested as a prompt (U2); the scene presents advice, not a finding.
- Assumptions: none about a specific assistant.
- Limitations: stated in `limits`: a tendency, not a recording; a neutral question helps but does not make an answer true.

## Rendering
The shared scene player in a `BeatFrame` with Replay. 420 by 260 viewBox, two actors, loop 9.5 seconds. Checked: no overlap at any moment.

## Controls
Replay only. The scene sets a one-line hint: "Watch: it plays on its own. Press Replay to see it again."

## Copy
- What this shows: the same idea asked two ways.
- Try this: Replay and compare the two replies and the line under You.
- What changed: the reply turns from "yes" to reasons.
- Limits of the model: see `limits`.

## Edge cases
Reduced motion shows the final frame with the verdict. Fly labels are 12 characters or fewer.

## Accessibility
Text alternative from `purpose`; colour paired with words; verdict is a live banner.

## Acceptance criteria
- [x] The claim is testable.
- [x] The scene is checked for collisions and containment.
- [ ] Prediction before, transfer check after (chapter 6.2: the predict is on the sampler beat; two quiz items after).
- [x] Reader fallback exists (the beat text and fold).

## Placement
Course 13 v2, chapter 6.2 "Why you get the common answer", beat 5 ("It tends to agree with you"). Data: `likely-next-word-agrees/data.ts` (`likelyNextWordAgrees`). The orchestrator registers the slug.
