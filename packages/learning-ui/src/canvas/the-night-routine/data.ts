import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 06.04 "The night routine".
// Before sleep the Sunnah gives a short sequence: wudu, lying on the right
// side, the dua for sleep, and a moment to look back at the day.
// See spec.md.
export const theNightRoutine: SequenceSpec = {
  kind: "sequence",
  title: "The last five minutes",
  purpose: "Step through Hamza's last five minutes before sleep and see each Sunnah step with its source.",
  summary: "Hamza makes wudu, recites the two verses, lies on his right side and says the dua the Prophet taught al-Bara, then 'Bismika amutu wa ahya', and asks himself four questions about his day before sleeping.",
  actors: [
    { name: "Hamza" },
    { name: "His bed" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "wudu",
      title: "Wudu before bed",
      note: "When you go to your bed, make wudu as you do for prayer, then lie on your right side (Sahih al-Bukhari 247).",
      chips: ["Sahih al-Bukhari 247"],
    },
    {
      from: 0,
      to: 1,
      label: "right side",
      title: "The right side, and al-Bara's dua",
      note: "He lies on his right side and says the dua the Prophet, peace be upon him, taught al-Bara: O Allah, I submit myself to You, entrust my affairs to You, and rely on You... (Sahih al-Bukhari 247).",
      chips: ["Sahih al-Bukhari 247"],
    },
    {
      from: 0,
      to: 1,
      label: "Bismika amutu",
      title: "In Your name I die and live",
      note: "When the Prophet went to bed he would say: in Your name I die and I live; and on waking: praise be to Allah who gave us life after He caused us to die, and to Him is the return (Sahih al-Bukhari 6312).",
      chips: ["Sahih al-Bukhari 6312"],
    },
    {
      from: 1,
      to: 1,
      label: "four questions",
      tone: "good",
      outcome: "muhasaba",
      title: "A one-minute look back",
      note: "Let every soul look at what it has sent ahead for tomorrow (Quran 59:18). He asks: what did I do today that pleases Allah? What wrong did I avoid? What do I need to ask forgiveness for? What will I do better tomorrow?",
      chips: ["Quran 59:18"],
    },
    {
      from: 1,
      to: 1,
      label: "istighfar, sleep",
      title: "Forgiveness, then sleep",
      note: "For the third question he says astaghfirullah, and plans one repair for tomorrow if he wronged someone. Then he sleeps.",
    },
  ],
  tryThis: [
    "Before step 4, predict: should the look back be long and detailed, or short enough to do every night?",
    "Which of the four questions is hardest for you to answer honestly?",
  ],
  limits: "This is a short version for every night. Longer duas and adhkar before sleep exist in the books of adhkar. The look back is for honest planning, not self-punishment; if guilt keeps you awake for long, talk to someone you trust.",
};
