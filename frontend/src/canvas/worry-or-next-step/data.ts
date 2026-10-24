import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course, chapter 1.2 "What you know and what only Allah knows".
// Yasmin turns a loop of worry into one step for today: she writes down six
// questions, sorts out the five only Allah knows, finds the part next to each
// one that is hers, and picks one step. The last step shows what happens when
// she skips the sort. Every fact matches the chapter. See spec.md.
export const worryOrNextStep: StateMachineSpec = {
  kind: "state-machine",
  title: "From a worry loop to one step for today",
  purpose: "Sort a worrying week into what only Allah knows and what is yours to do, and see how the sort leads to one step.",
  summary:
    "Yasmin is stuck in a loop of checking messages and imagining the worst. She writes down six questions. Five of them only Allah knows: when the client will reply, whether he likes the draft, whether he will pay the second $200, the scholarship result and tomorrow's power hours. Next to each one is a part that is hers: a polite follow-up, calm changes if he asks, preparing for an interview, asking about the power schedule and applying for new work. She picks one step for today, sends the follow-up at 10:00 and leaves the rest with Allah in dua. Skipping the sort sends her back into the loop.",
  states: [
    { id: "loop", name: "Worry loop", sub: "check, imagine, again", col: 0, row: 0 },
    { id: "list", name: "Write it down", sub: "six questions", col: 1, row: 0 },
    { id: "unseen", name: "Only Allah knows", sub: "five of the six", col: 2, row: 0 },
    { id: "mine", name: "Mine to do", sub: "the part next to each", col: 2, row: 1 },
    { id: "step", name: "Today's step", sub: "one, small, now", col: 1, row: 1 },
    { id: "done", name: "Step taken", sub: "the rest in dua", col: 0, row: 1 },
  ],
  edges: [
    { from: "loop", to: "list", label: "stop, list" },
    { from: "list", to: "unseen", label: "sort" },
    { from: "unseen", to: "mine", label: "and" },
    { from: "mine", to: "step", label: "pick one" },
    { from: "step", to: "done", label: "do it" },
  ],
  steps: [
    {
      state: "loop",
      edge: 0,
      title: "The loop",
      note: "Yasmin sent a first draft to her client a week ago, on Sunday. He has still not replied. She checks her messages, imagines the worst and checks again. Each turn of the loop uses up power hours and asks the same question nobody can answer yet.",
      chips: ["client silent for 7 days", "about 6 hours of power a day"],
    },
    {
      state: "list",
      edge: 1,
      title: "Write every question down",
      note: "She writes six questions in her notebook. When will he reply? Does he like the draft? Will he pay the second $200? Will I get the scholarship? When will the power come tomorrow? Should I look for new work while I wait?",
    },
    {
      state: "unseen",
      edge: 2,
      title: "Sort: what only Allah knows",
      note: "Five of the six questions are about the unseen. Nobody on earth can answer them today, not even the client. Allah holds the keys of the unseen, and only He knows them (Quran 6:59). These five she leaves with Allah, and she asks Him for good in each.",
      chips: ["the reply", "his opinion", "the $200", "the result", "the power"],
    },
    {
      state: "mine",
      edge: 3,
      title: "Find the part that is hers",
      note: "Next to each unknown there is something she can do. She can send one polite follow-up. She can be ready to make changes calmly if he asks. She can prepare notes for a possible scholarship interview. She can ask her neighbours for this week's power schedule. And the sixth question is hers to answer: yes, she can apply for new work now.",
    },
    {
      state: "step",
      edge: 4,
      title: "Pick one step for today",
      note: "She does not try to do everything at once. Today's step is one short, polite follow-up message, sent at 10:00 while the power is on. Tomorrow's step is two proposals for new work.",
      chips: ["follow-up at 10:00", "two proposals tomorrow"],
    },
    {
      state: "done",
      tone: "good",
      outcome: "one step taken",
      title: "Step taken, the rest in dua",
      note: "The message is sent. The client's reply is still unknown, but her day is no longer about checking. She has done her part for today, and she leaves the rest with Allah in dua.",
    },
    {
      state: "loop",
      tone: "bad",
      outcome: "back in the loop",
      title: "What happens without the sort",
      note: "If she tries to answer the five unseen questions herself, by guessing and checking, she goes straight back into the loop. The questions have no answer today, so the loop has no exit.",
    },
  ],
  tryThis: [
    "Recall your prediction about Rami. At step 4, check: does each of Yasmin's unseen questions have a part next to it that is hers?",
    "Pick one question from step 3. Which part in step 4 sits next to it?",
  ],
  limits:
    "Real weeks are messier: some questions are partly known and partly unseen, and some steps take more than a day. The sort does not remove the worry at once. It gives the worry somewhere to go: the unseen part to Allah in dua, and the rest into a step.",
};
