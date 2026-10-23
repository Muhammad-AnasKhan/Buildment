import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 4.2 "The shape of a daily lab".
// Yara's lab day 3 on Qasir: study, build, break one thing, write. When the
// build gets stuck, she makes the step smaller instead of running past her
// time. On another evening a power cut ends the lab early, and she writes what
// she has. Every number matches the chapter. See spec.md.
export const dailyLabLoop: StateMachineSpec = {
  kind: "state-machine",
  title: "One lab day, in four parts",
  purpose: "Follow one 40-minute lab through study, build, break and write, and see what to do when you get stuck or the power goes.",
  summary:
    "Yara studies for 10 minutes, then builds. At minute 18 her change stops the app from starting, so she makes the step smaller and it runs at minute 24. She breaks one thing on purpose by typing a short code in capital letters, then writes her log entry and ends at minute 40. On another evening a power cut ends the lab at minute 20, and she writes a short entry on her phone instead.",
  states: [
    { id: "study", name: "Study", sub: "10 minutes", col: 0, row: 1 },
    { id: "build", name: "Build", sub: "15 to 20 minutes", col: 1, row: 1 },
    { id: "break", name: "Break one thing", sub: "5 to 10 minutes", col: 2, row: 1 },
    { id: "write", name: "Write it down", sub: "5 to 10 minutes", col: 2, row: 0 },
    { id: "short", name: "Short write-up", sub: "write what you have", col: 0, row: 0 },
  ],
  edges: [
    { from: "study", to: "build", label: "then" },
    { from: "build", to: "build", label: "stuck" },
    { from: "build", to: "break", label: "it runs" },
    { from: "break", to: "write", label: "log" },
    { from: "build", to: "short", label: "power cut" },
  ],
  steps: [
    {
      state: "study",
      edge: 0,
      title: "Study for 10 minutes",
      note: "Lab day 3 has one question: does each lookup come from the cache or from the database? Yara rereads the 20 lines of Qasir's code that look up a short link, and one page of documentation on how a cache answers.",
      chips: ["one question", "minutes 0 to 10"],
    },
    {
      state: "build",
      edge: 1,
      tone: "warn",
      outcome: "stuck",
      title: "Minute 18: the app will not start",
      note: "Her plan was to add two things to the log line for each lookup: where the answer came from, and how long it took. After the change, the app will not start. Her build time ends at minute 25.",
      chips: ["7 minutes of build left"],
    },
    {
      state: "build",
      edge: 2,
      tone: "good",
      outcome: "runs",
      title: "Make the step smaller",
      note: "She takes the timing out and keeps one word: cache or db. A chat assistant explains the error message, and she makes the fix herself. The app runs at minute 24. The timing goes into her next step for another day.",
      chips: ["source=cache", "source=db"],
    },
    {
      state: "break",
      edge: 3,
      title: "Break one thing on purpose",
      note: "She first writes her guess, then types the short code in capital letters: /K7QA instead of /k7Qa. The log says source=db and the page says not found. Short codes care about capital letters, and a code the cache does not hold always goes to the database.",
      chips: ["minutes 25 to 30", "guess first"],
    },
    {
      state: "write",
      tone: "good",
      outcome: "logged",
      title: "Write for 10 minutes",
      note: "Her entry has five parts: the goal, what she did, what broke, what she learned, and what AI helped with. The last line is tomorrow's next step: add the time of each lookup. She stops at minute 40.",
      chips: ["minutes 30 to 40", "next step written"],
    },
    {
      state: "short",
      edge: 4,
      tone: "warn",
      outcome: "still a lab day",
      title: "Another evening: the power goes",
      note: "On lab day 6, the power goes after the study part, at minute 20, and her laptop has little charge left. She writes three lines in her phone notes: the goal, where she stopped, and the next step. She adds them to her log the next day.",
      chips: ["goal", "where I stopped", "next step"],
    },
  ],
  tryThis: [
    "Go to step 4 to check your prediction: the log line for /K7QA says source=db, and the page says not found.",
    "At step 2, the app will not start and the build ends in 7 minutes. Compare what you would do first with step 3.",
  ],
  limits:
    "The minutes are the course's guide and Yara's own example, not a rule. Some labs need more study and less building. Stuck can also mean a problem you cannot shrink today; then the smaller step is writing down the exact error and what you tried.",
};
