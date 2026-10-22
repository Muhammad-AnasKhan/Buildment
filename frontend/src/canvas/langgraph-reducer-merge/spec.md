# LangGraph reducer merge

- **Slug:** `langgraph-reducer-merge`
- **Course:** AI Engineering Interview, chapter 7.2 "State, nodes, edges and reducers".
- **Teaching claim:** Nodes return partial updates and LangGraph merges them at the end of each step. A key with a reducer combines updates (an append reducer keeps both messages). A key without a reducer is replaced by a single update, and two updates to it in the same step raise InvalidUpdateError.
- **Renderer:** sequence (four lanes: State, Policy node, Order node, Merge).

## Model

State: `messages: Annotated[list, operator.add]`, `status: str`. Two nodes run in parallel from START. Verified with LangGraph 1.2.16 on 2026-10-22: with both nodes returning one message, the result has 3 messages and status unchanged; with both nodes also returning status, `invoke` raises `InvalidUpdateError` with "At key 'status': Can receive only one value per step."

## Learning interaction

- **What this shows:** each node's update as a message to the merge step, and the merged state.
- **Try this:** predict the message count after the merge; predict whether two status writes pick a winner or fail.
- **What changed:** each note says which key changed and why.
- **Limits:** two nodes and two keys; no custom reducers, checkpoints or conditional edges.

The chapter puts a Predict before the canvas and a transfer quiz after it.

## QA

Labels are at most 18 characters; the registry test checks fit at phone and desktop widths. Check light and dark mode and the reader at 375px.
