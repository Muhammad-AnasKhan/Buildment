---
artifact: canvas-spec
course: software-engineering-concepts
chapter: 1.4-one-task-five-shapes
slug: se-m1-task-shapes
version: 3
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: One task, five shapes

## Teaching claim
One task takes five shapes on its way through the app (request body, DTO, domain model, database row, view model). Each shape keeps only the fields its reader needs, and may also rename, retype or add fields. A shape reused outside its layer is how a field nobody meant to send reaches the screen. The canvas shows it with a stored row in a different design (`owner_id` would leak). Chapter 1.4 shows it with Errand's own domain model (`ownerId`, as `passwordHash` did in 1.1).

## Why a canvas
The chapter plan names a `[shapes]` stepper where fields light up as kept or dropped (module brief 01, chapter 1.4, beats 2 to 4). The claim is about the same fact changing form at each step, so a step-through with a chip row per shape shows which fields each shape keeps, renames or adds. The last step supposes a different design and shows the leak after the learner has seen the shapes.

## Model
- Inputs: none beyond the step controls. The stepper has no field toggles: the sequence renderer takes step controls only. The learner's own choice in this chapter is the predict (which way of building the profile answer sends a new column) and the two quiz questions.
- Outputs: the active arrow or loop, the step note, the chips (the real fields the shape keeps, with renamed or added ones marked) and an outcome badge.
- Lanes (4, the renderer's maximum): Browser, Controller, Service, Repository.
- Steps (9): 1. Shape 1, the request body (`title`, `due`, both text); 2. Shape 2, the DTO (`title` trimmed, `due`); 3. Side road: a body with `isAdmin` is refused with a 400 that names the field; 4. Shape 3, the domain model (`id`, `ownerId` added, `title`, `dueAt` a Date, `done`, `createdAt`); 5. Shape 4, the database row (`id`, `owner_id`, `title`, `due_at`, `status`, `created_at`); 6. the row is read back into the domain model; 7. the service answers the controller with the domain model; 8. Shape 5, the view model (`id`, `title`, `done`, `due`, `dueIn` added; no owner, no creation time); 9. a supposed design in which the repository hands up rows and a stored row is sent unchanged (warn: `owner_id`, `status`, `created_at` would leak).
- One story for the leak, used in 1.1, 1.3, 1.4, 1.7, 1.9, 1.10 and here: in 1.1 the object that left was the domain model of a user (camelCase, so `passwordHash`). Chapter 1.4 states this once. The canvas example is a task row sent as it is, in a design where the repository hands up rows. Its note says "Suppose a different design", so the step 6 note (the repository builds the domain model) stays true for Errand. Chapter 1.4 beat 4 teaches the leak with a different object, Errand's own domain model (`res.json(tasks)` leaks `ownerId` and `createdAt`), so the leak is not told twice with the same object. The line that did it in 1.1 is not shown before chapter 1.7.
- The DTO refuses an unknown field with a 400 (chapter 1.6: unknown fields are rejected and named in `errors`). The clean walk-through never carries `isAdmin` forward; step 3 is a side road that returns to the clean body.
- Assumptions: Errand is fictional. `dueIn` is worked out from a "now" the code is given (chapter 1.6), so "3 days" is an example with today set to 30 October 2026, not a fixed date.
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 4 lanes; arrow labels are 18 characters or fewer (longest: "row, unchanged", 14).
- Static fallback: the chapter teaches the same five shapes in prose and in a code fold with all five.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow one task through the request body, the DTO, the domain model, the database row and the view model, and see which fields each one keeps.
- Try this:
  1. Before step 9, predict: the row goes to the browser as it is. Which fields does the browser get?
  2. At each step, say which fields the shape keeps, which it drops and which it renames.
- What changed (from step 8 to step 9): The view model had `id`, `title`, `done`, `due` and `dueIn` only. The stored row adds `owner_id` and every other column, because nothing chose the fields.
- Limits of the model: Errand is a small fictional app, and these five shapes are the ones this course uses. Other projects use fewer shapes or other names for them. Merging two shapes is a choice with a cost, which chapter 1.4 explains.

## Edge cases
Loops (from equals to) draw work inside one lane (step 2). Tone: step 8 is `good` with the text badge "no ownerId"; step 9 is `warn` with the text badge "owner_id would leak". Tone is never the only signal. Step 9 draws an arrow from Repository to Browser over the other lanes on purpose: it skips the controller's mapping.

## Accessibility
Shared stepper keyboard support; `summary` describes the whole flow; every tone has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's two check questions: where to work out `isOverdue`; which shapes change to add `priority`).
- [ ] The model is tested (registry label-fit tests).
- [ ] The design is simple and legible.
- [ ] A choice the learner makes: the chapter predict (block-list or allow-list, after the canvas) and the two quiz items after it. The in-canvas try-this prompts are ungraded.
- [ ] Reader fallback exists (prose and a code fold with all five shapes in the chapter).
