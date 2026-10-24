import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 1.4 "AI can help or harm your learning".
// Kinan and Lubna practise the same 20 problems with the same chat assistant:
// Kinan asks for answers, Lubna asks for hints. Practice scores and test scores
// point in opposite directions. A fellow's example, not study data; the chapter
// reports the studies separately. See spec.md.
export const answersOrHints: StateMachineSpec = {
  kind: "state-machine",
  title: "Answers or hints: same AI, two results",
  purpose: "Follow two fellows who used the same chat assistant in two ways, and see what each practice score did and did not predict.",
  summary:
    "Kinan asks the chat assistant for the answer to each of 20 practice problems, copies them and scores 20 of 20 in about two hours. Lubna asks only for hints, tries each problem herself and scores 14 of 20 in about four hours. In the entry test with no AI, Kinan scores 9 of 20 and Lubna scores 15 of 20. The difference is who did the thinking during practice. The numbers are an example, not study data.",
  states: [
    { id: "ask-answer", name: "Ask for answer", sub: "Kinan", col: 0, row: 0 },
    { id: "copy", name: "Copy", sub: "read, nod, next", col: 1, row: 0 },
    { id: "test-answers", name: "Exam alone", sub: "no AI", col: 2, row: 0 },
    { id: "ask-hint", name: "Ask for a hint", sub: "Lubna", col: 0, row: 1 },
    { id: "try", name: "Try it yourself", sub: "stuck, then fix", col: 1, row: 1 },
    { id: "test-hints", name: "Exam alone", sub: "no AI", col: 2, row: 1 },
  ],
  edges: [
    { from: "ask-answer", to: "copy", label: "answer given" },
    { from: "copy", to: "test-answers", label: "practice done" },
    { from: "ask-hint", to: "try", label: "one hint" },
    { from: "try", to: "test-hints", label: "practice done" },
  ],
  steps: [
    {
      state: "ask-answer",
      edge: 0,
      title: "Kinan asks for answers",
      note: "Kinan pastes each of the 20 practice problems on percentages and rates into the chat assistant and asks for the answer. Each one comes back with a clear, correct explanation.",
      chips: ["20 practice problems", "answer every time"],
    },
    {
      state: "copy",
      tone: "warn",
      outcome: "20 of 20",
      title: "Fast, perfect practice",
      note: "He reads each answer, it makes sense, and he moves on. All 20 are right, in about two hours. But the score measures the AI's work: he never chose a method or found a mistake himself.",
      chips: ["about 2 hours"],
    },
    {
      state: "ask-hint",
      edge: 2,
      title: "Lubna asks for hints",
      note: "Lubna types: 'Do not give me the answer. Give me one hint.' Same chat assistant, same 20 problems.",
      chips: ["same tool", "same 20 problems"],
    },
    {
      state: "try",
      outcome: "14 of 20",
      title: "Slower practice, real mistakes",
      note: "She tries each problem herself, gets some wrong, asks for another hint and finds her own mistakes. It takes about four hours, and 14 of 20 are right on her first try. She feels slow.",
      chips: ["about 4 hours"],
    },
    {
      state: "test-answers",
      edge: 1,
      tone: "bad",
      outcome: "9 of 20",
      title: "Kinan's test, alone",
      note: "In the entry test there is no AI. He gets most problems with two percentage changes in a row wrong: he remembers reading about them, not how to do them. He scores 9 of 20.",
    },
    {
      state: "test-hints",
      edge: 3,
      tone: "good",
      outcome: "15 of 20",
      title: "Lubna's test, alone",
      note: "She meets the same kinds of problems, and she has done the steps before, mistakes included. She scores 15 of 20: lower than Kinan's practice score, and higher than his test score.",
    },
    {
      state: "try",
      title: "What made the difference",
      note: "Same tool, same problems, same week. The difference was who did the thinking during practice. These numbers are an example made for this chapter, not data from a study.",
    },
  ],
  tryThis: [
    "Steps 5 and 6 answer the prediction above the canvas: compare each test score with the same person's practice score in steps 2 and 4.",
    "Which practice score told you more about the test, and why?",
    "What would change on Kinan's row if he closed each answer and then redid the problem alone?",
  ],
  limits:
    "This is one made-up example to show the idea; the numbers are not from a study, and real results vary by person, subject and test. In the study the chapter describes, the hint version avoided the harm but did not show a clear gain in the exam, so hints do not guarantee a higher score.",
};
