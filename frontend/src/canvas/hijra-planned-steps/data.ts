import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course, chapter 2.4 "The Prophet's planning in the Hijra".
// The planned steps of the Hijra, only as Sahih al-Bukhari 3905 (with 2979 for
// Asma's belt) tells them, and the trust in the cave (Quran 9:40, Sahih
// al-Bukhari 3653). No details from outside these sources. Every fact matches
// the chapter. See spec.md.
export const hijraPlannedSteps: SequenceSpec = {
  kind: "sequence",
  title: "The Hijra: planned steps, and trust in the cave",
  purpose: "Follow each planned step of the Hijra as Sahih al-Bukhari 3905 tells it, and see that the trust in the cave came with the plan, not instead of it.",
  summary:
    "Abu Bakr, may Allah be pleased with him, fed two camels for four months. The Prophet, peace be upon him, came to his house at noon, at an unusual hour, and took a camel only with payment. Food was packed quickly, and Asma, may Allah be pleased with her, tied the bag with a piece of her belt. They hired a skilled guide who was not a Muslim at the time and gave him the camels. In the cave of Thawr, for three nights, Abdullah and Amir, may Allah be pleased with them, brought news after dark and milk each evening. When Abu Bakr was afraid, the Prophet said: do not grieve, Allah is with us. After three nights the guide came with the camels, and they travelled on.",
  actors: [
    { name: "The Prophet" },
    { name: "Abu Bakr", sub: "his companion" },
    { name: "Family", sub: "of Abu Bakr" },
    { name: "Helpers", sub: "Amir, guide" },
  ],
  steps: [
    {
      from: 1,
      to: 1,
      label: "feeds two camels",
      title: "A long preparation",
      note: "Abu Bakr, may Allah be pleased with him, wanted to emigrate, and the Prophet, peace be upon him, asked him to wait. Abu Bakr used the time: he fed two she-camels for four months, so they would be ready.",
      chips: ["four months"],
    },
    {
      from: 0,
      to: 1,
      label: "comes at noon",
      title: "Timing and care",
      note: "The Prophet came to Abu Bakr's house at noon, at an hour when he did not usually visit, with his head covered. He asked that everyone leave before he spoke. Abu Bakr said only his family was there.",
      chips: ["an unusual hour"],
    },
    {
      from: 0,
      to: 1,
      label: "pays for a camel",
      title: "Paying fairly",
      note: "Abu Bakr offered him one of the two camels. The Prophet accepted it only with payment.",
    },
    {
      from: 2,
      to: 2,
      label: "packs the food",
      title: "Food packed, and Asma's belt",
      note: "The family prepared the baggage quickly and put food in a leather bag. Asma, Abu Bakr's daughter, may Allah be pleased with her, cut a piece of her belt to tie it. In her own report she cut it in two: one piece for the water-skin and one for the food (Sahih al-Bukhari 2979).",
    },
    {
      from: 1,
      to: 3,
      label: "hires a guide",
      title: "An expert, chosen for skill",
      note: "They hired a skilled guide from the tribe of Banu ad-Dil, who was not a Muslim at the time. They trusted him and gave him their two camels.",
      chips: ["chosen for skill"],
    },
    {
      from: 2,
      to: 0,
      label: "news after dark",
      title: "A source of news",
      note: "They stayed in a cave on Mount Thawr for three nights. Abdullah, Abu Bakr's son, may Allah be pleased with him, a sharp young man, spent the nights with them, left before dawn, was among the people of Makkah by morning, and brought them every piece of news after dark.",
      chips: ["three nights"],
    },
    {
      from: 3,
      to: 0,
      label: "milk each evening",
      title: "Supplies nearby",
      note: "Amir ibn Fuhayra, may Allah be pleased with him, Abu Bakr's freed slave, grazed a flock of sheep near them, brought them milk each evening, and led the sheep away before dawn.",
    },
    {
      from: 0,
      to: 1,
      label: "Allah is with us",
      tone: "good",
      outcome: "trust",
      title: "Trust in the cave",
      note: "In the cave, Abu Bakr was afraid they would be seen. The Prophet said: what do you think of two when Allah is the third of them? (Sahih al-Bukhari 3653). And he said to his companion: do not grieve, Allah is with us (Quran 9:40). Every step had been planned. Now the plan had done all it could, and the trust held.",
      chips: ["Bukhari 3653", "Quran 9:40"],
    },
    {
      from: 3,
      to: 0,
      label: "camels arrive",
      title: "The plan moves on",
      note: "After three nights, the guide brought the camels to the cave and took them on by the coast road.",
    },
  ],
  tryThis: [
    "Check your prediction at step 5: who did they hire as their guide, and why? Then count how many steps were planned before the cave.",
    "Step 8 is the only step about trust. Which earlier steps made it possible to be in that cave, safely supplied, at all?",
  ],
  limits:
    "The canvas tells only what Sahih al-Bukhari 3905, 2979 and 3653 and Quran 9:40 say, in a simple order; it leaves out every detail those sources do not give. It shows the pattern of planning and trust, not the whole story, and it draws no comparison with any other time or place.",
};
