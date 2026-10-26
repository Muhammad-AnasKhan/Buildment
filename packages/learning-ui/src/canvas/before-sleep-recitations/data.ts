import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 06.02 "Amana al-Rasul and Surah al-Mulk".
// Two recitations close Hamza's day: the last two verses of Surah al-Baqarah
// (Amana al-Rasul, Quran 2:285 to 286) and Surah al-Mulk (Quran 67).
// See spec.md.
export const beforeSleepRecitations: SequenceSpec = {
  kind: "sequence",
  title: "Two recitations before sleep",
  purpose: "Follow Hamza's last fifteen minutes of the day and see where the two recitations fit.",
  summary: "After Isha Hamza puts his phone on the charger, recites the last two verses of al-Baqarah in about two minutes, then Surah al-Mulk in about ten, and on a tired night keeps the two verses as his minimum.",
  actors: [
    { name: "Hamza" },
    { name: "His phone", sub: "on the charger" },
    { name: "His bed" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "phone away",
      title: "The phone goes first",
      note: "Back from Isha, his phone goes on the charger in the hall. Without this step, the recitations lose to the phone every night.",
    },
    {
      from: 0,
      to: 2,
      label: "2:285 to 286",
      tone: "good",
      outcome: "about 2 min",
      title: "Amana al-Rasul",
      note: "He recites the last two verses of al-Baqarah. Whoever recites them at night, they are enough for him (Sahih al-Bukhari 5009). They end with the believers' duas: our Lord, do not take us to task if we forget or make a mistake (Quran 2:286).",
      chips: ["Sahih al-Bukhari 5009", "Quran 2:285-286"],
    },
    {
      from: 0,
      to: 2,
      label: "Surah al-Mulk",
      tone: "good",
      outcome: "about 10 min",
      title: "Surah al-Mulk",
      note: "Then he recites al-Mulk. A surah of the Quran of thirty verses interceded for a man until he was forgiven: 'Blessed is He in whose hand is the dominion' (Jami' at-Tirmidhi 2891, graded hasan; also Sunan Abi Dawud 1400).",
      chips: ["Jami' at-Tirmidhi 2891", "30 verses"],
    },
    {
      from: 0,
      to: 2,
      label: "tired: 2 verses",
      tone: "warn",
      outcome: "minimum kept",
      title: "A tired night",
      note: "After a long day he is too tired for al-Mulk. He recites the two verses, which take two minutes, and sleeps. The minimum keeps the cue and the habit alive.",
    },
  ],
  tryThis: [
    "Before step 2, predict: which of the two recitations is the better minimum for a tired night, and why?",
    "What is the first step that has to happen for the two recitations to win against the phone?",
  ],
  limits: "Times are for a steady, unhurried reading; they vary with each reader. A popular report that the Prophet never slept until he recited al-Mulk carries weak gradings in Jami' at-Tirmidhi (2892), so this course does not use it. The sound virtue of al-Mulk is in Jami' at-Tirmidhi 2891.",
};
