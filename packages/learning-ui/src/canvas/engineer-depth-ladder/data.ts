import type { StateMachineSpec } from "../renderers/state-machine/types";

// The Founder Interview course, chapter 5.4 "The engineer version".
// An engineer asks a series of follow-ups on Yazan's report job. Each step
// needs a decision or a test he can name, or an honest "I did not test that".
// Facts match the chapter. See spec.md.
export const engineerDepthLadder: StateMachineSpec = {
  kind: "state-machine",
  title: "The engineer's follow-ups: Yazan's report job",
  purpose: "Follow six follow-up questions, one step at a time, and see what each one needs from you.",
  summary:
    "An engineer asks what Yazan built, why this way, why not run it at night, what happens if the job stops halfway, how he tested it, and what he would change. Each answer names a decision or a test, and one answer is an honest gap: he did not test ten times more merchants.",
  states: [
    { id: "built", name: "What I built", sub: "one sentence", col: 0, row: 0 },
    { id: "why", name: "Why this way", sub: "the reason then", col: 1, row: 0 },
    { id: "night", name: "Why not nightly?", sub: "the other option", col: 2, row: 0 },
    { id: "stops", name: "If it stops", sub: "the failure case", col: 2, row: 1 },
    { id: "tested", name: "How I tested it", sub: "the check I ran", col: 1, row: 1 },
    { id: "change", name: "What I'd change", sub: "looking back", col: 0, row: 1 },
  ],
  edges: [
    { from: "built", to: "why", label: "why?" },
    { from: "why", to: "night", label: "why not?" },
    { from: "night", to: "stops", label: "if" },
    { from: "stops", to: "tested", label: "how?" },
    { from: "tested", to: "change", label: "next" },
  ],
  steps: [
    {
      state: "built",
      edge: 0,
      title: "Step 1: what you built",
      note: "I moved the monthly merchant report into a background job that builds it in parts and emails a link. Before: about 40 minutes, and 9 timeouts last month for the 12 largest merchants. After: about 6 minutes for the largest, no timeouts in two months.",
      chips: ["one sentence", "numbers with a before"],
    },
    {
      state: "why",
      edge: 1,
      title: "Step 2: why this way",
      note: "The report was built while the merchant waited, and for the largest merchants the wait was longer than the page allows. A background job lets the page answer at once, and building in parts means a failure costs one part, not the whole report.",
      chips: ["the problem I saw", "the reason then"],
    },
    {
      state: "night",
      edge: 2,
      title: "Step 3: why not run it at night?",
      note: "Merchants ask for reports at any time, and some need today's numbers. A night run would give yesterday's. The price of my choice: more parts to watch than one night script.",
      chips: ["the other option", "what I gave up"],
      tone: "good",
      outcome: "a real trade-off",
    },
    {
      state: "stops",
      edge: 3,
      title: "Step 4: what if the job stops halfway?",
      note: "It restarts from the last finished part, and running a part again is safe. Before it emails, it checks a record that the report was sent. A crash after the email and before the record could send a second email, and I accept that small risk. I tested the restart by stopping the job by hand.",
      chips: ["failure case", "a test I ran"],
    },
    {
      state: "tested",
      edge: 4,
      title: "Step 5: how you tested it",
      note: "I stopped the job by hand and checked that it restarted and sent one email. I did not test a crash between the email and the record, and I did not test ten times more merchants. If it came up, I would run the biggest merchant's report on a copy of the data with more than one job at a time.",
      chips: ["what I tested", "what I did not"],
      tone: "good",
      outcome: "honest gap and a plan",
    },
    {
      state: "change",
      title: "Step 6: what you would change",
      note: "Today I find out about a stopped job by reading the logs. I would send the team a message when a job stops, so nobody waits for a report that is not coming.",
      chips: ["a change I would make"],
    },
  ],
  tryThis: [
    "At step 3, name the option Yazan did not choose and what he gave up by choosing his own.",
    "At step 5, read the answer about ten times more merchants. Why is it a strong answer even though he did not test it?",
  ],
  limits:
    "A real engineer may ask these questions in another order, or ask one that is not on this list. The order here is for practice, not a script. Each answer uses only Yazan's own facts from the chapter, so every step has a decision, a test or an honest gap behind it.",
};
