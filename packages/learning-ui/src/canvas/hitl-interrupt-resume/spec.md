# Interrupt and resume

- **Slug:** `hitl-interrupt-resume`
- **Course:** AI Engineering Interview, chapter 7.4 "Human-in-the-loop approvals".
- **Teaching claim:** An interrupt saves a checkpoint and waits; on resume the node runs again from its first line, so side effects before the pause repeat.
- **Renderer:** sequence (export `hitlInterruptResume`; four lanes: App, Graph, Saver, Huda).

## Model

The chapter's own code and output on LangGraph 1.2.16 (checked 2026-10-22): `approve_refund` appends an email line, then calls `interrupt({"order_id": "1042", "amount": 24.0})`. The graph is compiled with `InMemorySaver`; the config uses thread id `refund-1042`. The first `invoke` returns `__interrupt__` with the value. `invoke(Command(resume="approve"), config)` on the same thread runs the node again from its first line; `interrupt()` returns `"approve"`. Final output: `decision: approve`, `emails sent: 2`.

Steps (11): invoke, email line (1), save checkpoint, `__interrupt__` returned, ask Huda, approve, `Command(resume)`, load checkpoint, node runs again (email 2), interrupt returns the answer, decision returned.

## Learning interaction

- **What this shows:** the pause and the resume as messages between the app, the graph, the checkpointer and the reviewer, with the email count in chips.
- **Try this:** predict the email count before step 9; find the two steps where the email line runs and name the chapter's fix (interrupt at the top of its own node, side effects in the next node).
- **What changed:** each step note says what moved or what the rule is.
- **Limits:** one node and one reviewer; InMemorySaver keeps the pause only while the process runs; timeouts, rejections and resume permissions are left out.

The chapter's existing predict (how many times did the email line run?) sits right before the canvas. A transfer quiz follows the copy blocks (a Wadi Labs restart node), and the chapter's later quiz (a grant agent) is a second transfer.

## QA

Labels are at most 18 characters, lane names at most 8 and subtitles at most 10. `frontend/tests/unit/canvas/agent-sequences-7-8.test.ts` runs the registry's label-fit loop at narrow and wide widths and checks the chapter's numbers (refund-1042, 24.0, emails 1 then 2). Check light and dark mode and the reader at 375px.
