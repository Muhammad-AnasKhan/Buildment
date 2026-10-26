import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 09.02 "Taqwa and ihsan".
// Taqwa is guarding yourself from what displeases Allah, and ihsan is
// worshipping Allah as if you see Him. Both are tested most when nobody else
// is watching.
// See spec.md.
export const aloneWithAllah: SequenceSpec = {
  kind: "sequence",
  title: "Alone, at 1:00",
  purpose: "Step through one late night when Hamza is alone with his phone, and see what taqwa and ihsan look like in that moment.",
  summary: "Alone late at night, Hamza is tempted by content he would not watch in front of anyone, remembers that Allah sees him, asks whether Allah would be pleased, puts the phone away, and the next day follows a slip with a good deed.",
  actors: [
    { name: "Hamza" },
    { name: "His phone", sub: "1:00, alone" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "a temptation",
      tone: "warn",
      outcome: "alone",
      title: "Nobody is watching",
      note: "At 1:00, alone, a video appears that he would never watch in front of his family. This is the moment taqwa is for.",
    },
    {
      from: 0,
      to: 0,
      label: "Allah sees",
      title: "Ihsan: as if you see Him",
      note: "Ihsan is to worship Allah as if you see Him; and if you do not see Him, He sees you (Sahih al-Bukhari 50).",
      chips: ["Sahih al-Bukhari 50"],
    },
    {
      from: 0,
      to: 0,
      label: "pleased?",
      title: "The question",
      note: "He asks one question: would Allah be pleased with this? As for one who feared standing before his Lord and held his soul back from desire, Paradise is the refuge (Quran 79:40 to 41).",
      chips: ["Quran 79:40-41"],
    },
    {
      from: 0,
      to: 1,
      label: "phone away",
      tone: "good",
      outcome: "closed",
      title: "He closes it",
      note: "He closes the app and puts the phone on the charger outside the room. The Prophet warned of people who come with deeds like mountains, but who, when alone with what Allah forbade, violate it (Sunan Ibn Majah 4245, sahih).",
      chips: ["Sunan Ibn Majah 4245"],
    },
    {
      from: 0,
      to: 0,
      label: "slip? then good",
      title: "If he slips",
      note: "On another night he slips. Fear Allah wherever you are, follow a bad deed with a good one to wipe it out, and treat people with good character (Jami' at-Tirmidhi 1987, hasan). He makes tawbah and does a good deed the next morning.",
      chips: ["Jami' at-Tirmidhi 1987"],
    },
  ],
  tryThis: [
    "Before step 3, predict: what single question does Hamza ask himself?",
    "Where in your day are you most often alone with a screen?",
  ],
  limits: "This shows one kind of private temptation. Taqwa covers every part of life, private and public. A slip is not the end: tawbah is always open. If a habit feels out of your control, talk to someone you trust and get practical help.",
};
