---
artifact: canvas-spec
course: software-engineering-concepts
chapter: 1.4-one-task-five-shapes
slug: se-m1-task-shapes
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: One task, five shapes

## Teaching claim
One task takes five shapes on its way through the app (request body, DTO, domain model, database row, view model). Each shape keeps only the fields its reader needs, so a shape reused outside its layer, such as the row sent straight to the browser, is how a field nobody meant to send (`owner_id`, `password_hash`) reaches the screen.

## Why a canvas
The chapter plan names a `[shapes]` stepper where fields light up as kept or dropped (module brief 01, chapter 1.4, beats 2 to 4). The claim is about the same fact changing form at each step, so a step-through with a chip row per shape shows which fields each shape keeps. The last step is the leak from chapter 1.1, placed after the learner has seen the shapes (the chapter's predict comes right before it).

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, the chips (the fields the shape keeps) and an outcome badge.
- Lanes (4, the renderer's maximum): Browser, Controller, Service, Repository.
- Steps (7): 1. Shape 1, the request body (`title`, `due: 2026-11-02`, `isAdmin: true`); 2. Shape 2, the DTO (`title`, `due`; `isAdmin` rejected); 3. Shape 3, the domain model (`title`, `dueAt: Date`; rule: due date not in the past); 4. Shape 4, the database row (`title`, `due_at timestamptz`, `owner_id`, `created_at`); 5. the row goes back up; 6. Shape 5, the view model (`title`, `dueIn: 3 days`; no `owner_id`); 7. the row returned unchanged (warn: `owner_id` leaked, `password_hash` for a user row).
- The brief's beats are followed. The brief's example in beat 1 shows `due` as the text `2026-11-02`, the table storing a timestamp and the API returning `"dueIn": "3 days"`; the brief's beat 4 is the row object passed to `res.json`. The `password_hash` column name is the snake_case form of the `passwordHash` field in chapter 1.1.
- The DTO step says "rejected" (chapter 1.6: unknown fields are rejected and named in `errors`); chapter 1.4's check question says a shape "drops" `isAdmin`. Both name the DTO as the answer.
- Assumptions: Errand is fictional. `dueIn` is worked out from a "now" the code is given (chapter 1.6), so "3 days" is an example, not a fixed date.
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 4 lanes; arrow labels are 18 characters or fewer (longest: "row, unchanged", 14).
- Static fallback: the chapter teaches the same five shapes in prose and a table of kept fields.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one task through the request body, the DTO, the domain model, the database row and the view model, and see which fields each one keeps.
- Try this:
  1. Before step 7, predict: the row goes to the browser as it is. What does the browser get?
  2. At each step, say which fields the shape keeps and which it drops.
- What changed (from step 6 to step 7): The view model had `title` and `dueIn` only. The raw row adds `owner_id` and every other column, because nothing chose the fields.
- Limits of the model: Errand is a small fictional app, and these five shapes are the ones this course uses. Other projects use fewer shapes or other names for them. Merging two shapes is a choice with a cost, as the last step shows.

## Edge cases
Loops (from equals to) draw work inside one lane (step 2). Tone: step 6 is `good` with the text badge "no owner_id"; step 7 is `warn` with the text badge "owner_id leaked". Tone is never the only signal. Step 7 draws an arrow from Repository to Browser over the other lanes on purpose: it skips the view.

## Accessibility
Shared stepper keyboard support; `summary` describes the whole flow; every tone has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's two check questions: which shape has `dueIn`; which shape drops `isAdmin`).
- [ ] The model is tested (registry label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before (chapter predict), transfer check after (chapter quiz).
- [ ] Reader fallback exists (prose and a table of kept fields in the chapter).
