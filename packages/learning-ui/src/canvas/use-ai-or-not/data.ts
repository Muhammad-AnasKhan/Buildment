import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 11.4: whether to use AI depends on four facts about
// the task, not on the tool. Rules run in order and the first match wins:
// a costly mistake you cannot catch, then private data, then your own lesson,
// then a low-stakes task you cannot check. Everything else is a plain "use it".
// Sources: A62 (people must be able to decide not to use a system), chapters
// 1.6 (learning) and 2.2 (before you paste).

export const USE_AI_OR_NOT: ContextPickerConfig = {
  question: "Use AI for this task?",
  factors: [
    {
      id: "stakes",
      label: "If it is wrong",
      choices: [
        { id: "low", label: "Costs little" },
        { id: "high", label: "Costs a lot" },
      ],
    },
    {
      id: "check",
      label: "Can you check it?",
      choices: [
        { id: "can", label: "Yes, myself" },
        { id: "cannot", label: "No, I cannot" },
      ],
    },
    {
      id: "learning",
      label: "Is it your lesson?",
      choices: [
        { id: "need", label: "Need it done" },
        { id: "learn", label: "Learning it" },
      ],
    },
    {
      id: "data",
      label: "Private data?",
      choices: [
        { id: "none", label: "None" },
        { id: "private", label: "Yes" },
      ],
    },
  ],
  options: [
    { id: "use", label: "Use AI", sub: "then check it" },
    { id: "tutor", label: "Tutor only", sub: "hints and quizzes" },
    { id: "anon", label: "Anonymise", sub: "or do not paste" },
    { id: "self", label: "Do it yourself", sub: "or ask a person" },
  ],
  rules: [
    { when: { stakes: "high", check: "cannot" }, pick: "self", why: "A costly mistake you cannot catch. Do it yourself, or ask a person who can check." },
    { when: { data: "private" }, pick: "anon", why: "Real names, numbers and keys stay out. Use made-up ones, or do not paste." },
    { when: { learning: "learn" }, pick: "tutor", why: "You are learning this skill. Ask for hints and quizzes, and do the work yourself." },
    { when: { check: "cannot" }, pick: "use", why: "A wrong answer costs little. Treat the answer as a guess, not a fact." },
  ],
  fallback: { pick: "use", why: "You can check it, and nothing private or learned is at stake. Use it, then check." },
  start: { stakes: "low", check: "can", learning: "need", data: "none" },
  hint: "Tap a pill to change one fact and watch the answer move.",
};

export const useAiOrNot: CustomCanvasSpec = {
  kind: "custom",
  title: "Use AI or not?",
  purpose: "Change four facts about a task, how much a mistake costs, whether you can check it, whether it is your lesson and whether private data is in it, and see whether to use AI, use it as a tutor only, anonymise first or do it yourself.",
  limits:
    "Four facts and four answers are a simplification. Real tasks have more facts, a workplace or school may have its own rule that wins, and some tasks fit two answers. The rules are the course's own judgement, not a benchmark or a law, and they run in the order shown in the chapter.",
  component: makeContextPickerCanvas(USE_AI_OR_NOT),
};
