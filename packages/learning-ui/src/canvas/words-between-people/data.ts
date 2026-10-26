import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 07.04 "Salam, sneezing and visiting the sick".
// Some daily duas are said between people: the salam, the reply to a sneeze,
// the words for a sick friend. Others, durood and istighfar, belong to every
// hour.
// See spec.md.
export const wordsBetweenPeople: SequenceSpec = {
  kind: "sequence",
  title: "Words between people",
  purpose: "Follow one office day and see the short words the Sunnah gives for moments with other people.",
  summary: "Hamza greets colleagues with salam, replies to a colleague's sneeze, visits a sick uncle and says the Prophet's dua for him, and keeps durood and istighfar through the day.",
  actors: [
    { name: "Hamza" },
    { name: "Colleagues" },
    { name: "His uncle", sub: "unwell" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "salam",
      title: "Spread the salam",
      note: "You will not believe until you love one another. Shall I tell you something that, if you do it, you will love one another? Spread the salam among you (Sahih Muslim 54).",
      chips: ["Sahih Muslim 54"],
    },
    {
      from: 1,
      to: 0,
      label: "Alhamdulillah",
      title: "A colleague sneezes",
      note: "When one of you sneezes, let him say Alhamdulillah, and his brother says Yarhamukallah; then he replies Yahdikumullahu wa yuslihu balakum (Sahih al-Bukhari 6224).",
      chips: ["Sahih al-Bukhari 6224"],
    },
    {
      from: 0,
      to: 2,
      label: "visits, makes dua",
      title: "Visiting the sick",
      note: "The one who visits the sick is in the harvest of Paradise until he returns (Sahih Muslim 2568). The Prophet said: Remove the harm, Lord of the people; cure, You are the Healer; there is no cure but Yours, a cure that leaves no illness (Sahih al-Bukhari 5675).",
      chips: ["Sahih Muslim 2568", "Sahih al-Bukhari 5675"],
    },
    {
      from: 0,
      to: 0,
      label: "durood",
      title: "Durood through the day",
      note: "Whoever sends blessings on me once, Allah sends blessings on him ten times (Sahih Muslim 408).",
      chips: ["Sahih Muslim 408"],
    },
    {
      from: 0,
      to: 0,
      label: "istighfar",
      tone: "good",
      outcome: "daily",
      title: "Istighfar through the day",
      note: "The Prophet said: by Allah, I ask Allah's forgiveness and turn to Him more than seventy times a day (Sahih al-Bukhari 6307). Dua is worship (Jami' at-Tirmidhi 3372, sahih).",
      chips: ["Sahih al-Bukhari 6307", "Jami' at-Tirmidhi 3372"],
    },
  ],
  tryThis: [
    "Before step 2, predict: how many lines does the sneeze exchange have, and who says each?",
    "Who could you visit or call this week who is unwell?",
  ],
  limits: "These are a few of the words between people in the Sunnah. A popular wording, 'dua is the marrow of worship' (Jami' at-Tirmidhi 3371), is graded weak; the sound wording is 'dua is worship' (Jami' at-Tirmidhi 3372).",
};
