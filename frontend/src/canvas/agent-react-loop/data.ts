import type { StateMachineSpec } from "../renderers/state-machine/types";

// AI Engineering Interview course, chapter 6.3 "The ReAct loop".
// One Bustan Books support question through think, act and observe, with a
// write tool that waits for a human decision and a turn limit that stops a
// loop that never settles. See spec.md.
export const agentReactLoop: StateMachineSpec = {
  kind: "state-machine",
  title: "One support question through the ReAct loop",
  purpose: "See how an agent alternates between thinking, calling a tool and reading the result, and which rules make it stop.",
  summary:
    "The agent thinks, calls a tool, reads the result and thinks again. A refund is a write action, so the agent waits for a human decision before calling it. The loop ends with an answer when the agent has enough information, or stops when it reaches the limit of 6 turns.",
  states: [
    { id: "answer", name: "Answer", sub: "reply to the user", col: 0, row: 0 },
    { id: "stopped", name: "Stopped", sub: "limit reached", col: 0, row: 1 },
    { id: "think", name: "Think", sub: "choose next step", col: 1, row: 0 },
    { id: "wait", name: "Wait", sub: "human approval", col: 1, row: 1 },
    { id: "act", name: "Act", sub: "call one tool", col: 2, row: 0 },
    { id: "observe", name: "Observe", sub: "read the result", col: 2, row: 1 },
  ],
  edges: [
    { from: "think", to: "act", label: "call a tool" },
    { from: "act", to: "observe", label: "result" },
    { from: "observe", to: "think", label: "read result" },
    { from: "think", to: "wait", label: "risky: ask" },
    { from: "wait", to: "think", label: "decision" },
    { from: "think", to: "answer", label: "enough info" },
    { from: "think", to: "stopped", label: "turn limit" },
  ],
  steps: [
    {
      state: "think",
      edge: 0,
      title: "Turn 1: what do I need to know?",
      note: "A customer writes: 'Where is order 1042? It arrived damaged and I want a refund.' The model cannot answer from memory. It decides to look up the order first, and writes a tool call with structured arguments.",
      chips: ["turn 1 of 6", 'lookup_order(order_id="1042")'],
    },
    {
      state: "act",
      edge: 1,
      title: "Act: run a read-only tool",
      note: "The app, not the model, runs the tool. It checks the arguments against the tool's schema first. lookup_order only reads data, so it runs at once with no approval.",
      chips: ["read-only", "arguments validated"],
    },
    {
      state: "observe",
      edge: 2,
      title: "Observe: the result goes back to the model",
      note: "The tool result is added to the conversation as an observation. The model now knows the order was delivered 3 days ago and cost 45.",
      chips: ['status: "delivered"', "total: 45", "delivered: 3 days ago"],
    },
    {
      state: "think",
      edge: 3,
      title: "Turn 2: a refund is a write action",
      note: "The model wants to call issue_refund. Refunds move money, so the app's rule is that a human must approve this tool. The graph pauses instead of calling it.",
      chips: ["turn 2 of 6", 'issue_refund("1042", 45)', "needs approval"],
    },
    {
      state: "wait",
      edge: 4,
      tone: "warn",
      outcome: "approved",
      title: "Wait: a person decides",
      note: "A support lead sees the order, the amount, the customer's reason and the agent's plan, and approves. The decision goes back to the agent. If the lead had rejected it, the agent would reply without a refund and explain the next step.",
      chips: ["order 1042", "amount 45", "reason: damaged"],
    },
    {
      state: "think",
      edge: 0,
      title: "Turn 3: call the approved tool",
      note: "With the approval in its state, the agent calls issue_refund with the same arguments the lead approved. Changing the amount now would need a new approval.",
      chips: ["turn 3 of 6", 'issue_refund("1042", 45)'],
    },
    {
      state: "observe",
      edge: 2,
      title: "Observe: the refund exists",
      note: "The tool returns a refund id. The agent now has everything the customer asked for.",
      chips: ['refund_id: "R-77"'],
    },
    {
      state: "think",
      edge: 5,
      title: "Turn 4: enough information",
      note: "The model decides it can answer. It does not call another tool just because it can.",
      chips: ["turn 4 of 6"],
    },
    {
      state: "answer",
      tone: "good",
      outcome: "done in 4 turns",
      title: "Answer the customer",
      note: "The reply says where the order is, that a refund of 45 was approved, and gives the refund id. Every fact in it came from a tool result, not from the model's memory.",
    },
    {
      state: "stopped",
      edge: 6,
      tone: "bad",
      outcome: "stopped",
      title: "Another run: the loop never settles",
      note: "In a different run, the order system keeps timing out and the model keeps calling lookup_order. After 6 turns the app stops the loop, tells the customer a person will follow up, and logs the run for review. The stop rule lives in the app, not in the prompt.",
      chips: ["turn 6 of 6", "same call repeated", "hand off to a human"],
    },
  ],
  tryThis: [
    "Before step 4, predict whether the agent can call issue_refund straight away. Then check.",
    "Count the turns in the run that ends with an answer. Which turn would a limit of 3 have cut off?",
  ],
  limits:
    "This shows one tool call per turn and a single human decision. Real agents may call several tools in one turn, retry failed calls, and summarise long histories. The 6 turn limit is an example; set yours from your own traces.",
};
