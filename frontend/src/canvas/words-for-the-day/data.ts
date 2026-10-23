import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course (faith-and-resilience), chapter 3.3 "Words for hard
// moments". Different hard moments have different words in the Sunnah: the
// istirja when the news comes, the dua of distress at night, refuge from worry
// about tomorrow; then consoling a friend with presence, few words and
// practical help. See spec.md.
export const wordsForTheDay: SequenceSpec = {
  kind: "sequence",
  title: "Words for the day",
  purpose: "See which words the Sunnah gives for each hard moment, and how Mariam then consoles a friend.",
  summary:
    "Mariam's mother says the istirja when the news comes and Mariam adds Umm Salamah's dua; on a sleepless night Mariam says the dua of distress; when she worries about the next round she asks Allah for refuge from worry and grief and writes one step; when her friend Lamees loses her job, Mariam visits and listens, says a few gentle words, and passes on a tutoring lead.",
  actors: [
    { name: "Her mother", sub: "beside her" },
    { name: "Mariam", sub: "at home" },
    { name: "Lamees", sub: "a friend" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "says the istirja",
      title: "At the news: the istirja",
      note: "Her mother says: we belong to Allah and to Him we return. Mariam says it too, and adds the dua the Prophet taught: O Allah, reward me in my loss and give me something better in its place (Sahih Muslim 918). What the better thing is, and when, is Allah's.",
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
      note: "Her mind runs ahead to another rejection. She asks Allah for refuge from worry and grief, from helplessness and laziness (Sahih al-Bukhari 6369). Then she writes down one step for the morning.",
      chips: ["Sahih al-Bukhari 6369", "one step written"],
    },
    {
      from: 2,
      to: 1,
      label: "my job ended",
      tone: "warn",
      outcome: "a friend's loss",
      title: "A friend calls",
      note: "Lamees calls. The language centre where she taught English for two years has closed, and her job has ended. She helps her parents with her salary.",
    },
    {
      from: 1,
      to: 2,
      label: "visits, listens",
      title: "Be there first",
      note: "Mariam visits her on Thursday afternoon and mostly listens, for most of an hour. She does not hurry Lamees toward feeling better. The Prophet went to his grieving daughter when she asked (Sahih al-Bukhari 1284).",
      chips: ["presence", "Sahih al-Bukhari 1284"],
    },
    {
      from: 1,
      to: 2,
      label: "gentle words",
      title: "A few true words",
      note: "She says softly: we belong to Allah and to Him we return; to Allah belongs what He took and what He gave. She does not explain the loss, and she does not say 'everything happens for a reason', which is not a hadith.",
      chips: ["no explanations"],
    },
    {
      from: 1,
      to: 2,
      label: "a tutoring lead",
      tone: "good",
      outcome: "practical help",
      title: "Help with one real need",
      note: "A parent asked Mariam last week for an English tutor for two children. Mariam is full, so she passes the lead to Lamees, with the parent's permission, and offers to read her CV on Saturday.",
      chips: ["one real need", "check again on Sunday"],
    },
  ],
  tryThis: [
    "Before step 5, check the prediction you made above the canvas: does an explanation or being there help Lamees more?",
    "Match each of the first three steps to its moment: the news, a night of distress, worry about tomorrow. Which one fits a moment in your week?",
  ],
  limits:
    "This shows one person's week and a few of the words the Sunnah gives; there are others, and dua in your own words is always open to you. No dua here comes with a promised result or timing: how Allah answers is His. Consoling here is between friends; someone who stays overwhelmed for a long time needs a mentor, the fellowship coordinator, or a doctor or counsellor.",
};
