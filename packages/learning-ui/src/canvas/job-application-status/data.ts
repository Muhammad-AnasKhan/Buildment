import type { StateMachineSpec } from "../renderers/state-machine/types";

// Think Clearly course, chapter 3.5 "Things that change state".
// Rania's application for a remote internship, from draft to offer, with one
// move the rules refuse (editing after sending). See spec.md.
export const jobApplicationStatus: StateMachineSpec = {
  kind: "state-machine",
  title: "An internship application, one state at a time",
  purpose: "See which moves are allowed from each state, and which move the rules refuse.",
  summary:
    "An application starts as a draft. Sending it makes it submitted, where it can no longer be edited. From submitted it moves to interview if the applicant is invited, or to not chosen if not. From interview it moves to offer.",
  states: [
    { id: "draft", name: "Draft", sub: "you can change it", col: 0, row: 0 },
    { id: "submitted", name: "Submitted", sub: "locked", col: 1, row: 0 },
    { id: "interview", name: "Interview", sub: "invited to talk", col: 2, row: 0 },
    { id: "not-chosen", name: "Not chosen", sub: "end", col: 0, row: 1 },
    { id: "offer", name: "Offer", sub: "end", col: 2, row: 1 },
  ],
  edges: [
    { from: "draft", to: "submitted", label: "send" },
    { from: "submitted", to: "submitted", label: "edit: no", kind: "rejected" },
    { from: "submitted", to: "interview", label: "invited" },
    { from: "submitted", to: "not-chosen", label: "no" },
    { from: "interview", to: "offer", label: "yes" },
  ],
  steps: [
    {
      state: "draft",
      edge: 0,
      title: "It starts as a draft",
      note: "Rania writes her application for a remote internship. While it is a draft she can change anything: her CV, her answers, the spelling. When she is happy, she presses send.",
      chips: ["state: draft", "edits allowed"],
    },
    {
      state: "submitted",
      edge: 1,
      tone: "warn",
      outcome: "no change",
      title: "A rule refuses a move",
      note: "The next day Rania finds a spelling mistake and tries to edit it. The rule is: if an application is submitted, then it cannot be edited. The edit is refused and the state stays the same.",
      chips: ["state: submitted", "if submitted, then no edits"],
    },
    {
      state: "submitted",
      edge: 2,
      title: "Invited to an interview",
      note: "The company invites Rania to talk. From submitted, only two moves exist: invited or not invited. She was invited, so the state becomes interview.",
      chips: ["two possible moves"],
    },
    {
      state: "interview",
      edge: 4,
      tone: "good",
      outcome: "offer",
      title: "The interview goes well",
      note: "After the interview the company says yes. The state becomes offer, which is an end state: nothing moves after it in this chart.",
      chips: ["state: offer", "end state"],
    },
    {
      state: "not-chosen",
      edge: 3,
      tone: "bad",
      outcome: "not chosen",
      title: "Another applicant, another path",
      note: "Omar sent an application to the same internship but was not invited. His application went straight from submitted to not chosen. It never passed through interview, so it could not reach offer.",
      chips: ["submitted to not chosen", "no interview"],
    },
  ],
  tryThis: [
    "Before step 2, predict what happens when Rania tries to edit a submitted application. Then check.",
    "Can an application go from draft straight to offer? Look at the arrows that leave draft.",
  ],
  limits:
    "Real applications can have more states, such as a test task or a waiting list, and some companies let you withdraw. An interview can also end in a no; this chart leaves that arrow out to keep it small.",
};
