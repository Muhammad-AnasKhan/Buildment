# The ReAct loop

- **Slug:** `agent-react-loop`
- **Course:** AI Engineering Interview, chapter 6.3 "The ReAct loop".
- **Teaching claim:** An agent alternates think, act and observe until it has enough information. The loop must have stop rules that live in the application: an answer, a human decision for risky write tools, and a turn limit for loops that never settle.
- **Renderer:** state machine (3 columns, 2 rows).

## Model

States: Answer, Stopped, Think, Wait, Act, Observe. Transitions: think to act (call a tool), act to observe (result), observe to think (read result), think to wait (a write tool needs approval), wait to think (the human decision), think to answer (enough information), think to stopped (turn limit). A turn is one Think. The happy run takes 4 turns: lookup, ask for approval, refund, answer. The last step shows a separate run that reaches the 6 turn limit.

## Learning interaction

- **What this shows:** each turn and tool call as a lit state and edge, with the tool arguments in chips.
- **Try this:** predict whether the refund runs at once; count the turns and test a limit of 3.
- **What changed:** each note says what the agent learned or what rule fired.
- **Limits:** one tool per turn, one human decision, an example turn limit.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

Edge labels are at most 14 characters, and the registry test checks that every label box fits at phone and desktop widths. No two edges cross. Check light and dark mode and the reader at 375px.
