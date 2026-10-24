import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 2.4 "Habits that outlast any tool".
// One story with a turn: in March, Ahmad keeps a month of SQL study only in a
// free chat tool's history and loses it when the free tier changes; in May he
// copies what matters into his own notes and his repository, so a week without
// the tool in June costs him almost nothing. Fictional: no real tool deleted
// anyone's history. See spec.md.
export const keepWorkInYourFiles: SequenceSpec = {
  kind: "sequence",
  title: "Where does Ahmad's work live?",
  purpose: "See the same kind of tool change twice: once when the work lives only in a chat tool, once when it lives in files Ahmad owns.",
  summary:
    "In March, Ahmad studies SQL in a free chat tool and keeps a month of chats only in its history, then loses access when the free tier changes. In May, he copies what matters from each chat into his own notes the same day, and uploads them to his repository each week. So when the tool stops opening for a week in June, he carries on with a second tool and his own files.",
  actors: [
    { name: "Ahmad", sub: "you" },
    { name: "Chat tool", sub: "free tier" },
    { name: "His notes", sub: "notes app" },
    { name: "Repository", sub: "on GitHub" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "explain joins",
      title: "March: the old way",
      note: "Ahmad asks the chat tool to explain SQL joins with a small example about a school's students and classes, then to quiz him. The explanation is good. He answers the quiz and moves on.",
    },
    {
      from: 1,
      to: 1,
      label: "history only",
      tone: "warn",
      title: "A month in one place",
      note: "After a month, about 30 chats hold his whole course: the explanations, the quizzes and his wrong answers. Nothing is anywhere else. 'The chats are my notes,' he tells a friend.",
      chips: ["about 30 chats", "no other copy"],
    },
    {
      from: 1,
      to: 0,
      label: "sign in again",
      tone: "bad",
      outcome: "month lost",
      title: "The free tier changes",
      note: "Every free user must sign in again and confirm an email. The code goes to an old school address Ahmad cannot open. His chats are still there, in an account he cannot reach.",
    },
    {
      from: 0,
      to: 1,
      label: "explain indexes",
      title: "May: the new way",
      note: "He starts again with indexes, the topic he missed in the job test. He pastes his saved prompt and asks for an explanation and a quiz, the same as before. What changes is what happens after the chat.",
    },
    {
      from: 0,
      to: 2,
      label: "own-words copy",
      title: "Copy it out the same day",
      note: "Before he closes the chat, he spends about ten minutes in his notes app. He writes the question he asked, the example that helped, his wrong answer and why, and a summary in his own words. He does not paste the AI's text.",
      chips: ["indexes.md", "prompts that worked"],
    },
    {
      from: 2,
      to: 3,
      label: "weekly upload",
      tone: "good",
      outcome: "two copies",
      title: "Once a week, a second copy",
      note: "On Fridays, at a café with internet, he uploads the week's note files to his private GitHub repository. Each page now lives on his phone and in his repository, and both are his.",
      chips: ["sql-notes (private)"],
    },
    {
      from: 1,
      to: 0,
      label: "will not open",
      tone: "warn",
      outcome: "nothing lost",
      title: "June: the tool stops opening",
      note: "For a whole week, the chat tool will not open for him. His phone still works, and his notes app holds his pages and his saved prompt. He opens a second chat assistant, pastes them in, and carries on the same day. The repository is not needed this time: it protects him if he loses the phone.",
    },
    {
      from: 0,
      to: 3,
      label: "read his pages",
      tone: "good",
      title: "Before the next test",
      note: "Before his next SQL test, he reads his own pages and his list of wrong answers. The record he lost in March is the record he now keeps.",
    },
  ],
  tryThis: [
    "Go to step 7: when the tool will not open, Ahmad carries on from the notes app on his phone. The repository is not needed that week.",
    "Compare step 3 with step 7. The tool changed both times. What was different about where Ahmad's work lived?",
  ],
  limits:
    "This is one fictional story, and no real tool is being described. Copying out takes about ten minutes a day, and some days you will miss it; the weekly upload catches most of what matters. A repository keeps a second copy only if you can still sign in to it, so keep your own sign-in details up to date as well.",
};
