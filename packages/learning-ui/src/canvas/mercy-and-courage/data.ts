import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 11.04 "Mercy and courage".
// Mercy to the young, the old, the weak and animals, and the courage to say no
// to wrong, are two sides of the same character.
// See spec.md.
export const mercyAndCourage: SequenceSpec = {
  kind: "sequence",
  title: "Gentle and brave in one day",
  purpose: "Follow one day and see where mercy and courage are needed, each with its source.",
  summary: "Musa gives his seat to an old man, plays gently with his little sister, puts water out for a stray cat, refuses to join friends throwing stones at a dog, and tells a teacher when a younger boy is bullied.",
  actors: [
    { name: "Musa" },
    { name: "The weak", sub: "old, young, animals" },
    { name: "Friends" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "seat for elder",
      title: "Respect the old, love the young",
      note: "He is not one of us who does not show mercy to our young and respect to our elders (Jami' at-Tirmidhi 1919, sahih).",
      chips: ["Jami' at-Tirmidhi 1919"],
    },
    {
      from: 0,
      to: 1,
      label: "water for a cat",
      title: "Animals",
      note: "A man gave water to a thirsty dog and Allah forgave him; in every living creature there is reward (Sahih al-Bukhari 2466). A woman entered the Fire because of a cat she locked up without food (Sahih al-Bukhari 3318).",
      chips: ["Sahih al-Bukhari 2466", "Sahih al-Bukhari 3318"],
    },
    {
      from: 2,
      to: 0,
      label: "stones at a dog",
      tone: "warn",
      title: "Saying no",
      note: "Friends throw stones at a stray dog and laugh. Musa says no, and walks away. The merciful are shown mercy by the Most Merciful (Jami' at-Tirmidhi 1924, sahih).",
      chips: ["Jami' at-Tirmidhi 1924"],
    },
    {
      from: 0,
      to: 0,
      label: "sees bullying",
      tone: "warn",
      title: "When someone is wronged",
      note: "Whoever sees a wrong, let him change it with his hand; if he cannot, then with his tongue; if he cannot, then with his heart, and that is the weakest faith (Sahih Muslim 49).",
      chips: ["Sahih Muslim 49"],
    },
    {
      from: 0,
      to: 1,
      label: "tells a teacher",
      tone: "good",
      outcome: "helped",
      title: "Help the wronged",
      note: "Help your brother, whether he is the wrongdoer or the wronged; you help a wrongdoer by stopping him (Sahih al-Bukhari 2443). Telling a teacher is using the tongue safely.",
      chips: ["Sahih al-Bukhari 2443"],
    },
  ],
  tryThis: [
    "Before step 4, predict: what is the weakest level of responding to a wrong in Sahih Muslim 49?",
    "Where could you show mercy to someone weaker this week?",
  ],
  limits: "Changing a wrong 'with the hand' is for those with authority and where it causes no greater harm; for most people, especially young people, the safe way is the tongue: telling a responsible adult. Some animals may be dealt with for harm; the default is mercy (Sunan Abi Dawud 5267 forbids killing ants and some birds without cause).",
};
