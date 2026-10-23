import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 2.4 "Survivors and selection".
// Of 400 students who signed up, only the 100 still using the app got the
// survey, and 92 said it helped. The 300 who stopped were never asked; Basel
// writes to 30 of them and 20 reply. See spec.md.
export const whoGotTheSurvey: StateMachineSpec = {
  kind: "state-machine",
  title: "Who got the survey, and who was never asked?",
  purpose: "Follow both paths from sign-up, the students who stayed and the students who left, and see who the survey's 92 out of 100 really describes.",
  summary:
    "Four hundred students signed up. One hundred were still using the app at the end of term and got the survey, and 92 said it helped their marks. Three hundred stopped and were never asked. Basel writes to 30 of them; 20 reply, 11 say the app did not help, 6 finished their exams and 3 forgot about it.",
  states: [
    { id: "signed", name: "400 signed up", sub: "last term", col: 0, row: 0 },
    { id: "using", name: "100 still using", sub: "got the survey", col: 1, row: 0 },
    { id: "yes", name: "92 say it helped", sub: "8 say no", col: 2, row: 0 },
    { id: "stopped", name: "300 stopped", sub: "never asked", col: 0, row: 1 },
    { id: "emailed", name: "30 emailed", sub: "by Basel", col: 1, row: 1 },
    { id: "replied", name: "20 replied", sub: "10 did not", col: 2, row: 1 },
  ],
  edges: [
    { from: "signed", to: "using", label: "stayed" },
    { from: "using", to: "yes", label: "survey" },
    { from: "signed", to: "stopped", label: "out" },
    { from: "stopped", to: "emailed", label: "email 30" },
    { from: "emailed", to: "replied", label: "reply" },
  ],
  steps: [
    {
      state: "signed",
      edge: 0,
      title: "Start from everyone",
      note: "Last term, 400 students signed up for the app. By the end of the term, some were still using it and some had stopped.",
      chips: ["400 signed up"],
    },
    {
      state: "using",
      edge: 1,
      title: "Only the students who stayed get the survey",
      note: "One hundred students were still using the app at the end of term. The company sent its survey only to them.",
      chips: ["100 of 400"],
    },
    {
      state: "yes",
      outcome: "92 of 100",
      title: "92 say it helped",
      note: "Ninety-two of the 100 say the app improved their marks, and 8 say it did not. Rawan wants to say '92 percent of students'. Now look at the other path.",
      chips: ["92 yes", "8 no"],
    },
    {
      state: "signed",
      edge: 2,
      title: "Follow the students who left",
      note: "Three hundred of the 400 stopped using the app during the term.",
    },
    {
      state: "stopped",
      edge: 3,
      tone: "warn",
      outcome: "never asked",
      title: "300 students were never asked",
      note: "Out of all 400, at least 92 felt helped: 23 in every 100, not 92. For the 300 who left, nobody knows. Basel writes to 30 of them and asks why they stopped.",
      chips: ["92 + 8 + 300 = 400"],
    },
    {
      state: "emailed",
      edge: 4,
      title: "Basel asks 30 of the missing students",
      note: "He asks one short question: why did you stop? Twenty of the 30 reply.",
      chips: ["30 emailed", "20 replied"],
    },
    {
      state: "replied",
      tone: "warn",
      outcome: "a second filter",
      title: "What the missing students say",
      note: "Eleven say the app did not help them, 6 finished their exams and 3 forgot about it. The 10 who did not reply are missing again, so this is a hint, not the full picture.",
      chips: ["no help: 11", "exams over: 6", "forgot: 3"],
    },
  ],
  tryThis: [
    "Before step 7, guess whether many of the students who replied say the app did not help.",
    "At step 5, work out what share of all 400 students is known to have felt helped.",
  ],
  limits:
    "Basel heard from only 20 of the 300 students who left, and people who reply to emails are a group of their own. The canvas shows who was asked, not whether the app works: that needs a fair test, which module 3 teaches.",
};
