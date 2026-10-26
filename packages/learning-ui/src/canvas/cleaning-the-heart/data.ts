import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 09.03 "A clean heart".
// Envy, pride and hatred are sins of the heart that nobody sees. The Sunnah
// gives words and actions to clean them.
// See spec.md.
export const cleaningTheHeart: SequenceSpec = {
  kind: "sequence",
  title: "When a friend is promoted",
  purpose: "Follow Hamza when a colleague is promoted over him, and see how envy is met with sourced actions.",
  summary: "When Bilal is promoted, Hamza feels envy, recognises it, makes dua for Bilal, congratulates him sincerely, refuses to belittle him to others, and accepts feedback he did not like.",
  actors: [
    { name: "Hamza" },
    { name: "Bilal", sub: "promoted" },
    { name: "Others" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "promotion news",
      tone: "warn",
      outcome: "envy",
      title: "The feeling",
      note: "Bilal gets the promotion Hamza wanted. He feels a hot, small envy.",
    },
    {
      from: 0,
      to: 0,
      label: "names it",
      title: "He names it",
      note: "Do not envy one another, do not hate one another, do not turn your backs on one another; be servants of Allah, brothers (Sahih Muslim 2563).",
      chips: ["Sahih Muslim 2563"],
    },
    {
      from: 0,
      to: 1,
      label: "dua for him",
      tone: "good",
      title: "Dua for the person",
      note: "None of you believes until he loves for his brother what he loves for himself (Sahih al-Bukhari 13). He asks Allah to bless Bilal in his new role.",
      chips: ["Sahih al-Bukhari 13"],
    },
    {
      from: 0,
      to: 1,
      label: "congratulates",
      title: "Sincere words",
      note: "He congratulates Bilal in person, and means it more each time he says it.",
    },
    {
      from: 2,
      to: 0,
      label: "gossip invite",
      title: "No belittling",
      note: "A colleague says Bilal got it by luck. Hamza does not join. Pride is rejecting the truth and looking down on people (Sahih Muslim 91).",
      chips: ["Sahih Muslim 91"],
    },
    {
      from: 1,
      to: 0,
      label: "feedback",
      tone: "good",
      outcome: "accepted",
      title: "Accepting the truth",
      note: "In his first week, Bilal gives Hamza feedback on his code. It is fair, and it stings. Hamza accepts it. Rejecting the truth is the first sign of pride.",
    },
  ],
  tryThis: [
    "Before step 3, predict: what does the Sunnah tell you to want for the person you envy?",
    "Who in your life is easiest for you to envy? What dua could you make for them?",
  ],
  limits: "Feelings come uninvited; what you do with them is the habit. This canvas does not judge feelings, only actions. Healthy ambition is not envy; wanting the same good for yourself without wishing it gone from someone else is allowed.",
};
