import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 7.2 "State, nodes, edges and
// reducers". Two LangGraph nodes run in the same step and both return
// updates. The behaviour (append with a reducer, InvalidUpdateError for two
// writes to a plain key) was checked with LangGraph 1.2.16. See spec.md.
export const langgraphReducerMerge: SequenceSpec = {
  kind: "sequence",
  title: "Two nodes, one state: what the reducer decides",
  purpose:
    "See how LangGraph merges updates from two nodes that run in the same step, and why a key without a reducer cannot take two updates at once.",
  summary:
    "Two nodes read the same state and each returns an update. The messages key has an append reducer, so both new messages are kept. The status key has no reducer: one update replaces it, but two updates in the same step raise InvalidUpdateError.",
  actors: [
    { name: "State", sub: "2 keys" },
    { name: "Policy", sub: "node" },
    { name: "Orders", sub: "node" },
    { name: "Merge", sub: "reducers" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "same snapshot",
      title: "Both nodes start in the same step",
      note: "The graph has an edge from START to each node, so they run in parallel. Each one gets the same copy of the state: one message from the user, and status new.",
      chips: ["messages: 1 item", 'status: "new"'],
    },
    {
      from: 0,
      to: 2,
      label: "same snapshot",
      title: "Neither node sees the other's work",
      note: "The order node reads the same snapshot. A node never edits the state directly. It returns a small update, and LangGraph merges all updates at the end of the step.",
      chips: ["nodes return updates"],
    },
    {
      from: 1,
      to: 3,
      label: "messages +1",
      title: "The policy node returns one message",
      note: "The update holds only the key it changes: a list with one new message about the refund window.",
      chips: ['{"messages": ["policy: refunds within 30 days"]}'],
    },
    {
      from: 2,
      to: 3,
      label: "messages +1",
      title: "The order node returns one message",
      note: "The order node also writes to messages, in the same step.",
      chips: ['{"messages": ["order 1042: delivered"]}'],
    },
    {
      from: 3,
      to: 0,
      label: "append both",
      tone: "good",
      outcome: "3 messages",
      title: "The reducer keeps both",
      note: "messages is declared as Annotated[list, operator.add], so the merge step adds each update to the list. Both new messages are kept. status was not in either update, so it stays new.",
      chips: ["messages: 3 items", 'status: "new"'],
    },
    {
      from: 1,
      to: 3,
      label: "status: searched",
      title: "Now both nodes also set status",
      note: "Change the nodes so that each one also returns a status. The policy node says searched.",
      chips: ['{"status": "searched"}'],
    },
    {
      from: 2,
      to: 3,
      label: "status: found",
      title: "Two values for one plain key",
      note: "The order node says found, in the same step. status is a plain str with no reducer, so it can hold only one value.",
      chips: ['{"status": "found"}'],
    },
    {
      from: 3,
      to: 0,
      label: "InvalidUpdateError",
      tone: "bad",
      outcome: "error",
      title: "LangGraph refuses to guess",
      note: "The merge has two values for status and no rule to combine them, so the run fails with InvalidUpdateError: the key can receive only one value per step. Fix it by letting one node own status, or by giving status a reducer that says how to combine values.",
      chips: ["At key 'status'", "one value per step"],
    },
    {
      from: 3,
      to: 0,
      label: "replace status",
      tone: "good",
      outcome: "answered",
      title: "One update per step simply replaces",
      note: "With the fix, a later answer node is the only node that writes status. A single update to a key without a reducer replaces the old value, so status becomes answered. The messages list keeps growing through its reducer.",
      chips: ['status: "answered"'],
    },
  ],
  tryThis: [
    "Before step 5, predict how many messages the state holds after the merge.",
    "Before step 8, predict what happens when two nodes write status in the same step: one wins, or the run fails?",
  ],
  limits:
    "This shows two nodes and two keys. It leaves out the add_messages reducer's extra features (it can replace a message with the same id), custom reducers, checkpoints and conditional edges. The order of the two new messages inside one step follows the graph, not which node finished first.",
};
