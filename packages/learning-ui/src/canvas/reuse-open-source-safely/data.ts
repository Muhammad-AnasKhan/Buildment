import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 7.5 "Learn from open source".
// Yara finds an open-source link shortener (shortlane, a made-up name),
// checks its licence and its health, reads it in order, reuses one function
// within the MIT licence and credits it. The machine refuses copying from a
// project with no licence, and refuses dropping the licence notice. See spec.md.
export const reuseOpenSourceSafely: StateMachineSpec = {
  kind: "state-machine",
  title: "Reuse open-source code, within the licence",
  purpose: "Follow one project from finding it to crediting it, and see the two moves the licence does not allow.",
  summary:
    "Yara finds shortlane on a topic page and checks its licence (MIT) and its health (recent commits, several contributors, answered issues). She reads it in order: README, run it, one folder, its tests. She reuses one function with the licence notice kept, and credits it in her README and write-up. Copying code from a project with no licence is refused, and so is dropping the licence notice in favour of a thank-you line.",
  states: [
    { id: "found", name: "Project found", sub: "topic page", col: 0, row: 0 },
    { id: "licence", name: "Licence checked", sub: "MIT, or none", col: 1, row: 0 },
    { id: "health", name: "Health checked", sub: "commits, issues", col: 2, row: 0 },
    { id: "read", name: "Read in order", sub: "README, run, folder", col: 2, row: 1 },
    { id: "reuse", name: "Part reused", sub: "notice kept", col: 1, row: 1 },
    { id: "credit", name: "Credit given", sub: "README and post", col: 0, row: 1 },
  ],
  edges: [
    { from: "found", to: "licence", label: "check licence" },
    { from: "licence", to: "health", label: "has a licence" },
    { from: "health", to: "read", label: "ok" },
    { from: "read", to: "reuse", label: "reuse a part" },
    { from: "reuse", to: "credit", label: "credit it" },
    { from: "licence", to: "licence", label: "copy anyway", kind: "rejected" },
    { from: "credit", to: "credit", label: "drop notice", kind: "rejected" },
  ],
  steps: [
    {
      state: "found",
      edge: 0,
      title: "Find a project to study",
      note: "Yara opens GitHub's topic page for link shorteners and finds shortlane, a made-up name in this example. It makes short codes the way she wants to learn. Before she reads a line, she looks for the licence.",
      chips: ["topic page", "shortlane"],
    },
    {
      state: "licence",
      edge: 1,
      tone: "good",
      outcome: "MIT",
      title: "Check the licence first",
      note: "The LICENSE file says MIT. She may reuse, change and share the code, as long as she keeps the copyright and licence notice with it.",
      chips: ["LICENSE file", "keep the notice"],
    },
    {
      state: "licence",
      edge: 5,
      tone: "bad",
      outcome: "read only",
      title: "No licence: read, do not copy",
      note: "A second project she liked has many more stars and no licence file. Public is not the same as open source. She may read it and learn from it, but she may not copy its code into Qasir, with or without credit.",
    },
    {
      state: "health",
      edge: 2,
      tone: "good",
      outcome: "healthy",
      title: "Check the signs of health",
      note: "Shortlane's last commit was three weeks ago, nine people have contributed, most issues get an answer within a few days, and pull requests are reviewed and merged.",
      chips: ["recent commits", "9 contributors", "answered issues"],
    },
    {
      state: "read",
      edge: 3,
      title: "Read it in order",
      note: "On lab day 9: README first, then she runs it in GitHub Codespaces, then one folder, the code that makes short codes, and its tests. A chat assistant's tour of one file names a function that is not there, so she checks every claim against the code.",
      chips: ["README", "run it", "one folder", "tests"],
    },
    {
      state: "reuse",
      edge: 4,
      tone: "good",
      outcome: "within licence",
      title: "Reuse one part, within the licence",
      note: "In week 9, her short codes week, she adapts shortlane's 20-line short-code function into Qasir and keeps the MIT notice in her licences folder. She can explain every line, so the explain-back rule is met too.",
      chips: ["MIT notice kept", "explain-back"],
    },
    {
      state: "credit",
      edge: 6,
      tone: "bad",
      outcome: "refused",
      title: "A thank-you does not replace the notice",
      note: "Deleting the licence notice and only thanking the author in the README breaks MIT's one condition. Credit is added to the notice, never used instead of it.",
    },
    {
      state: "credit",
      tone: "good",
      outcome: "done",
      title: "Credit where readers will see it",
      note: "Her README says: 'Short codes adapted from shortlane (MIT licence). The licence notice is in the licences folder.' The same line goes into her weekly write-up.",
    },
  ],
  tryThis: [
    "Go to step 2 and read the one condition MIT sets, then go to step 7: a thank-you in the README is refused as a replacement for the notice.",
    "At step 3, the project with no licence is the more popular one. Stars do not change what she may copy: without a licence she may only read it.",
    "Compare steps 4 and 5: health tells her the project is worth reading, and the reading order tells her where to start.",
  ],
  limits:
    "This covers four common cases only (MIT, Apache 2.0, GPL and no licence) and is not legal advice: other licences have other conditions, and when you are unsure, ask a mentor or do not copy. The health signs make a project worth studying; they do not make its code correct. Shortlane and its numbers are made up for this example.",
};
