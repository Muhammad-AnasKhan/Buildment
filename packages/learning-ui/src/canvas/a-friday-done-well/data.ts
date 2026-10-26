import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 14.02 "Jumu'ah".
// Friday is the weekly anchor. Its Sunnahs, ghusl, clean clothes, going early,
// silence during the khutbah, and abundant durood, form one weekly routine.
// See spec.md.
export const aFridayDoneWell: SequenceSpec = {
  kind: "sequence",
  title: "A Friday done well",
  purpose: "Follow Hamza's Friday from morning to the prayer and see each Sunnah with its source.",
  summary: "Hamza takes a ghusl, wears clean clothes and fragrance, leaves early, sits without separating people, listens to the khutbah in silence, and sends much durood through the day.",
  actors: [
    { name: "Hamza" },
    { name: "Home" },
    { name: "The mosque", sub: "Jumu'ah" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "ghusl, perfume",
      title: "Ghusl and fragrance",
      note: "No man bathes on Friday, purifies himself as he can, oils his hair or uses his home's fragrance, then goes out, does not separate two people, prays what is written for him, then listens when the imam speaks, except that he is forgiven what is between that Friday and the next (Sahih al-Bukhari 883).",
      chips: ["Sahih al-Bukhari 883"],
    },
    {
      from: 1,
      to: 2,
      label: "leaves early",
      title: "Going early",
      note: "Whoever goes in the first hour, it is as if he sacrificed a camel; in the second, a cow; then a ram, a hen, an egg (Sahih al-Bukhari 881).",
      chips: ["Sahih al-Bukhari 881"],
    },
    {
      from: 0,
      to: 2,
      label: "no stepping over",
      title: "Sitting with manners",
      note: "He sits where there is space and does not push between two people (Sahih al-Bukhari 883).",
    },
    {
      from: 2,
      to: 0,
      label: "khutbah: silent",
      tone: "warn",
      outcome: "not even 'hush'",
      title: "Silence in the khutbah",
      note: "If you tell your companion 'be quiet' while the imam is speaking, you have spoken idly (Sahih al-Bukhari 934). His phone is off.",
      chips: ["Sahih al-Bukhari 934"],
    },
    {
      from: 0,
      to: 0,
      label: "much durood",
      tone: "good",
      title: "Durood on Friday",
      note: "Friday is among the best of your days, so send much blessing on me in it (Sunan Abi Dawud 1047, graded sahih by al-Albani).",
      chips: ["Sunan Abi Dawud 1047"],
    },
  ],
  tryThis: [
    "Before step 4, predict: is it allowed to tell someone 'be quiet' during the khutbah?",
    "Which Friday Sunnah could you add this week?",
  ],
  limits: "Whether Friday ghusl is obligatory or strongly recommended is a fiqh difference; follow your scholar. Women are not required to attend Jumu'ah; many of these Sunnahs, such as durood, apply to everyone.",
};
