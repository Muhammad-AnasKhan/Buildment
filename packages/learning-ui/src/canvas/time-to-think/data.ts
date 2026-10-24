import type { SequenceSpec } from "../renderers/sequence/types";

// The Founder Interview course, chapter 6.4 "Nerves, accent and time to think".
// Nour is asked "How do you handle feedback?" on a video call. Answering at
// once costs her the answer; a short pause and "Do you mean...?" save it. One
// step shows a weak connection and how to ask for the question again.
// See spec.md.
export const timeToThink: SequenceSpec = {
  kind: "sequence",
  title: "Nour on a video call: time to think",
  purpose: "See what a short pause and a check question cost, and what answering at once can cost.",
  summary:
    "The hiring manager asks how Nour handles feedback. First she answers at once about the wrong kind of feedback and loses a minute. Then she tries again: she asks for a moment, checks what the manager means, answers with one short story, and later asks for a question to be repeated when the connection freezes.",
  actors: [
    { name: "Hiring manager", sub: "video call" },
    { name: "Nour", sub: "designer" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "asks a question",
      title: "The question",
      note: "The hiring manager asks: How do you handle feedback? The words can mean feedback Nour gives to clients, or feedback she gets on her work.",
    },
    {
      from: 1,
      to: 0,
      label: "answers at once",
      tone: "bad",
      outcome: "wrong question",
      title: "Version 1: answer at once",
      note: "Nour starts talking about how she gives clear feedback to clients. It takes about a minute in this example. She is answering a question the manager did not ask.",
    },
    {
      from: 0,
      to: 1,
      label: "I meant on you",
      tone: "warn",
      title: "The manager corrects her",
      note: "The manager says: I meant feedback on your work. The minute is gone, Nour feels more nervous, and her next answer starts from behind.",
    },
    {
      from: 1,
      to: 0,
      label: "let me think",
      tone: "good",
      title: "Version 2: ask for a moment",
      note: "Now the same question again. Nour says: Let me think for a moment. She waits about five seconds in this example. A short, planned pause is one sentence and a breath.",
    },
    {
      from: 1,
      to: 0,
      label: "do you mean...?",
      tone: "good",
      title: "Check what was asked",
      note: "She asks: Do you mean feedback I give to clients, or feedback I get on my work? The check takes a few seconds, and it makes sure she answers the right question.",
    },
    {
      from: 0,
      to: 1,
      label: "feedback on me",
      title: "The manager answers",
      note: "The manager says: Feedback you get on your work. Now Nour has the real question and has used the pause to choose one time to talk about.",
    },
    {
      from: 1,
      to: 0,
      label: "one short story",
      tone: "good",
      outcome: "right question",
      title: "A short answer, one idea per sentence",
      note: "A client said my first screens were too busy. I removed half of the buttons. They approved the second version. After that I show clients a rough version first. Short sentences are easier to say, and easier for the listener to follow.",
    },
    {
      from: 1,
      to: 0,
      label: "say it again?",
      tone: "good",
      outcome: "asked again",
      title: "When the connection freezes",
      note: "Later the video freezes in the middle of a question. Nour says: Sorry, the call froze after the word design. Could you say the question again? Asking is better than guessing the end of a question.",
    },
  ],
  tryThis: [
    "At step 2, what was the fastest thing Nour could say? Count how many seconds the pause in version 2 cost, and what the wrong answer cost.",
    "Write one check question you could use on your own call, starting with Do you mean.",
  ],
  limits:
    "The seconds are made up for this example. No study shows how an interviewer judges a candidate who asks for a question to be repeated. This is course advice: checking that you understood is better than answering the wrong question. A pause helps most when you also keep your sentences short.",
};
