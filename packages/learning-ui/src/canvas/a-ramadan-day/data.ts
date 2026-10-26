import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 14.04 "Ramadan".
// Ramadan is a yearly season that strengthens every daily habit. Its own
// Sunnahs, suhoor, a quick iftar, taraweeh and guarding the tongue, make one
// daily cycle.
// See spec.md.
export const aRamadanDay: SequenceSpec = {
  kind: "sequence",
  title: "One Ramadan day",
  purpose: "Step through one Ramadan day and see each Sunnah with its source.",
  summary: "Hamza wakes for suhoor, fasts with faith, guards his tongue at work, breaks the fast promptly with the iftar words, prays taraweeh, and reads extra Quran and gives extra charity.",
  actors: [
    { name: "Hamza" },
    { name: "The fast" },
    { name: "The night" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "suhoor",
      title: "Suhoor",
      note: "Take suhoor, for there is blessing in it (Sahih al-Bukhari 1923).",
      chips: ["Sahih al-Bukhari 1923"],
    },
    {
      from: 0,
      to: 1,
      label: "faith + hope",
      title: "Fasting with faith",
      note: "Whoever fasts Ramadan with faith and hoping for reward, his past sins are forgiven (Sahih al-Bukhari 38). Fasting was prescribed that you may have taqwa (Quran 2:183).",
      chips: ["Sahih al-Bukhari 38", "Quran 2:183"],
    },
    {
      from: 1,
      to: 0,
      label: "tongue guarded",
      tone: "warn",
      title: "Guard the tongue",
      note: "Whoever does not give up false speech and acting on it, Allah has no need of his leaving food and drink (Sahih al-Bukhari 1903).",
      chips: ["Sahih al-Bukhari 1903"],
    },
    {
      from: 1,
      to: 0,
      label: "iftar promptly",
      tone: "good",
      title: "A prompt iftar",
      note: "People will remain well as long as they hasten the iftar (Sahih al-Bukhari 1957). At iftar the Prophet said: the thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills (Sunan Abi Dawud 2357, hasan).",
      chips: ["Sahih al-Bukhari 1957", "Sunan Abi Dawud 2357"],
    },
    {
      from: 0,
      to: 2,
      label: "taraweeh",
      title: "The night prayer",
      note: "Whoever stands in prayer in Ramadan with faith and hoping for reward, his past sins are forgiven (Sahih al-Bukhari 37).",
      chips: ["Sahih al-Bukhari 37"],
    },
    {
      from: 0,
      to: 2,
      label: "more Quran",
      tone: "good",
      title: "The month of the Quran",
      note: "The month in which the Quran was sent down (Quran 2:185). His daily page grows to a juz for the month, and his weekly sadaqah grows too.",
      chips: ["Quran 2:185"],
    },
  ],
  tryThis: [
    "Before step 4, predict: should iftar be delayed to be safe, or taken promptly at sunset?",
    "Which daily habit from this course will Ramadan grow most for you?",
  ],
  limits: "Rulings on what breaks the fast, who is excused and how to make up fasts are fiqh; ask your scholar. Those who are ill or travelling have allowances in the Quran (2:185).",
};
