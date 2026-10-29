---
artifact: canvas-spec
course: software-engineering-concepts
chapter: 1.3-why-code-is-split-into-layers
slug: se-m1-request-layers
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: One request through the layers

## Teaching claim
Each layer has one job and one set of things it may know: the route knows URLs and not SQL, the controller knows HTTP and not SQL, the service knows the rules and not HTTP, the repository knows SQL and not HTTP. When one handler does all of it, a change in one place (a table rename) breaks code in another (the lines that build HTML).

## Why a canvas
The chapter plan names a `[layers]` stepper over a real request (module brief 01, chapter 1.3, beats 1 to 3). The claim is about order and about what each step may know, so a step-through with a note per layer teaches it better than a table. It also answers the chapter's predict ("which places need to know the name of the table?").

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow or loop, the step note, chips and an outcome badge.
- Lanes (4, the renderer's maximum): Browser, Controller, Service, Repository.
- Steps (9): 1. The route picks the controller; 2. The controller reads HTTP; 3. The service holds the rules; 4. The repository owns the SQL; 5. Postgres stores the row; 6. The row goes back up; 7. The service answers the controller; 8. The view builds the response; 9. Errand's first version had no layers (warn).
- Route, Postgres and the view are not lanes. The sequence renderer takes at most four lanes (registry test) and the narrow layout has no room for six, so the route is step 1's note, Postgres is step 5's note (a loop on the Repository lane) and the view is step 8's note.
- Assumptions: Errand is fictional; the layers are route, controller, service, repository and view (module brief 01, chapter 1.3). "Due date not in the past" is the domain rule used in chapter 1.4. The 300-line route handler and the table rename that breaks the HTML are from the brief's beat 1.
- Limitations: as in `limits`.

## Rendering
- Primary: the shared sequence renderer.
- 4 lanes; arrow labels are 18 characters or fewer (longest: "one big handler", 15).
- Static fallback: the chapter teaches the same steps in its `sequence` fence and prose.

## Controls
Shared stepper controls only.

## Copy
- What this shows: Follow POST /tasks down through the layers and back, and see what each layer may know and may not know.
- Try this:
  1. Before step 4, predict: which layer should know the name of the table?
  2. At each step, say what this layer may know and what it may not know.
- What changed (from step 4 to step 9): Only the repository knew the table name, so a rename touches one layer. In the first version one handler knew everything, so the same rename also broke the HTML.
- Limits of the model: Errand is a small fictional app. Real projects group and name layers in different ways, and a 30-line app may not need all of them. Layers that only pass data along add files and no value.

## Edge cases
Loops (from equals to) draw work inside one lane (steps 2, 5 and 9). Tone: step 8 is `good` with the text badge "view model only"; step 9 is `warn` with the text badge "rename breaks HTML". Tone is never the only signal.

## Accessibility
Shared stepper keyboard support; `summary` describes the whole flow; every tone has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's two check questions ask which layer owns a line and a rule).
- [ ] The model is tested (registry label-fit tests).
- [ ] The design is simple and legible.
- [ ] Prediction before (chapter predict), transfer check after (chapter quiz).
- [ ] Reader fallback exists (prose and `sequence` fence in the chapter).
