import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 07.02 "From waking to the front door".
// Ordinary moments, waking, the washroom, getting dressed, leaving the house,
// entering the mosque, coming home, each have a short word from the Sunnah.
// Together they turn a routine morning into remembrance.
// See spec.md.
export const aDayOfSmallDuas: SequenceSpec = {
  kind: "sequence",
  title: "A morning of small duas",
  purpose: "Follow Hamza from waking to the mosque and back, and see the short dua that belongs to each moment.",
  summary: "Hamza praises Allah on waking, uses miswak, says the duas for entering and leaving the washroom, praises Allah for his clothes, starts with the right, says the dua for leaving home, the dua for entering the mosque, and greets his family with salam when he returns.",
  actors: [
    { name: "Hamza" },
    { name: "Home" },
    { name: "Outside", sub: "street, mosque" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "on waking",
      title: "On waking",
      note: "Praise be to Allah who gave us life after He caused us to die, and to Him is the return (Sahih al-Bukhari 6312). When the Prophet, peace be upon him, got up at night he cleaned his mouth with the miswak (Sahih al-Bukhari 245).",
      chips: ["Sahih al-Bukhari 6312", "Sahih al-Bukhari 245"],
    },
    {
      from: 0,
      to: 1,
      label: "washroom",
      title: "Entering and leaving the washroom",
      note: "Before entering: O Allah, I seek refuge in You from the male and female devils (Sahih al-Bukhari 142). On leaving: 'Ghufranak', I ask Your forgiveness (Jami' at-Tirmidhi 7, sahih).",
      chips: ["Sahih al-Bukhari 142", "Jami' at-Tirmidhi 7"],
    },
    {
      from: 0,
      to: 1,
      label: "dressing",
      title: "Getting dressed",
      note: "Praise be to Allah who clothed me with this and provided it for me without any power or strength from me (Sunan Abi Dawud 4023, hasan). He starts with the right sleeve: the Prophet liked to start with the right in everything (Sahih al-Bukhari 168).",
      chips: ["Sunan Abi Dawud 4023", "Sahih al-Bukhari 168"],
    },
    {
      from: 1,
      to: 2,
      label: "leaving home",
      title: "Leaving the house",
      note: "In the name of Allah, I rely on Allah, there is no might or power except with Allah. It is said to him: you are guided, protected and defended (Sunan Abi Dawud 5095, sahih).",
      chips: ["Sunan Abi Dawud 5095"],
    },
    {
      from: 2,
      to: 2,
      label: "mosque door",
      title: "Entering and leaving the mosque",
      note: "Entering: O Allah, open for me the doors of Your mercy. Leaving: O Allah, I ask You of Your bounty (Sahih Muslim 713).",
      chips: ["Sahih Muslim 713"],
    },
    {
      from: 2,
      to: 1,
      label: "home: salam",
      tone: "good",
      outcome: "Bismillah, salam",
      title: "Coming home",
      note: "He says Bismillah as he enters and greets his family with salam. When a man mentions Allah on entering his home and at his meal, Satan says to his companions: no place to stay and no dinner for you (Sahih Muslim 2018). When you enter houses, greet one another (Quran 24:61).",
      chips: ["Sahih Muslim 2018", "Quran 24:61"],
    },
  ],
  tryThis: [
    "Before step 3, predict: is there one dua for the whole morning, or a short one for each moment?",
    "Pick the moment in this list that happens to you most often. That is your easiest first dua.",
  ],
  limits: "These are short, sound duas for each moment; the books of adhkar contain more. A popular specific dua for entering the home (Sunan Abi Dawud 5096) is graded weak, so this course uses Bismillah and the salam, which are sound. Learn the Arabic pronunciation from a teacher.",
};
