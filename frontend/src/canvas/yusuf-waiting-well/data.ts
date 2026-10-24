import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course (faith-and-resilience), chapter 3.4 "Waiting well".
// The waiting in Surah Yusuf, told only as the course's research dossier
// phrases it: Yaqub's beautiful patience and search, Yusuf's request to the
// freed man and his several years in prison, then recognition, forgiveness and
// naming Allah's kindness. No numbers of years, and no single reading of 12:42.
// See spec.md.
export const yusufWaitingWell: StateMachineSpec = {
  kind: "state-machine",
  title: "Waiting well in Surah Yusuf",
  purpose: "Step through the waiting in Surah Yusuf and see what was done in each place, and what Yusuf spoke of at the end.",
  summary:
    "Yaqub waits with beautiful patience, complains only to Allah and sends his sons to search; Yusuf, in prison, asks a freed man to mention him to the king; the man forgets and Yusuf stays several years; when his brothers recognise him, Yusuf says Allah does not let the reward of the mindful and patient be lost; he forgives them; with his family together, he names his Lord's kindness.",
  states: [
    { id: "yaqub", name: "Yaqub waits", sub: "beautiful patience", col: 0, row: 0 },
    { id: "prison", name: "Yusuf in prison", sub: "asks to be named", col: 1, row: 0 },
    { id: "forgotten", name: "Forgotten", sub: "several years", col: 2, row: 0 },
    { id: "recognised", name: "Recognised", sub: "mindful and patient", col: 2, row: 1 },
    { id: "forgives", name: "He forgives", sub: "no blame today", col: 1, row: 1 },
    { id: "together", name: "Family together", sub: "my Lord is subtle", col: 0, row: 1 },
  ],
  edges: [
    { from: "yaqub", to: "prison", label: "far apart" },
    { from: "prison", to: "forgotten", label: "man forgets" },
    { from: "forgotten", to: "recognised", label: "yet" },
    { from: "recognised", to: "forgives", label: "then" },
    { from: "forgives", to: "together", label: "then" },
  ],
  steps: [
    {
      state: "yaqub",
      title: "A father waits",
      note: "When his sons brought Yusuf's shirt with false blood, Yaqub, peace be upon him, said: beautiful patience, and Allah's help is sought (Quran 12:18). Later he wept, complained of his grief only to Allah, and sent his sons to search, telling them not to despair of Allah's mercy (Quran 12:86 to 87).",
      chips: ["Quran 12:18", "Quran 12:86 to 87"],
    },
    {
      state: "prison",
      edge: 0,
      title: "Yusuf asks to be remembered",
      note: "In prison, Yusuf, peace be upon him, asked a man who was being freed to mention him to the king (Quran 12:42). Scholars read this verse in more than one way; ask a scholar you trust.",
      chips: ["Quran 12:42"],
    },
    {
      state: "forgotten",
      edge: 1,
      tone: "warn",
      outcome: "a long wait",
      title: "Forgotten for several years",
      note: "The man forgot, and Yusuf stayed in prison several years (Quran 12:42). The Quran does not give a number, so neither does this canvas.",
      chips: ["several years", "no number given"],
    },
    {
      state: "recognised",
      edge: 2,
      title: "Mindful and patient",
      note: "When his brothers recognised him, Yusuf said Allah had been gracious to them: whoever is mindful of Allah and patient, Allah does not let the reward of those who do good be lost (Quran 12:90).",
      chips: ["Quran 12:90"],
    },
    {
      state: "forgives",
      edge: 3,
      title: "He forgives",
      note: "He told his brothers: no blame on you today; may Allah forgive you (Quran 12:92).",
      chips: ["Quran 12:92"],
    },
    {
      state: "together",
      edge: 4,
      tone: "good",
      outcome: "Allah's kindness",
      title: "He names Allah's kindness",
      note: "With his parents and family brought to him, Yusuf said his Lord had been good to him when He took him out of prison and brought his family. He said his Lord is subtle in what He wills (Quran 12:100). He named Allah's kindness, not the years he lost.",
      chips: ["Quran 12:100"],
    },
    {
      state: "forgotten",
      tone: "good",
      outcome: "waiting well",
      title: "The wait was not wasted",
      note: "Go back to the several years at step 3. The Quran says Allah does not let the reward of the patient doers of good be lost (Quran 12:90). Waiting well: keep doing good where you are, keep using the means, keep asking Allah, and do not decide that Allah has forgotten you.",
    },
  ],
  tryThis: [
    "At step 6, check the prediction you made above the canvas: what did Yusuf speak about at the end?",
    "Look at each place in the story. What was someone doing there while they waited: asking, searching, praying or forgiving?",
  ],
  limits:
    "Surah Yusuf tells far more than this canvas shows, and the steps are only what the course's sources state. The canvas gives no number of years, because the Quran does not, and it does not choose between scholars' readings of 12:42. It shows what was done while waiting; it does not explain why anyone waited, and it does not promise that every wait ends the same way.",
};
