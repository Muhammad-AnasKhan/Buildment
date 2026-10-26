import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 08.03 "Cleanliness and the fitrah".
// Personal hygiene in Islam is part of faith. Some habits are daily, some
// weekly, and some have a limit of forty nights.
// See spec.md.
export const theFitrahWeek: SequenceSpec = {
  kind: "sequence",
  title: "Clean, on a rhythm",
  purpose: "See which hygiene habits are daily, weekly and monthly, each with its source.",
  summary: "Musa uses miswak or brushes daily, bathes, clips his nails and keeps his hair clean on a weekly rhythm well inside forty nights, wears clean clothes, puts his right shoe on first, and keeps his shoes in their place.",
  actors: [
    { name: "Musa" },
    { name: "Daily" },
    { name: "Weekly", sub: "Friday" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "miswak",
      title: "Teeth, every day",
      note: "Miswak purifies the mouth and pleases the Lord (Sunan an-Nasa'i 5, sahih). Were it not hard on my people, I would have ordered them to use miswak for every prayer (Sahih al-Bukhari 887). A toothbrush is a good daily habit too.",
      chips: ["Sunan an-Nasa'i 5", "Sahih al-Bukhari 887"],
    },
    {
      from: 0,
      to: 2,
      label: "a bath",
      title: "A bath, at least weekly",
      note: "It is a right of Allah on every Muslim to bathe at least once in seven days (Sahih al-Bukhari 898). Many people bathe daily, and that is good care of the body.",
      chips: ["Sahih al-Bukhari 898"],
    },
    {
      from: 0,
      to: 2,
      label: "nails, fitrah",
      title: "The fitrah, within forty nights",
      note: "Five things are from the fitrah: circumcision, removing pubic hair, plucking armpit hair, clipping the nails and trimming the moustache (Sahih al-Bukhari 5889). A limit was set that these not be left more than forty nights (Sahih Muslim 258).",
      chips: ["Sahih al-Bukhari 5889", "Sahih Muslim 258"],
    },
    {
      from: 0,
      to: 1,
      label: "clean clothes",
      title: "Clean clothes, not show",
      note: "Allah is beautiful and loves beauty; pride is rejecting the truth and looking down on people (Sahih Muslim 91). Clean and neat is the Sunnah; showing off is not.",
      chips: ["Sahih Muslim 91"],
    },
    {
      from: 0,
      to: 1,
      label: "right shoe first",
      tone: "good",
      title: "Shoes and the right side",
      note: "The Prophet liked to start with the right when putting on shoes, combing and cleaning (Sahih al-Bukhari 168). Musa puts his shoes in the rack, not in the doorway.",
      chips: ["Sahih al-Bukhari 168"],
    },
    {
      from: 1,
      to: 0,
      label: "half of faith",
      tone: "good",
      outcome: "why",
      title: "Why it matters",
      note: "Purity is half of faith (Sahih Muslim 223).",
      chips: ["Sahih Muslim 223"],
    },
  ],
  tryThis: [
    "Before step 3, predict: what is the longest the fitrah practices should be left, in nights?",
    "Which rhythm, daily or weekly, is your weakest?",
  ],
  limits: "This covers personal hygiene in general terms. Rulings on ghusl, purification after the toilet and similar matters are fiqh; learn them from a scholar or a reliable fiqh book for your school.",
};
