import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 08.02 "Wudu through the day".
// Wudu is needed for prayer, and it can also be a state you keep through the
// day. The Sunnah links it to sins washed away, to calm, and to sleep.
// See spec.md.
export const stayingInWudu: SequenceSpec = {
  kind: "sequence",
  title: "A day in wudu",
  purpose: "Follow Hamza through a day in which he tries to stay in wudu, and see each step with its source.",
  summary: "Hamza makes wudu carefully with little water, checks his wudu before leaving home, renews it when it breaks, meets anger by sitting and seeking refuge in Allah, and makes wudu before sleep.",
  actors: [
    { name: "Hamza" },
    { name: "The tap" },
    { name: "His day", sub: "office" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "careful wudu",
      title: "Wudu, carefully",
      note: "When a believer washes his face, every sin his eyes looked at leaves with the water; when he washes his hands, every sin his hands did leaves; when he washes his feet, every sin they walked to leaves, until he comes out pure (Sahih Muslim 244).",
      chips: ["Sahih Muslim 244"],
    },
    {
      from: 0,
      to: 1,
      label: "little water",
      title: "Little water",
      note: "The Prophet, peace be upon him, made wudu with one mudd of water, about two handfuls (Sahih al-Bukhari 201). Hamza turns the tap low.",
      chips: ["Sahih al-Bukhari 201"],
    },
    {
      from: 0,
      to: 2,
      label: "leaves in wudu",
      title: "Check before leaving",
      note: "Before he leaves home he checks his wudu, so Dhuhr at work needs no rush. None keeps up wudu except a believer (Sunan Ibn Majah 277, sahih).",
      chips: ["Sunan Ibn Majah 277"],
    },
    {
      from: 2,
      to: 0,
      label: "angry: sits",
      tone: "warn",
      outcome: "calm first",
      title: "When anger comes",
      note: "If one of you is angry while standing, let him sit; if the anger goes, good; if not, let him lie down (Sunan Abi Dawud 4782, sahih). When a man was furious, the Prophet said: if he said 'I seek refuge in Allah from Satan', his anger would go (Sahih al-Bukhari 3282).",
      chips: ["Sunan Abi Dawud 4782", "Sahih al-Bukhari 3282"],
    },
    {
      from: 0,
      to: 1,
      label: "wudu for bed",
      tone: "good",
      title: "Wudu before sleep",
      note: "When you go to bed, make wudu as for the prayer (Sahih al-Bukhari 247).",
      chips: ["Sahih al-Bukhari 247"],
    },
  ],
  tryThis: [
    "Before step 4, predict: what is the first thing the Sunnah tells an angry person to do with his body?",
    "Which time of your day is easiest for keeping wudu?",
  ],
  limits: "A popular hadith 'make wudu when angry' (Sunan Abi Dawud 4784) is graded weak, so this course uses sitting and seeking refuge, which are sound. A hadith against wasting water even at a flowing river (Sunan Ibn Majah 425) is also weak; the Prophet's own small measure (Sahih al-Bukhari 201) is the sound guide. What breaks wudu is fiqh: ask your scholar.",
};
