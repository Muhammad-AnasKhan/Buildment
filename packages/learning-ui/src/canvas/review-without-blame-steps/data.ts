import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 8.2 "Reviews without blame".
// The Young Coders Club review of the lost sign-ups: timeline, impact, causes
// in steps, tools and information (a cause that ends at a person is refused),
// actions, one owner and one date each, and a check later. See spec.md.
export const reviewWithoutBlameSteps: StateMachineSpec = {
  kind: "state-machine",
  title: "A review without blame, step by step",
  purpose: "Move through a review from the timeline to causes in steps, tools and information, to actions that each have an owner and a date.",
  summary:
    "Ruba writes the timeline first, then the impact: about 140 sign-ups lost. A cause that ends at Wael is refused. Three causes are found. The new date lived only in a chat. The delete button sat on a page that hid the entries and gave no count. And nobody kept a copy of the entries. Strong actions follow, each with one owner and one date, and Ruba checks them on their dates.",
  states: [
    { id: "timeline", name: "Timeline", sub: "facts in order", col: 0, row: 0 },
    { id: "impact", name: "Impact", sub: "about 140 lost", col: 1, row: 0 },
    { id: "causes", name: "Causes", sub: "steps, tools, info", col: 2, row: 0 },
    { id: "actions", name: "Actions", sub: "strong fixes first", col: 2, row: 1 },
    { id: "owners", name: "Owner and date", sub: "one of each", col: 1, row: 1 },
    { id: "check", name: "Check later", sub: "weekly call", col: 0, row: 1 },
  ],
  edges: [
    { from: "timeline", to: "impact", label: "then" },
    { from: "impact", to: "causes", label: "why?" },
    { from: "causes", to: "causes", label: "who did it?", kind: "rejected" },
    { from: "causes", to: "actions", label: "fix" },
    { from: "actions", to: "owners", label: "who, when" },
    { from: "owners", to: "check", label: "on the date" },
  ],
  steps: [
    {
      state: "timeline",
      edge: 0,
      title: "Start with the timeline",
      note: "Ruba builds it from the team chat, the task list and Wael's account, before anyone explains anything. A plain timeline keeps everyone looking at the same facts.",
      chips: ["Tue 3rd: form built", "Thu 5th: date moved", "Sun 8th: form posted", "Sun 15th: delete all"],
    },
    {
      state: "impact",
      edge: 1,
      title: "The impact",
      note: "About 140 sign-ups were lost. 95 young people signed up again within four days. About 45 lost their chance, because the team had no way to contact them.",
      chips: ["about 140 lost", "95 back", "about 45 not reached"],
    },
    {
      state: "causes",
      edge: 2,
      tone: "bad",
      outcome: "refused",
      title: "A cause that ends at a person",
      note: "'Wael should have checked the chat before deleting anything.' The only fix for this is asking Wael to be more careful, and it does not protect the next volunteer. The review does not stop here.",
    },
    {
      state: "causes",
      title: "Three branches of causes",
      note: "Information: the new date lived only in a chat, and the task list kept the old one. Tool: 'Delete all' sat on a settings page that hid the entries, and its warning gave no count. Safety net: nobody kept a copy of the entries.",
      chips: ["info: date only in chat", "tool: no count shown", "no copy of entries"],
    },
    {
      state: "actions",
      edge: 3,
      title: "What will change",
      note: "Strong: test on a separate copy of the form, so the live form never holds test entries. Strong: save a copy of all entries every evening. Middle: all dates live only in the task list. 'Remind everyone to be careful' is rejected as the only action.",
    },
    {
      state: "owners",
      edge: 4,
      title: "One owner and one date for each action",
      note: "An action with no owner and no date does not happen. Each one gets a single person and a day.",
      chips: ["Wael: test copy, before next course", "Nadia: daily copy, end of month", "Ruba: dates, next week"],
    },
    {
      state: "check",
      edge: 5,
      tone: "good",
      outcome: "checked",
      title: "Check later that each action happened",
      note: "Ruba checks each action on its date, at the start of the team's weekly call. A review whose actions never happen is only a story about the past.",
    },
  ],
  tryThis: [
    "Before step 3, predict which cause statement the review keeps: 'Wael should have checked the chat' or 'the task list kept the old date'.",
    "At step 6, cover the owners. Which action would still happen if nobody owned it?",
  ],
  limits:
    "Real reviews are messier: people remember events differently, and some causes only appear after several conversations. This review is about honest mistakes. Deliberate or reckless harm is handled separately, although the review of the system still happens.",
};
