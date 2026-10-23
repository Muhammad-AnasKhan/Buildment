import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 3.4 "Make the AI quiz you".
// Lina first asks a chat assistant to explain TCP and UDP (it does the
// recall), then asks it to quiz her one question at a time, mixed, with hints
// before answers. A wrong answer becomes a note and two spaced reviews.
// See spec.md.
export const aiQuizPartner: SequenceSpec = {
  kind: "sequence",
  title: "Explain it, or quiz me?",
  purpose: "See who does the recall when you ask an AI to explain, and when you ask it to quiz you one question at a time.",
  summary:
    "Lina asks a chat assistant to explain TCP and UDP and reads a clear answer, producing nothing herself. Then she asks it to quiz her one question at a time and wait. She answers a video call question correctly, gets a file question wrong, and finds the right answer after a hint. She writes the miss in her notes and plans two reviews, three days and then a week apart.",
  actors: [
    { name: "Lina", sub: "networks exam" },
    { name: "Chat assistant", sub: "any one" },
    { name: "Her notes", sub: "TCP and UDP page" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "explain it again",
      tone: "warn",
      outcome: "AI did the recall",
      title: "Ask it to explain",
      note: "The chat assistant writes a clear, correct comparison of TCP and UDP. Lina reads every line. Each sentence makes sense, and she produced none of them.",
    },
    {
      from: 0,
      to: 1,
      label: "quiz me, then wait",
      title: "Ask it to quiz her",
      note: "She sends her saved prompt: TCP and UDP mixed, real cases, one question at a time, stop and wait, a hint before any answer, two sentences of feedback.",
      chips: ["one at a time", "hint first"],
    },
    {
      from: 1,
      to: 0,
      label: "Q: a video call?",
      title: "Question 1",
      note: "'A family video call between two cities: TCP or UDP, and why?' Nothing on the screen tells her. She has to recall the difference and apply it.",
    },
    {
      from: 0,
      to: 1,
      label: "UDP, and why",
      tone: "good",
      outcome: "right",
      title: "Her answer",
      note: "'UDP. A piece of video that arrives late is useless, so waiting to resend it would only add delay.' The chat assistant agrees in two sentences and asks the next question.",
    },
    {
      from: 1,
      to: 0,
      label: "Q: send a file?",
      tone: "warn",
      outcome: "wrong",
      title: "Question 2, mixed in",
      note: "'A student sends her project file to her lecturer: TCP or UDP?' Lina answers 'UDP, because it is faster.' She is choosing by speed, not by what the task needs.",
    },
    {
      from: 1,
      to: 0,
      label: "a hint, no answer",
      tone: "good",
      outcome: "right on try 2",
      title: "A hint, not the answer",
      note: "'What happens to the file if one piece never arrives?' Lina thinks: the file would be broken. She answers 'TCP, because every piece must arrive.' The reason is hers.",
    },
    {
      from: 0,
      to: 2,
      label: "log the miss",
      title: "The miss goes into her notes",
      note: "She writes the question, her wrong answer and the rule in her own words: 'A file needs every piece: TCP. A live call cannot wait: UDP.'",
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
    "Before step 2, predict who did the recall in step 1: Lina or the AI?",
    "At step 6, why does a hint help Lina more here than being told the answer?",
  ],
  limits:
    "The AI quiz partner can be wrong, so its answers are checked against Lina's lecture notes. Real networks are more complicated than this exam level: some newer protocols add reliable delivery on top of UDP. The review dates follow the course's rule of thumb, not an exact law.",
};
