import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 3.4 "Make the AI quiz you".
// Lina first asks a chat assistant to explain two library loan rules, laptops
// and books (it does the recall), then asks it to quiz her one question at a
// time, mixed, with hints before answers. A wrong answer becomes a note and
// two spaced reviews. The book rule is invented, like the laptop rule.
// See spec.md.
export const aiQuizPartner: SequenceSpec = {
  kind: "sequence",
  title: "Explain it, or quiz me?",
  purpose: "See who does the recall when you ask an AI to explain, and when you ask it to quiz you one question at a time.",
  summary:
    "Lina asks a chat assistant to explain the library's laptop rule and book rule and reads a clear answer, producing nothing herself. Then she asks it to quiz her one question at a time and wait. She answers a late book question correctly, gets a late laptop question wrong, and finds the right answer after a hint. She writes the miss in her notes and plans two reviews, three days and then a week apart.",
  actors: [
    { name: "Lina", sub: "library rules" },
    { name: "Chat assistant", sub: "any one" },
    { name: "Her notes", sub: "loan rules page" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "explain it again",
      tone: "warn",
      outcome: "AI did the recall",
      title: "Ask it to explain",
      note: "The chat assistant writes a clear, correct comparison of the laptop rule and the book rule. Lina reads every line. Each sentence makes sense, and she produced none of them.",
    },
    {
      from: 0,
      to: 1,
      label: "quiz me, then wait",
      title: "Ask it to quiz her",
      note: "She sends her saved prompt: the two rules mixed, real cases, one question at a time, stop and wait, a hint before any answer, two sentences of feedback.",
      chips: ["one at a time", "hint first"],
    },
    {
      from: 1,
      to: 0,
      label: "Q: a late book?",
      title: "Question 1",
      note: "'A member returns a book 3 days late. What happens?' Nothing on the screen tells her. She has to recall the rule and apply it.",
    },
    {
      from: 0,
      to: 1,
      label: "3 shekels, why",
      tone: "good",
      outcome: "right",
      title: "Her answer",
      note: "'She pays 3 shekels, one for each day, because late books have a fine.' The chat assistant agrees in two sentences and asks the next question.",
    },
    {
      from: 1,
      to: 0,
      label: "Q: a late laptop?",
      tone: "warn",
      outcome: "wrong",
      title: "Question 2, mixed in",
      note: "'A member returns a laptop 3 days late. What happens?' Lina answers 'She pays 3 shekels, because late means a fine.' She is carrying a habit from the book rule to the laptop rule.",
    },
    {
      from: 1,
      to: 0,
      label: "a hint, no answer",
      tone: "good",
      outcome: "right on try 2",
      title: "A hint, not the answer",
      note: "'The library has six laptops and forty members. What does a late laptop cost the next member?' Lina thinks: the next member has to wait. She answers 'No fine. She cannot borrow a laptop for 3 days.' The reason is hers.",
    },
    {
      from: 0,
      to: 2,
      label: "log the miss",
      title: "The miss goes into her notes",
      note: "She writes the question, her wrong answer and the rule in her own words: 'Late book: 1 shekel a day. Late laptop: no fine, but no laptop for as many days as I was late.'",
    },
    {
      from: 0,
      to: 2,
      label: "plan 2 reviews",
      tone: "good",
      outcome: "spaced",
      title: "Reviews days apart",
      note: "She writes two dates on the page: Wednesday, three days away, and the Wednesday after. Each time, a new mixed quiz that starts with the question she missed.",
      chips: ["Wednesday", "next Wednesday"],
    },
  ],
  tryThis: [
    "Compare steps 4 and 5: a right answer for the late book, then 'a fine' for the late laptop. Read what the hint in step 6 changes.",
    "Look at step 1 again. Who produced the answer there, Lina or the AI?",
  ],
  limits:
    "The AI quiz partner can be wrong, so its answers are checked against the library's rule sheets. Both rules are invented for this example, and a real library may differ. The review dates follow the course's rule of thumb, not an exact law.",
};
