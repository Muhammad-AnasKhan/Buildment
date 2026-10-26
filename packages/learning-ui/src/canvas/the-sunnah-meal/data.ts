import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 07.03 "Eating and drinking".
// Three times a day, a meal gives the same cue. The Sunnah of eating and
// drinking is a short set of manners that a whole family can learn at one
// table.
// See spec.md.
export const theSunnahMeal: SequenceSpec = {
  kind: "sequence",
  title: "One meal, done the Sunnah way",
  purpose: "Sit at Hamza's family table and see each manner of eating and drinking with its source.",
  summary: "Musa says Bismillah, remembers late and says 'Bismillahi awwalahu wa akhirahu', eats with his right hand from in front of him, does not complain about the food, stops before he is full, drinks in three breaths outside the glass, and praises Allah at the end.",
  actors: [
    { name: "Musa", sub: "age 12" },
    { name: "Hamza" },
    { name: "The table" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "Bismillah",
      title: "Bismillah, right hand, in front",
      note: "O boy, mention Allah's name, eat with your right hand, and eat from what is in front of you (Sahih al-Bukhari 5376). The Prophet, peace be upon him, said this to a boy at his own table.",
      chips: ["Sahih al-Bukhari 5376"],
    },
    {
      from: 0,
      to: 0,
      label: "forgot? say it",
      title: "If you forget at the start",
      note: "If you forget to mention Allah at the beginning, say: Bismillahi awwalahu wa akhirahu, in the name of Allah at its beginning and its end (Sunan Abi Dawud 3767, sahih).",
      chips: ["Sunan Abi Dawud 3767"],
    },
    {
      from: 0,
      to: 2,
      label: "no complaints",
      title: "No complaining about food",
      note: "The Prophet never criticised food: if he liked it he ate it, and if he disliked it he left it (Sahih al-Bukhari 5409).",
      chips: ["Sahih al-Bukhari 5409"],
    },
    {
      from: 0,
      to: 2,
      label: "a third",
      title: "Stop before full",
      note: "A third for food, a third for drink and a third for breath (Jami' at-Tirmidhi 2380, sahih). Eat and drink, but do not be excessive (Quran 7:31).",
      chips: ["Jami' at-Tirmidhi 2380", "Quran 7:31"],
    },
    {
      from: 0,
      to: 2,
      label: "three breaths",
      title: "Drinking",
      note: "He sits to drink, as the Prophet preferred (Sahih Muslim 2024), though drinking standing is not forbidden: Ali drank standing and said he saw the Prophet do so (Sahih al-Bukhari 5615). He drinks in three breaths (Sahih Muslim 2028), breathing outside the glass, not into it (Sahih al-Bukhari 5630).",
      chips: ["Sahih Muslim 2028", "Sahih al-Bukhari 5630"],
    },
    {
      from: 0,
      to: 1,
      label: "Alhamdulillah",
      tone: "good",
      outcome: "praise",
      title: "Praise at the end",
      note: "Allah is pleased with a servant who praises Him for a meal and a drink (Sahih Muslim 2734). Praise be to Allah who fed me this and provided it without any power or strength from me (Sunan Abi Dawud 4023, hasan).",
      chips: ["Sahih Muslim 2734", "Sunan Abi Dawud 4023"],
    },
  ],
  tryThis: [
    "Before step 2, predict: if Musa forgets Bismillah, is the chance lost for that meal?",
    "Which manner would be easiest for your whole family to start at the next meal?",
  ],
  limits: "These are the core sourced manners; scholars discuss details such as standing to drink, which this course presents with both narrations. There is no single sound dua specific to drinking water beyond Bismillah and Alhamdulillah.",
};
