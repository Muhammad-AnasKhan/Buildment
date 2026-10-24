import type { StateMachineSpec } from "../renderers/state-machine/types";

// Building Habits That Last course, chapter 5.4 "Slow results, slips and
// starting again". After Yousef misses two evenings helping his uncle move
// house, there are two roads: the harsh story "I failed, so why bother", which
// leads to giving up, and a kind restart plan with the smallest version at the
// next cue, which leads back to the habit. See spec.md.
export const slipOrGiveUp: StateMachineSpec = {
  kind: "state-machine",
  title: "After a missed day: two roads",
  purpose: "Follow both roads from a missed day, and see that the thought after the miss decides where the habit goes.",
  summary:
    "Yousef does his practice questions most evenings, then misses two evenings while helping his uncle move house. On one road he tells himself 'I failed, so why bother', gives up, and the gap grows. On the other road he is kind to himself, writes a restart plan, does the smallest version at the next cue, and is back to the full habit the day after. Even after giving up, a restart plan is still open.",
  states: [
    { id: "doing", name: "Doing the habit", sub: "20 min most days", col: 0, row: 0 },
    { id: "missed", name: "Missed a day", sub: "a slip", col: 1, row: 0 },
    { id: "failed", name: "Thinks: I failed", sub: "so why bother", col: 2, row: 0 },
    { id: "smallest", name: "Smallest version", sub: "5 questions", col: 0, row: 1 },
    { id: "plan", name: "Restart plan", sub: "kind, then a plan", col: 1, row: 1 },
    { id: "quit", name: "Gives up", sub: "the gap grows", col: 2, row: 1 },
  ],
  edges: [
    { from: "doing", to: "missed", label: "slip" },
    { from: "missed", to: "failed", label: "harsh story" },
    { from: "failed", to: "quit", label: "so" },
    { from: "missed", to: "plan", label: "or" },
    { from: "plan", to: "smallest", label: "next cue" },
    { from: "smallest", to: "doing", label: "and" },
    { from: "quit", to: "plan", label: "restart" },
  ],
  steps: [
    {
      state: "doing",
      edge: 0,
      title: "Eight weeks in",
      note: "Yousef does 20 minutes of practice questions after the evening meal on most days. On evenings with no power, he does 10 questions from his paper notebook.",
      chips: ["after the evening meal"],
    },
    {
      state: "missed",
      edge: 1,
      tone: "warn",
      outcome: "2 misses",
      title: "Two evenings away",
      note: "On Wednesday and Thursday he helps his uncle move house and gets home after 23:00. Two crosses on the card, with the note 'helping uncle move'. A slip is one or two missed days. What happens next is a choice.",
      chips: ["Wed: missed", "Thu: missed"],
    },
    {
      state: "failed",
      edge: 2,
      tone: "bad",
      outcome: "road 1",
      title: "Road 1: the harsh story",
      note: "He thinks: 'Two more misses. I will never pass this exam. Why bother?' The slip now feels like proof that he is a failure, and that makes stopping feel reasonable.",
    },
    {
      state: "quit",
      tone: "bad",
      outcome: "gap grows",
      title: "Giving up",
      note: "Friday passes, then Saturday. Each day without the habit makes the next start feel bigger. A slip was two days; giving up was a decision.",
      chips: ["each day, harder to start"],
    },
    {
      state: "missed",
      edge: 3,
      title: "Road 2: the same two misses",
      note: "Same Wednesday, same Thursday. This time he notices what happened without judging himself: 'I was helping my family. That is a real reason, not a failure.' Kind first, then a plan.",
    },
    {
      state: "plan",
      edge: 4,
      title: "The restart plan",
      note: "On Thursday night he writes one line on the card: 'Friday, after the evening meal: 5 questions, even if I am tired.' A small, sure step at the next cue, not a double session to catch up.",
      chips: ["when: after the meal", "what: 5 questions"],
    },
    {
      state: "smallest",
      edge: 5,
      tone: "good",
      outcome: "done",
      title: "Restart at the next cue",
      note: "Friday after the meal he does 5 questions. It takes about five minutes. The gap stays at two days.",
      chips: ["Fri: tick, smallest version"],
    },
    {
      state: "doing",
      tone: "good",
      outcome: "back",
      title: "Back to the full habit",
      note: "On Saturday he does the full 20 minutes. Looking back, the month shows two misses with a clear note, not a broken habit.",
    },
    {
      state: "plan",
      edge: 6,
      title: "Even after giving up",
      note: "Road 1 is not a dead end. A restart plan works after a long gap too. A new week can give a push, but the next cue comes sooner, and a shorter gap is easier to cross.",
      chips: ["new week: a push", "next cue: sooner"],
    },
  ],
  tryThis: [
    "Before step 6, predict which Friday plan gets Yousef back more surely: a double session to catch up, or 5 questions. Then check.",
    "Compare steps 3 and 5. The misses are the same. What is different?",
  ],
  limits:
    "Real restarts are not always this smooth: a restart can fail, and then you write a new plan and try again at the next cue. The idea of a slip versus giving up comes from work on helping people avoid relapse, and here it is used for everyday habits. Being kind to yourself does not mean ignoring the miss: notice the cause, then plan.",
};
