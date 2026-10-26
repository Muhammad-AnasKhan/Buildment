import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 13.03 "Learning".
// Seeking knowledge is a path to Paradise in the Sunnah. A daily learning
// habit is small: something new, a question, a page, and acting on what you
// learn.
// See spec.md.
export const learningEveryDay: SequenceSpec = {
  kind: "sequence",
  title: "Something new every day",
  purpose: "Follow one learner's week and see the sourced habits that make learning steady.",
  summary: "Musa reads ten pages of a book, asks his teacher one question, says 'I don't know' instead of guessing, does his homework on time, and applies one thing he learned.",
  actors: [
    { name: "Musa" },
    { name: "Books, teacher" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "ten pages",
      title: "A daily page",
      note: "Whoever takes a path seeking knowledge, Allah makes easy for him a path to Paradise (Sahih Muslim 2699). And say: my Lord, increase me in knowledge (Quran 20:114).",
      chips: ["Sahih Muslim 2699", "Quran 20:114"],
    },
    {
      from: 0,
      to: 1,
      label: "one question",
      title: "Ask",
      note: "Jibril came and asked questions so that the companions would learn: the Prophet, peace be upon him, said he came to teach people their religion (Sahih al-Bukhari 50).",
      chips: ["Sahih al-Bukhari 50"],
    },
    {
      from: 1,
      to: 0,
      label: "'I don't know'",
      tone: "good",
      title: "Honest not-knowing",
      note: "Do not follow what you have no knowledge of; hearing, sight and the heart will be questioned (Quran 17:36). He says 'I don't know, I'll find out' instead of guessing.",
      chips: ["Quran 17:36"],
    },
    {
      from: 0,
      to: 1,
      label: "homework on time",
      title: "Study on time",
      note: "Homework at the same time each day, before games: the habit, not the mood, decides.",
    },
    {
      from: 0,
      to: 0,
      label: "acts on it",
      tone: "good",
      outcome: "knowledge used",
      title: "Act on it",
      note: "He will be asked about his knowledge and what he did with it (Jami' at-Tirmidhi 2417, sahih). He applies one thing each week.",
      chips: ["Jami' at-Tirmidhi 2417"],
    },
  ],
  tryThis: [
    "Before step 3, predict: what does Quran 17:36 say you should not do with things you do not know?",
    "What one thing did you learn this week, and how will you use it?",
  ],
  limits: "The popular wording 'seeking knowledge is an obligation on every Muslim' (Sunan Ibn Majah 224) is graded very weak in this chain; some scholars accept the meaning through other chains, and learning what you need for your worship is agreed to be required. This course builds the habit on Sahih Muslim 2699 and Quran 20:114.",
};
