# Indirect injection trace

- **Slug:** `indirect-injection-trace`
- **Course:** AI Engineering Interview, chapter 8.3 "Prompt injection".
- **Teaching claim:** Text inside retrieved data can steer the model into a tool call; only a control outside the model stops it.
- **Renderer:** sequence (export `indirectInjectionTrace`; four lanes: Chat, App, Model, Tools).

## Model

The chapter's worked trace for Sahel Relief: a staff member asks for a summary of report-118; `read_document` returns the report plus hidden white text; the model calls `lookup_beneficiaries(district="north")`, which the app runs with the staff member's permissions; 40 records come back; the summary ends with an image whose address holds the 40 names and phone numbers; the chat window loads it and the data leaves with no click. Step 12 is a second run where the app's code removes images and unknown links from every reply, so the same fooled model has no exit (the output validation layer that chapter 8.4 builds).

## Learning interaction

- **What this shows:** where attacker text enters (step 4), where it becomes a tool call (step 6), where data is written into output (step 9) and where it leaves (step 11), then a control in code (step 12).
- **Try this:** find the first unneeded tool call and the step where attacker text entered; name a second control in code that breaks the chain using the chapter's three conditions.
- **What changed:** each step note says what crossed which boundary and why the model could not tell rules from data.
- **Limits:** one example attack and one exit; tool arguments, links, web fetches and shared notes are other exits; removing images closes this exit only.

The chapter puts a predict (which change is sure to stop the data leaving? Answer: code that removes images) right before the canvas and a transfer quiz in a new context (a Bustan Books review summariser with a send tool) after it.

## QA

Labels are at most 18 characters, lane names at most 8 and subtitles at most 10. `frontend/tests/unit/canvas/agent-sequences-7-8.test.ts` runs the registry's label-fit loop at narrow and wide widths. Check light and dark mode and the reader at 375px.
