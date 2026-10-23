# An internship application, one state at a time

- **Slug:** `job-application-status`
- **Course:** Think Clearly, chapter 3.5 "Things that change state".
- **Teaching claim:** Many everyday things are always in exactly one state, and if-then rules decide which moves are allowed from that state. A move the rules do not allow leaves the state unchanged.
- **Renderer:** state machine.

## Model

Five states: Draft, Submitted, Interview, Not chosen, Offer. Four allowed moves and one refused move (editing after sending, a dashed loop on Submitted). Two end states. The walk-through follows Rania from draft to offer; the last step shows Omar going from submitted to not chosen.

## Learning interaction

- **What this shows:** the one state an application is in, and the moves that leave it.
- **Try this:** predict the refused edit; check whether draft can jump to offer.
- **Limits:** real processes have more states (test tasks, waiting lists, withdrawing), and an interview can also end in a no, which the chart leaves out.

The chapter puts a Predict before the canvas and a quiz question after it.

## QA

Edge labels are at most 14 characters, grid is 3 columns by 2 rows so the narrow layout fits 340px. Check light and dark mode and the reader at 375px.
