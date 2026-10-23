import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 6.2 "From a week of commits to an
// article". Salma turns week 6 of her lab log (labs 26 to 30, the double
// booking in lab 27) into a write-up in her own voice, uses a chat assistant
// as an editor, catches the one fact the edit changed, and adapts the
// write-up for LinkedIn and DEV. See spec.md.
export const commitsToArticle: SequenceSpec = {
  kind: "sequence",
  title: "From Salma's week 6 log to two posts",
  purpose: "See how a week of lab logs becomes a write-up in your own voice, where AI helps as an editor, and why every fact is checked against the repository.",
  summary:
    "Salma reads her week 6 log and picks one story, the double booking from lab 27. She drafts the write-up in her own words as a file in her repository. She asks a chat assistant to edit it without adding facts. The edit improves the grammar and asks three good questions, but changes 'tested with 20 requests at once' into 'handles hundreds of bookings a second'. She checks every fact against her test file, puts her own sentence back, answers the questions and adds an AI-use line. Then she adapts the write-up: a short LinkedIn post with a link, and the full post on DEV marked as AI-assisted.",
  actors: [
    { name: "Salma", sub: "you" },
    { name: "Repository", sub: "log and tests" },
    { name: "Chat assistant", sub: "editor" },
    { name: "Platforms", sub: "LinkedIn, DEV" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "read week 6",
      title: "Start from the log",
      note: "Salma reads her five entries for week 6, labs 26 to 30. She picks one story for the week: lab 27, where two members booked pitch 1 for 18:00 at the same second and both were accepted. One clear story beats five short summaries.",
      chips: ["labs 26 to 30", "one story: lab 27"],
    },
    {
      from: 0,
      to: 0,
      label: "draft it herself",
      title: "Draft in her own voice",
      note: "She writes posts/week-06.md in her repository: what she built, what broke, what she learned, what is next. Every number comes from the log, such as her test of 20 requests at once. The draft is about 650 words.",
      chips: ["posts/week-06.md", "about 650 words"],
    },
    {
      from: 0,
      to: 2,
      label: "edit, no new facts",
      title: "Ask for an editor, not an author",
      note: "She gives the chat assistant her finished draft. She asks it to fix grammar and unclear sentences, to add no facts, numbers or claims, and to ask her three questions where a new reader would be lost.",
    },
    {
      from: 2,
      to: 0,
      label: "edits, 3 questions",
      tone: "warn",
      outcome: "one new claim",
      title: "The edit comes back",
      note: "The grammar is better, and the questions find real gaps, such as what 'the same second' means to someone who has never built an API. But one sentence has changed. 'I tested it with 20 requests at once' now says 'it handles hundreds of bookings a second'. She never tested that.",
      chips: ["before: 20 requests at once", "after: hundreds a second"],
    },
    {
      from: 0,
      to: 1,
      label: "check each fact",
      tone: "good",
      outcome: "20, not hundreds",
      title: "Check every fact against the repository",
      note: "She checks each number and claim in the edited draft against her commits and her test file. The test sends 20 requests for the same hour, and exactly 1 is accepted. Her own sentence goes back in.",
      chips: ["20 requests", "1 accepted", "19 refused"],
    },
    {
      from: 0,
      to: 0,
      label: "add AI-use line",
      title: "Answer the questions in her own words",
      note: "She answers the three questions in her own words and adds them to the draft. At the end she adds one AI-use line: which tool helped, what it did, and what she checked.",
    },
    {
      from: 0,
      to: 3,
      label: "adapt for two",
      tone: "good",
      outcome: "same facts",
      title: "Adapt it for two platforms",
      note: "LinkedIn gets a short version, about 120 words, with a link to the full file. DEV gets the full post with headings and the test code, marked as AI-assisted. The length and format change. The facts do not.",
      chips: ["LinkedIn: about 120 words", "DEV: full, AI-assisted"],
    },
  ],
  tryThis: [
    "Before step 3, predict: should Salma ask a chat assistant to edit her draft at all? Then see what the edit brings back.",
    "At step 4, find the one sentence that changed a fact. Which file in her repository proves it wrong?",
  ],
  limits:
    "Here the edit changed one fact, and Salma caught it because her test file held the real number. Real edits can also change meaning quietly, with a stronger word or a missing 'sometimes', so read every changed sentence. The platform labels in step 7 were checked on 2026-10-24 and can change.",
};
