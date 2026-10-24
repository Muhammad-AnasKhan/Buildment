import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course (faith-and-resilience), chapter 3.3 "Words for hard
// moments". Different hard moments have different words in the Sunnah: the
// istirja when the news comes, the dua of distress at night, refuge from worry
// about tomorrow, and "Allah is enough for us" before a frightening moment.
// See spec.md.
export const wordsForTheDay: SequenceSpec = {
  kind: "sequence",
  title: "Words for the day",
  purpose: "See which words the Sunnah gives for each kind of hard moment, one moment at a time.",
  summary:
    "Mariam's mother says the istirja when the news comes and Mariam adds Umm Salamah's dua; on a sleepless night Mariam says the dua of distress; when she worries about the next round she asks Allah for refuge from worry and grief and writes one step; before a frightening interview she says that Allah is enough for us; between these moments, dua in her own words stays open to her.",
  actors: [
    { name: "Her mother", sub: "beside her" },
    { name: "Mariam", sub: "at home" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "says the istirja",
      title: "At the news: the istirja",
      note: "Her mother says: we belong to Allah and to Him we return. Mariam says it too. She adds the dua the Prophet, peace be upon him, taught, as Umm Salamah, may Allah be pleased with her, reported: O Allah, reward me in my loss and give me something better in its place (Sahih Muslim 918). What the better thing is, and when, is Allah's.",
      chips: ["Quran 2:156", "Sahih Muslim 918"],
    },
    {
      from: 1,
      to: 1,
      label: "awake at night",
      title: "At night: the dua of distress",
      note: "The power is off and she cannot sleep. She says the words the Prophet used at times of distress: there is no god but Allah, the Mighty, the Forbearing, Lord of the heavens, Lord of the earth (Sahih al-Bukhari 6346).",
      chips: ["Sahih al-Bukhari 6346"],
    },
    {
      from: 1,
      to: 1,
      label: "worry: next round",
      title: "About tomorrow: refuge from worry",
      note: "Her mind runs ahead to another rejection. She asks Allah for refuge from worry and grief, and from helplessness and laziness (Sahih al-Bukhari 6369). Then she writes down one step for the morning.",
      chips: ["Sahih al-Bukhari 6369", "one step written"],
    },
    {
      from: 1,
      to: 1,
      label: "before interview",
      tone: "warn",
      outcome: "a frightening moment",
      title: "Before a frightening moment",
      note: "On Sunday she has an online interview for a part-time teaching post. Her notes are ready. A minute before the call she says: Allah is enough for us, and He is the best One to rely on. Ibrahim, peace be upon him, said these words when he was thrown into the fire (Sahih al-Bukhari 4563).",
      chips: ["means taken", "Sahih al-Bukhari 4563"],
    },
    {
      from: 1,
      to: 1,
      label: "her own words",
      tone: "good",
      outcome: "always open",
      title: "Between the moments",
      note: "None of these words comes with a promised result; how Allah answers is His. And between these moments, dua in her own words, in her own language, is always open to her.",
    },
  ],
  tryThis: [
    "Before step 2, check the prediction you made above the canvas: did one set of words serve every hard moment?",
    "Match each of the first four steps to its moment: the news, a night of distress, worry about tomorrow, a frightening minute. Which one fits a moment in your week?",
  ],
  limits:
    "This shows one person's week and a few of the words the Sunnah gives; there are others, and dua in your own words is always open to you. No dua here comes with a promised result or timing: how Allah answers is His. Someone who stays overwhelmed for a long time needs a real person: a mentor, the fellowship coordinator, or a doctor or counsellor.",
};
