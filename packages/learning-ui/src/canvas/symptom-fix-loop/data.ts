import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 4.2 "Symptoms and root causes".
// Amal's family tries two symptom fixes and the late deliveries come back each
// time; checking the chain finds the link everything depends on. Every number
// matches the chapter and the five-whys-chain canvas. See spec.md.
export const symptomFixLoop: StateMachineSpec = {
  kind: "state-machine",
  title: "Why do the late deliveries keep coming back?",
  purpose: "See how fixes aimed at what you can see bring a better week and then the same problem, and how checking the chain finds a link deeper down.",
  summary:
    "The round is late on 11 of 20 delivery days. Telling Hani to hurry gives a better week, then the late days return. Free bread quietens complaints, but the round is still late. Checking the delivery log and watching three mornings shows Hani leaves after 13:00 because the bags are ready only at about 12:45, a link deeper than any fix the family tried.",
  states: [
    { id: "late", name: "Deliveries late", sub: "11 of 20 days", col: 0, row: 0 },
    { id: "fix", name: "Symptom fix", sub: "hurry, free bread", col: 1, row: 0 },
    { id: "calm", name: "A better week", sub: "fewer late days", col: 2, row: 0 },
    { id: "back", name: "Late again", sub: "cause untouched", col: 2, row: 1 },
    { id: "check", name: "Check the chain", sub: "log, watch, ask", col: 1, row: 1 },
    { id: "deeper", name: "Bags late", sub: "ready at 12:45", col: 0, row: 1 },
  ],
  edges: [
    { from: "late", to: "fix", label: "quick fix" },
    { from: "fix", to: "calm", label: "for a week" },
    { from: "calm", to: "back", label: "but" },
    { from: "back", to: "check", label: "ask why" },
    { from: "check", to: "deeper", label: "found" },
  ],
  steps: [
    {
      state: "late",
      edge: 0,
      title: "The problem",
      note: "Hani rides one delivery round a day. Over the last 20 delivery days, the round arrived after 14:00, the time the shop promises, on 11 days.",
      chips: ["late on 11 of 20 days", "promised by 14:00"],
    },
    {
      state: "fix",
      edge: 1,
      title: "Quick fix 1: tell Hani to hurry",
      note: "Mahmoud tells Hani to ride faster and stop chatting. Riding faster might save ten minutes on a round of about an hour.",
    },
    {
      state: "calm",
      edge: 2,
      title: "A better week",
      note: "For about a week, fewer rounds are late. Ten minutes moves a few deliveries to just before 14:00.",
    },
    {
      state: "back",
      tone: "bad",
      outcome: "late again",
      title: "The late days come back",
      note: "Hani still leaves after 13:00, so most of the problem stays. The fix touched the ride, not why the ride starts late.",
    },
    {
      state: "fix",
      title: "Quick fix 2: free bread",
      note: "Late customers get a free bag of bread with their next order: about 75 shekels in 20 delivery days. Complaints get quieter.",
    },
    {
      state: "back",
      edge: 3,
      tone: "bad",
      outcome: "still late",
      title: "Quieter, but still late",
      note: "The bread treats the complaints, the outer symptom. The round is just as late as before.",
    },
    {
      state: "check",
      edge: 4,
      title: "Ask why, and check",
      note: "Amal stops guessing. The delivery log shows Hani leaves after 13:00 on most days. She watches three mornings: each time, the packing ends at about 12:45, and Hani cannot leave before that.",
      chips: ["evidence: delivery log", "evidence: three mornings"],
    },
    {
      state: "deeper",
      tone: "good",
      outcome: "a deeper link",
      title: "The link the chain depends on",
      note: "Hani leaving late is a cause of the late deliveries and the effect of the bags not being ready. No fix so far reached the bags. Why they are late is the next question.",
    },
  ],
  tryThis: [
    "Before the 'Check the chain' step, predict: is 'Hani leaves after 13:00' the root cause, or the effect of something earlier?",
    "Count how many times the path reaches 'Late again'. What did both quick fixes have in common?",
  ],
  limits:
    "The loop is simplified: real symptom fixes can help for longer or shorter than a week, and some are worth keeping while you look for the cause. The bottom link here is still not the root cause; it only shows where to dig next. Real problems often have more than one cause.",
};
