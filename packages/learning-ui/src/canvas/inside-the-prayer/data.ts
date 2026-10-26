import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 02.04 "Inside the prayer".
// A prayer on time is the base. Around it the Sunnah adds small habits:
// answering the adhan, a careful wudu, the sunnah prayers, and attention
// (khushu) inside the prayer.
// See spec.md.
export const insideThePrayer: SequenceSpec = {
  kind: "sequence",
  title: "Around and inside one prayer",
  purpose: "Step through one Dhuhr and see the small habits that sit around and inside the obligatory prayer.",
  summary: "Hamza repeats the adhan and says the dua after it, makes wudu slowly, prays four sunnah before Dhuhr, prays the obligatory prayer knowing the meaning of what he recites, and prays two sunnah after it.",
  actors: [
    { name: "The adhan" },
    { name: "Hamza" },
    { name: "The prayer", sub: "Dhuhr" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "repeats it",
      title: "Answer the adhan",
      note: "When you hear the call, say what the mu'adhdhin says (Sahih al-Bukhari 611). After it, the Prophet, peace be upon him, taught a dua: O Allah, Lord of this perfect call and the prayer about to be established... Whoever says it will have his intercession on the Day of Resurrection (Sahih al-Bukhari 614).",
      chips: ["Sahih al-Bukhari 611", "Sahih al-Bukhari 614"],
    },
    {
      from: 1,
      to: 1,
      label: "wudu, slowly",
      title: "Wudu with care",
      note: "He washes each part fully, without rushing. When a believer washes his face in wudu, every sin his eyes looked at leaves with the water; then his hands, then his feet (Sahih Muslim 244).",
      chips: ["Sahih Muslim 244"],
    },
    {
      from: 1,
      to: 2,
      label: "4 sunnah first",
      title: "The sunnah before Dhuhr",
      note: "Whoever prays twelve rak'ahs in a day and night, a house is built for him in Paradise (Sahih Muslim 728). At-Tirmidhi's narration names them: four before Dhuhr and two after, two after Maghrib, two after Isha and two before Fajr (Jami' at-Tirmidhi 415, sahih).",
      chips: ["Sahih Muslim 728", "Jami' at-Tirmidhi 415"],
    },
    {
      from: 1,
      to: 2,
      label: "khushu",
      tone: "good",
      outcome: "attention",
      title: "Attention inside the prayer",
      note: "Successful are the believers who are humble and attentive in their prayer (Quran 23:1 to 2). He has learned the meaning of al-Fatihah and of the dhikr in ruku and sujud, so his mind has something to hold on to.",
    },
    {
      from: 2,
      to: 1,
      label: "2 sunnah after",
      title: "Two after",
      note: "He prays two rak'ahs after Dhuhr before leaving the prayer room. The sunnah prayers also fill gaps in the obligatory ones on a distracted day.",
    },
    {
      from: 2,
      to: 1,
      label: "first reckoned",
      tone: "warn",
      outcome: "why it matters",
      title: "Why it matters most",
      note: "The first deed a servant will be asked about on the Day of Resurrection is his prayer (Jami' at-Tirmidhi 413, graded sahih by al-Albani). That is why the prayer is the first anchor for every other habit in this course.",
      chips: ["Jami' at-Tirmidhi 413"],
    },
  ],
  tryThis: [
    "Before step 3, predict: how many sunnah rak'ahs a day does Sahih Muslim 728 speak of?",
    "Which of these steps could you add to the prayer you already pray most steadily?",
  ],
  limits: "This is one man's Dhuhr. The sunnah prayers are voluntary, and details such as which are most emphasised differ between schools; ask your scholar. Khushu cannot be measured, and a distracted prayer is still a prayer: the habit is to keep returning the mind to it.",
};
