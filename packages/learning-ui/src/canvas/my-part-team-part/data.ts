import type { SequenceSpec } from "../renderers/sequence/types";

// The Founder Interview course, chapter 1.3 "Your part and the team's".
// Under "What exactly did you do?", an answer that only says "we" draws the
// same question again and borrowed credit breaks at the second probe; an
// answer that names the team's work and then "my part was..." moves on.
export const myPartTeamPart: SequenceSpec = {
  kind: "sequence",
  title: "What exactly did you do?",
  purpose: "See how an answer that only says 'we' breaks at the second question, and how naming your own part moves the interview on.",
  summary:
    "The founder asks what Samer did on the dashboard. Samer lists the team's work, the founder asks which part was his, Samer claims all of it, and the founder asks who wrote the filters, so the claim breaks. Then Samer writes down what was only his in his notes, and next time he names the team's work, then his own part: noticing the address calls, building the check, choosing to flag, and checking after. The founder moves on to why.",
  actors: [
    { name: "Founder", sub: "asks" },
    { name: "Samer", sub: "answers" },
    { name: "Samer's notes", sub: "written before" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "what did you do?",
      title: "The question",
      note: "The founder asks, 'What exactly did you do on the dashboard?'",
    },
    {
      from: 1,
      to: 1,
      label: "list team work",
      tone: "warn",
      outcome: "only 'we'",
      title: "Samer lists what the team built",
      note: "He says, 'We built the map, the filters and the delivery list.' Every word is true. None of it says what Samer did.",
      chips: ["we built", "the team built"],
    },
    {
      from: 0,
      to: 1,
      label: "whose part?",
      title: "The same question again",
      note: "The founder asks, 'Which of those did you build?' This is the same question in smaller words.",
    },
    {
      from: 1,
      to: 1,
      label: "claim it all",
      tone: "bad",
      outcome: "borrowed credit",
      title: "Samer claims all of it",
      note: "Worried about sounding small, Samer says, 'I worked on all of it.' Answering with other people's work is called borrowing. Researchers who study faking in interviews name it as one kind of faking.",
    },
    {
      from: 0,
      to: 1,
      label: "who wrote filters?",
      tone: "bad",
      outcome: "claim breaks",
      title: "The second probe",
      note: "The founder asks one check question: 'Who wrote the filter code?' Samer has to say, 'A teammate.' The claim breaks, and the founder now doubts the other parts of the answer too.",
    },
    {
      from: 1,
      to: 2,
      label: "write my part",
      tone: "good",
      title: "Before the next interview",
      note: "Samer writes the project in two columns: what the team did and what only he did. His column holds four things: he noticed the address calls, he built the check, he chose to flag and not block, and he checked the call sheet after.",
      chips: ["noticed", "built", "chose", "checked after"],
    },
    {
      from: 2,
      to: 1,
      label: "ready to say",
      tone: "good",
      title: "The notes give him the words",
      note: "With the two columns in front of him, Samer does not need to guess in the interview. The line between the team's work and his own is already clear.",
    },
    {
      from: 1,
      to: 0,
      label: "team, then mine",
      tone: "good",
      outcome: "clear line",
      title: "The strong answer",
      note: "He says, 'The team of four built the dashboard. My part was the address check on the order screen. I saw that drivers phoned dispatch about addresses, I built the check, I chose to flag bad addresses and not block them, and I checked the call sheet after.'",
      chips: ["we for the team", "I for my part"],
    },
    {
      from: 0,
      to: 1,
      label: "why flag?",
      tone: "good",
      outcome: "moves on",
      title: "The interview moves forward",
      note: "The founder asks, 'Why flag and not block?' This is a new question, about a decision. A clear line between 'we' and 'I' gave him a place to go next.",
    },
  ],
  tryThis: [
    "At step 4, say what the founder asks next if Samer claims all of it. Then check step 5.",
    "At step 8, find the one sentence that says what the team did and the one that says what Samer did.",
  ],
  limits:
    "This is one conversation, and Samer's notes are what he prepared before. A real founder may ask different second questions. The point holds in general: a claim you cannot support breaks under a small check question, and a clear line between 'we' and 'I' does not.",
};
