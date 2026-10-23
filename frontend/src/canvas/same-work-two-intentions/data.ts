import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course (faith-and-resilience), chapter 6.2 "Intention: why you
// do the work". One ordinary working day for Tariq on the language school's
// landing page, read under two aims: "finish the list and get paid", or
// "provide for my family, serve this client well and please Allah". The tasks
// are the same; the aim changes what the day is. No numbers are attached to
// reward (Sahih Muslim 130 is cited without its numbers). See spec.md.
export const sameWorkTwoIntentions: SequenceSpec = {
  kind: "sequence",
  title: "The same day, two intentions",
  purpose: "Step through one working day and see that the tasks stay the same while the aim changes what the day is.",
  summary:
    "Tariq sets his aim in the morning, builds a contact form for a language school, tells the client honestly that it needs one more day, loses his afternoon to a power cut, is paid $150 the next day, gives most of it to his mother for the household, and renews his aim in the evening. Under the aim 'only get paid', the same steps are just tasks. Under the aim 'provide, serve well, please Allah', they become worship.",
  actors: [
    { name: "Tariq", sub: "you" },
    { name: "The work", sub: "landing page" },
    { name: "Client", sub: "language school" },
    { name: "Family", sub: "his mother" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "morning aim",
      title: "Two possible aims for the same day",
      note: "Aim 1: 'finish the list and get paid.' Aim 2: 'provide for my family, serve this client well, and please Allah in how I earn.' Both aims lead to the same list of tasks today.",
      chips: ["aim 1: only get paid", "aim 2: provide, serve, please Allah"],
    },
    {
      from: 0,
      to: 1,
      label: "build the form",
      title: "The same task",
      note: "He builds the school's contact form. Under aim 1, it only has to work today. Under aim 2, doing it well is part of the aim itself, because Allah has prescribed excellence in everything (chapter 6.3). The code he writes is the same; the reason for his care is not.",
    },
    {
      from: 0,
      to: 2,
      label: "honest update",
      title: "The same message",
      note: "At noon he sees that the form needs one more day, and he tells the school at once, with a new time. Under aim 1, the message is a way to keep a paying client. Under aim 2, the same message is honesty, which is part of serving people well.",
    },
    {
      from: 0,
      to: 0,
      label: "power cut",
      tone: "warn",
      outcome: "work stops",
      title: "Stopped by something outside his control",
      note: "At 15:00 the power goes and does not come back that day. The planned work stops. Under aim 1, the afternoon is simply lost. Under aim 2, the good he intended still counts: whoever intends a good deed and does not do it, a good deed is written for him (Sahih Muslim 130).",
    },
    {
      from: 2,
      to: 0,
      label: "pays $150",
      tone: "good",
      outcome: "first half paid",
      title: "The same payment",
      note: "The next day he finishes the form, and the school pays the first half of the $300 fee: $150. The amount is the same under both aims.",
    },
    {
      from: 0,
      to: 3,
      label: "money for home",
      title: "The same money, spent on his family",
      note: "He gives most of it to his mother for the household. Under aim 1, it is just bills. Under aim 2, it is a good deed: whatever you spend seeking Allah's pleasure is rewarded, even the food you put in your wife's mouth (Sahih al-Bukhari 56).",
    },
    {
      from: 0,
      to: 0,
      label: "renew the aim",
      tone: "good",
      outcome: "worship",
      title: "Nothing in the tasks changed; the aim did",
      note: "In the evening he writes tomorrow's list and reads his intention line again. The tasks, the code, the message and the money were the same under both aims. What changed is what the day was for. Actions are by intentions, and each person has what he intended (Sahih al-Bukhari 1).",
    },
  ],
  tryThis: [
    "Before you start, predict: if two people do exactly the same work today, can the day still be different for them?",
    "At step 4, compare what the power cut costs under each aim.",
    "Pick one step and write the same task with your own aim beside it.",
  ],
  limits:
    "The canvas shows one ordinary day, and it keeps the tasks the same on purpose so that only the aim changes. In real life a good intention also changes choices, such as how much work you accept, which chapter 6.2 shows in prose. It does not measure reward or how sincere anyone is: only Allah knows that. Intention is not a test you can fail; you renew it and begin.",
};
