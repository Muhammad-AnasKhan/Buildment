import type { SequenceSpec } from "../renderers/sequence/types";

// Building Habits That Last course, chapter 1.2 "What a habit is".
// Two moments in Rami's evening: picking up the phone goes from a situation
// (sitting down) straight to the action, while opening the study course goes
// through a deciding step every time, which often answers "later". See spec.md.
export const ramiDecideOrCue: SequenceSpec = {
  kind: "sequence",
  title: "Rami's evening: decide or cue?",
  purpose: "See why one action needs a decision every evening while the other starts by itself.",
  summary:
    "Rami sits down after dinner and his hand takes the phone with no deciding step, and 40 minutes pass. At 21:15 he thinks of the course and weighs it up, and the decision says later. On Thursday, with the lesson already open, the decision says yes and he studies for 40 minutes. The phone path never goes through deciding; the study path always does.",
  actors: [
    { name: "Rami", sub: "after dinner" },
    { name: "Deciding", sub: "weigh it up" },
    { name: "Study course", sub: "on the laptop" },
    { name: "Phone", sub: "in his pocket" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "sits down",
      title: "20:35: Rami sits down",
      note: "He carries his tea to the mattress in the room he shares with his brothers and sits down. Watch this moment: sitting down is the situation that matters.",
      chips: ["after dinner", "same mattress", "tea in hand"],
    },
    {
      from: 0,
      to: 3,
      label: "hand moves",
      tone: "warn",
      outcome: "no decision",
      title: "The phone: no question asked",
      note: "His hand takes the phone before he has a thought about it. There is no step where he weighs it up. Sitting down leads straight to the phone, as it has on hundreds of evenings.",
    },
    {
      from: 3,
      to: 0,
      label: "videos, messages",
      title: "40 minutes pass",
      note: "A video in a group chat, then another, then a message from his cousin. When he looks at the clock, it is 21:15.",
    },
    {
      from: 0,
      to: 1,
      label: "should I study?",
      title: "21:15: the course needs a decision",
      note: "Now he thinks of the course, and he weighs it up. Lesson 3 has a long exercise. He is a little tired. The power goes off at 23:00.",
      chips: ["long exercise", "a little tired", "power until 23:00"],
    },
    {
      from: 1,
      to: 0,
      label: "later",
      tone: "warn",
      outcome: "later",
      title: "The decision says later",
      note: "On a tired evening, later is the easy answer, and it feels reasonable. At 22:10 he opens the laptop, looks at the lesson and closes it again. Tomorrow, he says.",
    },
    {
      from: 1,
      to: 2,
      label: "yes: open lesson",
      tone: "good",
      outcome: "studied",
      title: "Thursday: the decision says yes",
      note: "On Thursday the laptop was already open at the right lesson, so the decision was quick and the answer was yes. He studied for 40 minutes. Even on a good evening, the study still went through the deciding step.",
    },
    {
      from: 0,
      to: 0,
      label: "compare",
      title: "Two paths, one difference",
      note: "The phone path has two arrows and no deciding. The study path stops at a question every time, and every question can be answered later. A habit would give study a start like the phone's: a situation that begins it.",
    },
  ],
  tryThis: [
    "Before you step through, recall your guess about how many of Rami's 23 phone pickups he chose. Then count the deciding steps on the phone path and on the study path.",
    "Before step 5, say what the deciding step will answer on a tired Tuesday. Then compare it with step 6, Thursday.",
  ],
  limits:
    "Real evenings are messier than seven arrows. Some phone use is a real choice, like a call to an uncle, and some studying feels easy on a good day. The stepper shows Rami's usual pattern, not every evening, and a habit only starts an action: the lesson itself still takes thought.",
};
