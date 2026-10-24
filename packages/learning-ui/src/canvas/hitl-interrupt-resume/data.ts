import type { SequenceSpec } from "../renderers/sequence/types";

// AI Engineering Interview course, chapter 7.4 "Human-in-the-loop approvals".
// Omar's approve_refund node from the chapter, run once to the pause and once
// on resume. Every value (order 1042, amount 24.0, thread refund-1042, two
// emails) matches the chapter's code and its real output on LangGraph 1.2.16.
// See spec.md.
export const hitlInterruptResume: SequenceSpec = {
  kind: "sequence",
  title: "One refund: pause, wait, resume",
  purpose: "Follow a graph that pauses with interrupt() for Huda's approval, and see which lines run again when it resumes.",
  summary:
    "The app invokes the graph on thread refund-1042. The approve_refund node sends an email, then calls interrupt(), so LangGraph saves a checkpoint and returns the interrupt value. Huda approves. The app resumes with Command(resume='approve') on the same thread. LangGraph loads the checkpoint and runs the node again from its first line, so the email goes out a second time, and interrupt() now returns 'approve'.",
  actors: [
    { name: "App", sub: "your code" },
    { name: "Graph", sub: "LangGraph" },
    { name: "Saver", sub: "checkpoint" },
    { name: "Huda", sub: "reviewer" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "invoke refund-1042",
      title: "The first call starts the run",
      note: "The app calls graph.invoke with order 1042 and a config whose thread id is refund-1042. The graph was compiled with InMemorySaver, a checkpointer. Without one, the run would still stop at the interrupt, but the resume would fail.",
      chips: ['thread_id: "refund-1042"', "checkpointer: InMemorySaver"],
    },
    {
      from: 1,
      to: 1,
      label: "email line runs",
      title: "approve_refund starts at its first line",
      note: "The node's first line records the 'Refund under review' email for order 1042. This line is a side effect: it acts outside the node's return value.",
      chips: ["emails sent: 1"],
    },
    {
      from: 1,
      to: 2,
      label: "save checkpoint",
      title: "interrupt() pauses the run",
      note: "The next line calls interrupt() with the order id and the amount. LangGraph saves the state from before the node started under the thread id, and stops the run.",
      chips: ["interrupt({'order_id': '1042', 'amount': 24.0})"],
    },
    {
      from: 1,
      to: 0,
      label: "__interrupt__",
      tone: "warn",
      outcome: "paused",
      title: "invoke returns with the interrupt value",
      note: "The result of invoke holds a key __interrupt__ with the value. No process waits for Huda: the state is in the checkpointer, and nothing runs until someone resumes it.",
      chips: ["paused with: {'order_id': '1042', 'amount': 24.0}"],
    },
    {
      from: 0,
      to: 3,
      label: "approve 24.00?",
      title: "The app asks the reviewer",
      note: "The app shows Huda the order and the amount from the interrupt value. She can decide minutes or hours later.",
      chips: ["order 1042", "amount 24.00"],
    },
    {
      from: 3,
      to: 0,
      label: "approve",
      tone: "good",
      outcome: "approved",
      title: "Huda approves",
      note: "Huda's decision comes back to the app as the plain answer 'approve'.",
    },
    {
      from: 0,
      to: 1,
      label: "Command(resume)",
      title: "The app resumes on the same thread",
      note: "The app calls graph.invoke(Command(resume='approve'), config) with the same thread id. A different thread id would find no paused state and start a fresh run.",
      chips: ["Command(resume='approve')", 'thread_id: "refund-1042"'],
    },
    {
      from: 2,
      to: 1,
      label: "load checkpoint",
      title: "LangGraph loads the saved state",
      note: "The saver returns the checkpoint for refund-1042: the state from before approve_refund started.",
      chips: ["order_id: 1042"],
    },
    {
      from: 1,
      to: 1,
      label: "node runs again",
      tone: "bad",
      outcome: "email 2",
      title: "The node runs again from its first line",
      note: "LangGraph does not continue from the middle of the function. It calls approve_refund again, so the email line runs a second time. This is why every approved customer got two emails.",
      chips: ["emails sent: 2"],
    },
    {
      from: 1,
      to: 1,
      label: "interrupt returns",
      title: "This time interrupt() does not pause",
      note: "On the second run, interrupt() returns the resume value instead of pausing. The node returns it as the decision.",
      chips: ["decision = 'approve'"],
    },
    {
      from: 1,
      to: 0,
      label: "decision: approve",
      tone: "good",
      outcome: "done",
      title: "The run finishes",
      note: "invoke returns the final state. The output matches the chapter: decision approve, emails sent 2. The fix is to call interrupt() at the top of its own node and move every side effect into the next node.",
      chips: ["decision: approve", "emails sent: 2"],
    },
  ],
  tryThis: [
    "Before step 9, predict how many emails have been sent when the run ends. Then check the chips.",
    "Find the two steps where the email line runs. Then name the change from the chapter that makes it run only once.",
  ],
  limits:
    "This is one node and one reviewer, with InMemorySaver as in the chapter's code. InMemorySaver keeps the pause only while the process runs; a database checkpointer survives a restart. Timeouts, rejections and a check on who may resume are left out.",
};
