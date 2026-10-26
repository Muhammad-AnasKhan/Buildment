---
artifact: canvas-spec
course: build-with-ai
chapter: 01.07-fewer-people-more-work
slug: who-the-smaller-team-keeps
version: 1
owner: interaction-designer
renderer: factor (HTML controls, weighted sum)
---

# Canvas spec: Who does a smaller team keep?

## Teaching claim
A smaller team keeps the person who gives the AI context, checks what it made, owns the result and works well with others. Only when raw output alone matters does the engineer who ships the most win (dossier A34, A36 to A40, A46, A56, A58, A64).

## Why a canvas
The chapter tells Rawan's choice and shows the evidence in folds. A single verdict can sound like the course's opinion, and "the fast one loses" can sound like a promise. The canvas lets the learner be Rawan, set how much each habit matters, and search for the settings where the fastest teammate wins. Finding that corner and seeing how small it is makes the claim the learner's own.

## Model
- Inputs: five weights, one per criterion, each on three levels.

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Raw output | weight level | 1 | 3 | 1 | 1 |
  | Gives AI the context | weight level | 1 | 3 | 1 | 2 |
  | Checks the result | weight level | 1 | 3 | 1 | 3 |
  | Owns the outcome | weight level | 1 | 3 | 1 | 3 |
  | Works with others | weight level | 1 | 3 | 1 | 2 |

- Outputs: a total in points for each of three options, the leader and the margin.
- Formula: total(option) = sum over criteria of weight x score. Scores on a 1 to 5 scale:

  | Criterion | Omar: ships most | Sana: checks, owns | Mazen: steady helper |
  |---|---|---|---|
  | Raw output | 5 | 2 | 3 |
  | Gives AI the context | 3 | 4 | 3 |
  | Checks the result | 2 | 5 | 3 |
  | Owns the outcome | 3 | 5 | 4 |
  | Works with others | 3 | 4 | 4 |

- Assumptions: the scores follow the chapter's story and are the course's illustrative judgement. Omar ships the most pull requests a week with AI and describes the task to the assistant but not the client's rules (context 3), pastes quickly and reads little (checks 2), fixes a bug when asked but says "the assistant wrote it" (owns 3) and works with the team at an ordinary level (3). Sana ships fewer (2), gives the assistant the client's rules and limits (4), tests every result (5), answers to the client herself (5) and writes down her decisions for the team (4). Mazen ships at an ordinary rate (3), gives ordinary context (3), checks some of his work (3), answers for the work he owns (4) and keeps the team informed (4). Years of experience are not a criterion.
- Limitations: five numbers cannot describe a person. The chapter and the `limits` text say so.

### Checked totals (all 243 weight settings computed)

Settings are written (raw output, context, checks, owns, teamwork).

| Setting | Omar | Sana | Mazen | Leader |
|---|---|---|---|---|
| Rawan's: 1, 2, 3, 3, 2 | 32 | 48 | 38 | Sana by 10 |
| All 1 | 16 | 20 | 17 | Sana by 3 |
| All 3 | 48 | 60 | 51 | Sana by 9 |
| 3, 1, 1, 1, 1 | 26 | 24 | 23 | Omar by 2 |
| 3, 1, 1, 1, 2 | 29 | 28 | 27 | Omar by 1 |
| 3, 2, 1, 1, 1 | 29 | 28 | 26 | Omar by 1 |
| 3, 3, 1, 1, 1 | 32 | 32 | 29 | Tie, Omar and Sana |
| 3, 1, 1, 1, 3 | 32 | 32 | 31 | Tie, Omar and Sana |

Omar leads in exactly three of the 243 settings: raw output at 3, checks and owns at 1, and (context, teamwork) at (1, 1), (1, 2) or (2, 1). He ties with Sana in four more: (3, 1, 1, 1, 3), (3, 1, 1, 2, 1), (3, 2, 1, 1, 2) and (3, 3, 1, 1, 1). Sana leads alone in the other 236. Mazen never leads: Mazen minus Sana = output - context - 2 x checks - owns, which is at most 3 - 1 - 2 - 1 = -1. Omar minus Sana = 3 x output - context - 3 x checks - 2 x owns - teamwork, so with checks at 2 or more Omar can never lead.

## Rendering
- Primary: the shared factor renderer.
- Three options, five criteria, three weight levels ("Matters a little", "Matters", "Matters a lot"), scores 1 to 5. Criterion names are 22 characters or fewer; option names 22 or fewer.
- Static fallback: chapter 1.7 gives Rawan's totals and the winning corner in prose after the canvas.

## Controls
One three-level weight control per criterion. Presets are not needed: `tryThis` gives the settings to try.

## Visualisation
The shared factor table and totals: each cell shows score x weight, and the leader is labelled with its margin or as a tie.

## Copy
- What this shows: as in `whatThisShows`.
- Try this:
  1. Start with Rawan's weights. Sana leads with 48 points, Mazen has 38 and Omar 32. (Matches the chapter's predict; does not repeat it.)
  2. Raw output "Matters a lot", the other four "Matters a little": Omar leads, 26 to 24 to 23, one of only three settings where he leads.
  3. Keep that, then raise "Gives AI the context" to "Matters a lot": Omar and Sana tie at 32; Mazen has 29.
  4. Every weight "Matters a little": Sana 20, Mazen 17, Omar 16.
- What changed: the shared renderer states the new totals and leader after each change.
- Limits of the model: as in `limits`.

## Edge cases
- Ties exist (four settings above); the renderer labels a tie.
- All weights at the same level: Sana leads (16, 20, 17 at level 1; 48, 60, 51 at level 3).
- The fictional names Omar, Sana, Mazen and Rawan appear only in module 1. The agency is fictional.

## Accessibility
Shared factor controls are labelled HTML inputs with keyboard support; totals and the leader are given in text, never by colour alone.

## Acceptance criteria
- [x] The claim is testable: the quick checks transfer it to a new team with stated facts and to a reading of company statements.
- [x] The model is tested: the shared factor model tests and the registry scale checks, once registered; totals above computed for all 243 weight settings.
- [x] The design is simple and legible: three options, five criteria.
- [x] Prediction before (chapter predict, first line of `tryThis`), transfer check after.
- [x] Reader fallback exists: the prose in chapter 1.7.

## Build plan
`packages/learning-ui/src/canvas/who-the-smaller-team-keeps/data.ts`, export `whoTheSmallerTeamKeeps` (FactorSpec). To be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by the shared factor model and registry tests; preview at `/workspace/canvases`.

## Placement
Chapter 1.7, beat 4 ("Rawan's last seat"), after the predict and before the beat on why this is easier for learners now.
