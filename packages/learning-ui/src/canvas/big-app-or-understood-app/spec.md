---
artifact: canvas-spec
course: build-with-ai
chapter: 01.05-plenty-of-ai-few-strong-projects
slug: big-app-or-understood-app
version: 1
owner: interaction-designer
renderer: factor (HTML controls, weighted sum)
---

# Canvas spec: A big app or an understood app?

## Teaching claim
Khaled's big store built in a weekend loses to Yara's small, understood Qasir slice on what a reviewer checks; only when "Number of features" matters most, and the other checks matter only a little, does the big app win.

## Why a canvas
The chapter tells one mentor's choice and walks through Yara's explain-back check in prose. A single verdict can feel like the course's opinion. The canvas lets the learner be the reviewer, set the weights themselves, and search for the settings where the big app wins. Finding that corner, and seeing how small it is, makes the claim the learner's own.

## Model
- Inputs: five weights, one per criterion, each on three levels.

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Works when tried | weight level | 1 | 3 | 1 | 3 |
  | Can explain every part | weight level | 1 | 3 | 1 | 3 |
  | Handles a failure | weight level | 1 | 3 | 1 | 2 |
  | Choices written down | weight level | 1 | 3 | 1 | 2 |
  | Number of features | weight level | 1 | 3 | 1 | 1 |

- Outputs: a total in points for each option, the leader and the margin.
- Formula: total(option) = sum over criteria of weight x score. Scores on a 1 to 5 scale:

  | Criterion | Khaled's weekend store | Yara's Qasir slice |
  |---|---|---|
  | Works when tried | 3 | 4 |
  | Can explain every part | 1 | 5 |
  | Handles a failure | 2 | 4 |
  | Choices written down | 1 | 4 |
  | Number of features | 5 | 1 |

- Assumptions: the scores follow the chapter's review. The store works on the happy path but breaks on a wrong quantity (3); Khaled cannot explain why prices are stored as text (1); its payment page goes blank on a letter (2); nothing is written down (1); it has 14 features (5). The slice works on everything the mentor tried (4); Yara explains every part (5); unknown short links show "link not found" (4); she has a decision note (4); it has 3 features (1).
- Limitations: the scores are the course's illustrative judgement, not measurements.

### Checked totals (all 243 weight settings computed)

| Setting (works, explain, failure, choices, features) | Store | Qasir slice | Leader |
|---|---|---|---|
| Default: 3, 3, 2, 2, 1 | 23 | 44 | Qasir slice by 21 |
| All 1 | 12 | 18 | Qasir slice by 6 |
| All 3 | 36 | 54 | Qasir slice by 18 |
| 1, 1, 1, 1, 3 | 22 | 20 | Store by 2 |
| 2, 1, 1, 1, 3 | 25 | 24 | Store by 1 |
| 1, 2, 1, 1, 3 | 23 | 25 | Qasir slice by 2 |
| 3, 1, 1, 1, 3 | 28 | 28 | Tie |
| 1, 1, 2, 1, 3 | 24 | 24 | Tie |

The store wins in exactly two of the 243 settings: "Number of features" at 3, "Can explain every part", "Handles a failure" and "Choices written down" at 1, and "Works when tried" at 1 or 2. It ties in two more. In every other setting the Qasir slice leads. Store minus slice = 4 x features - works - 4 x explain - 2 x failure - 3 x choices, so with features at 2 or less the slice always leads.

## Rendering
- Primary: the shared factor renderer.
- Two options, five criteria, three weight levels ("Matters a little", "Matters", "Matters a lot"), scores 1 to 5. Criterion names are 22 characters or fewer; option names 22 or fewer.
- Static fallback: chapter 1.8 gives the default totals, the winning corner and the setting that turns it back, in prose after the canvas.

## Controls
One three-level weight control per criterion. Presets are not needed: `tryThis` gives the settings to try.

## Visualisation
The shared factor table and totals: each cell shows score x weight, and the leader is labelled with its margin.

## Copy
- What this shows: as in `whatThisShows`.
- Try this:
  1. Set "Number of features" to "Matters a lot" and the other four to "Matters a little". Khaled's store wins, 22 points to 20: one of only two settings where it leads. (Points at the setting that answers the chapter's predict; does not repeat it.)
  2. Keep that, then set "Can explain every part" to "Matters". Yara's slice leads again, 25 points to 23.
  3. Set every weight to "Matters a little". Yara's slice leads, 18 points to 12.
- What changed: the shared renderer states the new totals and leader after each change.
- Limits of the model: as in `limits`.

## Edge cases
- Ties exist (two settings above); the shared renderer labels a tie.
- All weights at the same level: the slice leads (12 to 18 at 1, 36 to 54 at 3).
- Facts match chapter 1.8 and the course's canonical facts: 14 features against 3; Yara's first slice built in weeks 1 to 2 (about 16 hours) saves a link, opens it by its short code, shows a "link not found" page and keeps a click count as a number saved in the database; prices stored as text; blank payment page; a decision note.

## Accessibility
Shared factor controls are labelled HTML inputs with keyboard support; totals and the leader are given in text, never by colour alone.

## Acceptance criteria
- [x] The claim is testable: the quizzes after the canvas transfer it to a bootcamp project with one part the student cannot explain, and to a school library choosing between three freelancers with a real trade-off (features, explanation, a handled failure, start date).
- [x] The model is tested: the shared factor model tests and the registry scale checks, once registered; totals above computed for all 243 settings.
- [x] The design is simple and legible: two options, five criteria.
- [x] Prediction before (chapter predict, first line of `tryThis`), transfer check after.
- [x] Reader fallback exists: the prose in chapter 1.8.

## Build plan
`packages/learning-ui/src/canvas/big-app-or-understood-app/data.ts`, export `bigAppOrUnderstoodApp` (FactorSpec). To be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts` and `factor-model.test.ts`; preview at `/workspace/canvases`.

## Placement
Chapter 1.8, section "Weighing the two projects", after the predict and before "Where it goes wrong".
