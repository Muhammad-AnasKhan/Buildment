import type { StateMachineSpec } from "../renderers/state-machine/types";

// Course 13 v2, chapter 9.3: the short lesson loop. Murad (fictional) has 15
// minutes before a client call about an API. He asks for a lesson with a plan,
// takes a quiz, checks one claim against the API's own documentation, and
// writes his notes in his own words. The machine refuses "paste the summary as
// notes" and "skip the check". Dossier: C20 and C21 (study tools can be
// wrong), C14 to C18 as reused from v1 3.4 and 3.5. See spec.md.
export const shortLessonLoop: StateMachineSpec = {
  kind: "state-machine",
  title: "A short lesson, checked",
  purpose: "Follow one short AI lesson from the request to notes in your own words, and see which two shortcuts the machine refuses.",
  summary:
    "Murad asks an assistant for a 15-minute lesson on how a web API request and response work, with a plan, three checks and sources to read. Pasting the lesson summary in as notes is refused. He takes the lesson, then answers a quiz one question at a time and gets 3 of 3. Skipping the check is refused. He picks one claim, that a 404 status means the server crashed, and compares it with the API's own documentation, which says 404 means not found. He writes five lines in his own words, with the page name and the date.",
  states: [
    { id: "ask", name: "Ask", sub: "plan, 3 checks", col: 0, row: 0 },
    { id: "lesson", name: "Lesson", sub: "read or listen", col: 1, row: 0 },
    { id: "quiz", name: "Quiz", sub: "you answer first", col: 2, row: 0 },
    { id: "check", name: "Check", sub: "one claim", col: 1, row: 1 },
    { id: "notes", name: "Your notes", sub: "your own words", col: 0, row: 1 },
  ],
  edges: [
    { from: "ask", to: "lesson", label: "get lesson" },
    { from: "lesson", to: "quiz", label: "quiz" },
    { from: "quiz", to: "check", label: "pick" },
    { from: "check", to: "notes", label: "write it" },
    { from: "lesson", to: "lesson", label: "paste as notes", kind: "rejected" },
    { from: "quiz", to: "quiz", label: "skip check", kind: "rejected" },
  ],
  steps: [
    {
      state: "ask",
      title: "Ask for a plan, not a wall of text",
      note: "Murad has a call on Thursday where a client will talk about their API. He has 15 minutes tonight. He asks an assistant for a 15-minute lesson on how a request and a response work, with a plan, three checks at the end and the sources he should read.",
      chips: ["15 minutes", "a plan", "3 checks", "sources"],
    },
    {
      state: "lesson",
      edge: 0,
      title: "The lesson arrives",
      note: "The assistant gives a plan in three parts: what a request is, what a response is, and what status codes mean. It lists two sources, one of them the client's own API documentation. Murad reads it in about eight minutes. It reads clearly, and that is exactly why he is careful.",
      chips: ["3 parts", "2 sources"],
    },
    {
      state: "lesson",
      edge: 4,
      tone: "bad",
      outcome: "refused",
      title: "Paste it as your notes? No.",
      note: "The machine refuses this move. The summary is the assistant's words, not Murad's, and nobody has checked it. Notes pasted from a lesson feel finished, but they hold only what the assistant said.",
    },
    {
      state: "quiz",
      edge: 1,
      title: "The assistant quizzes him",
      note: "Murad asks for the three checks one at a time and answers each before he sees the reply. He answers 3 of 3. That feels like proof that the lesson is right.",
      chips: ["one question at a time", "3 of 3"],
    },
    {
      state: "quiz",
      edge: 5,
      tone: "bad",
      outcome: "refused",
      title: "Skip the check? No.",
      note: "The machine refuses this move too. The quiz came from the same lesson, so it can repeat the lesson's mistakes. A full score shows that Murad understood the lesson. It does not show that the lesson is true.",
    },
    {
      state: "check",
      edge: 2,
      title: "He picks one claim",
      note: "Murad chooses a claim he would repeat to the client: 'a 404 status means the server has crashed'. He opens the API's own documentation instead of asking the assistant 'are you sure?'.",
      chips: ["one claim", "primary page"],
    },
    {
      state: "check",
      tone: "warn",
      outcome: "mistake found",
      title: "The lesson was wrong",
      note: "The documentation says a 404 status means the thing he asked for was not found. A server that has crashed is a different problem. The lesson, and the quiz made from it, had a mistake that Murad would have repeated on the call.",
      chips: ["404 means not found"],
    },
    {
      state: "notes",
      edge: 3,
      tone: "good",
      outcome: "kept",
      title: "He writes it in his own words",
      note: "Murad writes five lines in his own words. One of them is the corrected 404 line, with the name of the documentation page and the date he read it. The lesson was a map. The documentation was the land.",
      chips: ["5 lines", "page name", "date"],
    },
  ],
  tryThis: [
    "Step 4 shows the quiz score, and step 7 shows what the check found. Can a lesson be wrong while the quiz is all right?",
    "Look at the two refused moves. What would each one have cost Murad on Thursday?",
    "Which claim would you check in a lesson of your own, and which page would you open?",
  ],
  limits:
    "A real lesson has many claims, and you cannot check them all in 15 minutes. The machine shows one check, because one is the habit to build. The mistake in this lesson is made up for the example. Real lessons are often right, and the check is for the cases where they are not.",
};
