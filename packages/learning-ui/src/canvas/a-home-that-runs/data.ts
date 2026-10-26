import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 12.03 "Home, responsibility, neighbours and guests".
// Everyone in a home is a shepherd of something. The Prophet himself served
// his family, and the Sunnah gives neighbours and guests clear rights.
// See spec.md.
export const aHomeThatRuns: SequenceSpec = {
  kind: "sequence",
  title: "A home where everyone carries something",
  purpose: "Follow one Saturday at home and see responsibility, neighbours and guests with their sources.",
  summary: "Musa makes his bed and tidies his room, helps his little sister with homework, keeps his promise to fix a shelf, does not blame others for a broken cup, takes food to the neighbour, and serves guests well.",
  actors: [
    { name: "Musa" },
    { name: "Home" },
    { name: "Neighbours, guests" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "own room",
      title: "Your own room",
      note: "Each of you is a shepherd and responsible for his flock (Sahih al-Bukhari 7138). Musa's flock today: his bed, his room, his things.",
      chips: ["Sahih al-Bukhari 7138"],
    },
    {
      from: 0,
      to: 1,
      label: "helps at home",
      title: "Helping at home is Sunnah",
      note: "Aisha was asked what the Prophet, peace be upon him, did at home. She said he served his family, and when the prayer came he went to it (Sahih al-Bukhari 676).",
      chips: ["Sahih al-Bukhari 676"],
    },
    {
      from: 0,
      to: 1,
      label: "keeps a promise",
      title: "Promises",
      note: "He promised to help fix a shelf. The signs of a hypocrite are three: when he speaks he lies, when he promises he breaks it, when trusted he betrays (Sahih al-Bukhari 33).",
      chips: ["Sahih al-Bukhari 33"],
    },
    {
      from: 0,
      to: 1,
      label: "'it was me'",
      title: "No blame-shifting",
      note: "He broke a cup. He says so instead of blaming his sister.",
    },
    {
      from: 0,
      to: 2,
      label: "food to neighbour",
      tone: "good",
      title: "The neighbour",
      note: "Jibril kept advising me about the neighbour until I thought he would make him an heir (Sahih al-Bukhari 6014).",
      chips: ["Sahih al-Bukhari 6014"],
    },
    {
      from: 2,
      to: 0,
      label: "guests arrive",
      tone: "good",
      title: "Guests",
      note: "Whoever believes in Allah and the Last Day, let him honour his neighbour, and let him honour his guest (Sahih Muslim 47).",
      chips: ["Sahih Muslim 47"],
    },
  ],
  tryThis: [
    "Before step 2, predict: did the Prophet help with work at home?",
    "What is one thing in your home that is clearly 'your flock'?",
  ],
  limits: "Every home divides work differently; this shows one family. Neighbour rights include not harming them with noise, parking or waste, as well as kindness.",
};
