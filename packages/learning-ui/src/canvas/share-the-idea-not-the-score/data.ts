import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 01.03 "Intention, and the fear of showing off".
// Hamza's tracker is going well, and he feels the pull to post a screenshot.
// Showing off (riya) is doing a deed so that people see it. The cure the
// sources point to is a checked intention, a private record, and sharing the
// way to good rather than your own score.
// See spec.md.
export const shareTheIdeaNotTheScore: SequenceSpec = {
  kind: "sequence",
  title: "Share the idea, not the score",
  purpose: "Follow one week of Hamza's tracker and see where showing off could creep in, and what he does instead.",
  summary: "Hamza ticks his tracker privately, feels the pull to post a screenshot of his streak, checks his intention, shares the one-habit-a-week idea with his friends without his own ticks, receives praise he did not ask for, and keeps his deeds going.",
  actors: [
    { name: "Hamza" },
    { name: "His tracker", sub: "private page" },
    { name: "Friends' group", sub: "chat" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "ticks, privately",
      title: "A record only he sees",
      note: "Each evening Hamza ticks the habits he did. The page is private. Among the seven people Allah shades on the Day of Judgement is one who gives charity so quietly that his left hand does not know what his right hand gave, and one who remembers Allah alone (Sahih al-Bukhari 1423).",
      chips: ["Sahih al-Bukhari 1423"],
    },
    {
      from: 0,
      to: 2,
      label: "post a screenshot?",
      tone: "warn",
      outcome: "the pull",
      title: "The pull to be seen",
      note: "Day 21: every box is green, and he wants to post the picture. He notices why: he wants people to say 'MashaAllah, Hamza'. The Prophet, peace be upon him, warned that whoever does a deed to be heard of or seen, Allah will expose him (Sahih al-Bukhari 6499).",
      chips: ["Sahih al-Bukhari 6499"],
    },
    {
      from: 0,
      to: 0,
      label: "who is it for?",
      title: "He checks his intention",
      note: "He asks himself one question: who is this for? Actions are judged by intentions, and each person gets what he intended (Sahih al-Bukhari 1). He renews his intention for Allah and does not post the picture.",
      chips: ["Sahih al-Bukhari 1"],
    },
    {
      from: 0,
      to: 2,
      label: "shares the idea",
      tone: "good",
      outcome: "the way to good",
      title: "He shares the idea, not his ticks",
      note: "He writes: 'I read that 1% a day adds up, so I am adding one Islamic habit a week. Try it.' No screenshot, no streak, no list of what he did. Whoever guides someone to good has a reward like the one who does it (Sahih Muslim 1893).",
      chips: ["Sahih Muslim 1893", "no score"],
    },
    {
      from: 2,
      to: 0,
      label: "a friend praises",
      title: "Praise he did not ask for",
      note: "A friend replies: 'You were always the one who prays on time.' Hamza did not seek this. When the Prophet was asked about a man who does good and people praise him for it, he said it is glad tidings for the believer given early (Sahih Muslim 2642).",
      chips: ["Sahih Muslim 2642"],
    },
    {
      from: 0,
      to: 1,
      label: "keeps going",
      tone: "good",
      outcome: "deed kept",
      title: "He does not stop the deed",
      note: "Hamza's fear of showing off does not make him quit praying in the mosque, where people can see him. The fix for a worried heart is a renewed intention, not an abandoned deed. He keeps the record private and the deeds going.",
    },
  ],
  tryThis: [
    "Before step 2, predict: is the danger in doing the deed where people can see it, or in why it is done?",
    "At step 4, compare what Hamza posts with what he did not post. Which part spreads the good, and which part would only show his score?",
  ],
  limits: "This shows one person and one chat group. Only Allah knows what is in a heart, so never use these steps to judge whether someone else is showing off. Praying in congregation is meant to be seen and is not showing off. Where you are unsure about your own intention, renew it and ask a scholar you trust.",
};
