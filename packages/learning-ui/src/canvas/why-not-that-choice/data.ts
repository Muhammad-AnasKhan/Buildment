import type { SequenceSpec } from "../renderers/sequence/types";

// The Founder Interview course, chapter 5.5 "Why this and not that".
// A technical founder asks Rana, who built a student carpool app, why she
// chose a managed database service and not a server she runs herself. The
// first answer is a label ("it is popular") and breaks at the next why. The
// second answer comes from a short decision note written at the time: the
// need, the rejected option, the cost to undo, and when to look again.
// The numbers belong to this example. See spec.md.
export const whyNotThatChoice: SequenceSpec = {
  kind: "sequence",
  title: "Why this service, and why not that one?",
  purpose: "See how a choice that rests on a label breaks at the next why, and how a short decision note makes the same choice hold.",
  summary:
    "A technical founder asks Rana why she used a managed database service and not a server she runs herself. Her first answer is that it is popular, and the founder asks popular for what. Her second answer comes from a decision note: the need, the option she rejected, how hard it is to undo, and when she would look at the choice again.",
  actors: [
    { name: "Technical founder", sub: "asks why not" },
    { name: "Candidate", sub: "Rana" },
    { name: "Decision note", sub: "written then" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "why this service?",
      title: "The question",
      note: "The technical founder of a small gym-booking team asks Rana about her student carpool app: Why a managed database service, and why not a server you run yourself? Before you press Next: what would you say first?",
    },
    {
      from: 1,
      to: 1,
      label: "it is popular",
      tone: "bad",
      outcome: "a label, no reason",
      title: "Answer 1: a label",
      note: "Rana says: It is popular. Everyone uses it. That is true, and it says nothing about her need. Before you press Next: what will the founder ask?",
    },
    {
      from: 0,
      to: 1,
      label: "popular for what?",
      tone: "warn",
      title: "The next why",
      note: "The founder asks: Popular for what need? Rana has no answer ready, because she never wrote one down. The choice may be sound, but she cannot show it. Before you press Next: where could a reason come from?",
    },
    {
      from: 1,
      to: 2,
      label: "open the note",
      title: "Try again, with the note",
      note: "Now the second try. When Rana chose the service, she wrote a decision note of three lines. She opens it before she answers. Before you press Next: what should the first line of the note say?",
    },
    {
      from: 2,
      to: 1,
      label: "need and options",
      tone: "good",
      title: "The need and the options",
      note: "The note says: Need: one part-time developer, small data, no time to run servers. Options: a server I run myself, or a managed service. Chose: the managed service. Before you press Next: what will the founder ask about the option she rejected?",
    },
    {
      from: 1,
      to: 0,
      label: "why not own server",
      tone: "good",
      title: "The rejected option, and why",
      note: "Rana says: A server of my own is cheaper each month. But it needs updates and backups, and I am the only developer. I rejected it because of my time, not because of the price. Before you press Next: what will the founder ask about changing later?",
    },
    {
      from: 0,
      to: 1,
      label: "how hard to undo?",
      title: "The cost to undo",
      note: "The founder asks: How hard is it to move away from this service? Before you press Next: which facts would you want in your note to answer that?",
    },
    {
      from: 1,
      to: 0,
      label: "3 days, 2 places",
      tone: "good",
      title: "An honest estimate",
      note: "Rana says: The data exports as files. My code uses the service's own special feature in 2 places. I think a move would take about 3 days. That is an estimate, and I have not tried it. Before you press Next: what else should the note hold?",
    },
    {
      from: 2,
      to: 0,
      label: "revisit trigger",
      tone: "good",
      outcome: "the choice holds",
      title: "When to look again",
      note: "The last line of the note: Look again if the monthly bill passes $50 or users pass 5,000. The founder now has a need, a rejected option, a cost to undo and a trigger. The choice holds at every why, even if the founder would have chosen differently.",
    },
  ],
  tryThis: [
    "At step 1, say your first sentence before you press Next. Then compare it with step 5. Does yours name a need?",
    "At step 2, would 'it is what I knew' be better than 'it is popular'? It is, when it is true. Say it plainly, and add whether it fitted the need.",
  ],
  limits:
    "This is one conversation, with numbers that belong to this example. A real technical founder may choose another option and still accept your answer, because the test is whether your choice fitted your need and whether you know its cost. Sometimes the honest answer is that the choice was wrong for the need. The note does not make a choice right. It makes your reasons visible.",
};
