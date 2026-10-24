---
artifact: canvas-spec
course: founder-interviews
chapter: 05.02-choosing-the-story
slug: choose-technical-story
version: 1
owner: interaction-designer
renderer: factor (HTML controls, weighted-sum bars)
---

# Canvas spec: Yazan's story: change what matters

## Teaching claim
The best technical story to tell is the one where you made a real decision and can explain it five whys deep, not the one with the newest tools. Giving a lot of weight to impressive tools is the habit that makes the weaker story win.

## Why a canvas
The chapter explains the five questions in prose. A learner can say "tools should not matter" without feeling the pull. Moving one weight and watching the winner change shows why people pick the shiny story, and how little the tools weigh in a choice that survives the next "why".

## Model
- Inputs: one weight per criterion, each one of three levels (1 nice to have, 2 important, 3 very important). Five criteria: my own decision, I can explain five whys, result or honest gap, recent, impressive tools.
- Outputs: a total for each of three stories, the leader, the lead in points.
- Formula: total(story) = sum over criteria of weight x score. Scores run from 1 to 5.
- Starting weights: own decision 3, five whys 2, result 2, recent 1, impressive tools 1.
- Totals at the start: report job 36, team project 31, weekend app 27.
- Assumptions: the scores are Yazan's own judgment and are exact in the model.
- Limitations: a simple illustration. A story that is not on the list cannot win. A gap of one or two points means two stories could both work.

## Rendering
- Primary: the shared factor renderer (HTML controls, bars for the totals).
- Why this renderer: the claim is "change what matters and the winner changes".
- Static fallback: chapter 5.2 lists the five questions and the three stories in prose before the canvas.

## Controls
Three-level weight buttons for each criterion, and Reset. No other controls.

## Visualisation
Three total cards, one bar per story, the current leader named. The weight rows show score times weight for each story.

## Copy
- What this shows: three technical stories scored on five questions; the weight you give each question decides the winner.
- Try this: 1. Predict the leader at the start. 2. Set Impressive tools to Very important and watch the team project pass the report job, 41 to 38. 3. Put tools back to Nice to have and set I can explain five whys to Very important: the report job leads 41 to 34.
- What changed: the renderer says which weight moved, how many points each story gained or lost, and whether the leader changed.
- Limits of the model: as in `limits`.

## Edge cases
Names are short so they fit the bar labels on a phone: Report job, Team project, Weekend app. A tie is shown by the renderer as a tie.

## Accessibility
Shared factor renderer: radio buttons with labels, keyboard use, visible focus ring, bars with a text alternative that lists every total.

## Acceptance criteria
- [x] The claim is testable: quiz 5.2 gives a new case where tools tempt a worse choice.
- [x] The model is tested: weights and scores on their scales, totals checked in the course test.
- [x] The design is simple and legible: three stories, five questions, three levels.
- [x] Prediction before, transfer check after (two quiz items in the chapter).
- [x] Reader fallback: the chapter teaches the five questions in prose.

## Build plan
`packages/learning-ui/src/canvas/choose-technical-story/data.ts`. The orchestrator registers the slug in `server/src/shared/canvas/slugs.ts` and `packages/learning-ui/src/canvas/registry.ts`. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
