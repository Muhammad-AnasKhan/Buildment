# The ReAct loop

- **Slug:** `agent-react-loop`
- **Course:** AI Engineering Interview, chapter 6.3 "The ReAct loop".
- **Teaching claim:** An agent alternates think, act and observe until it has enough information. The application, not the model, runs tools and enforces the stop rules: an answer ends the run, a write tool waits for a person, and a turn limit stops a loop that never settles.
- **Renderer:** sequence (four lanes: Model, App, Tools, Lead). A state machine was tried first; with six states on a phone its edge labels covered the states, so the loop is shown over time instead.

## Model

A turn is one call to the model; the limit is 6. The happy run takes 4 turns: lookup_order (read, runs at once), a request for issue_refund that waits for the lead's approval, the approved refund, then the answer. The last step is a separate run where lookup_order keeps timing out and the app stops at turn 6.

## Learning interaction

- **What this shows:** each model turn, tool call and approval as a message between lanes, with the arguments in chips.
- **Try this:** predict whether the refund runs at once; count the turns and test a limit of 3.
- **What changed:** each note says what the agent learned or which rule fired.
- **Limits:** one tool per turn, one human decision, an example turn limit.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

Labels are at most 18 characters; the registry test checks that every label fits at phone and desktop widths. Check light and dark mode and the reader at 375px.
