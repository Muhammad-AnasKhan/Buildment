import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 09.04 "Gratitude, dua and the akhirah".
// A relationship with Allah lives in small daily words: Alhamdulillah for each
// blessing, dua in every need, istighfar and tawbah after mistakes, and
// remembering where the journey ends.
// See spec.md.
export const livingWithAllah: SequenceSpec = {
  kind: "sequence",
  title: "A day lived with Allah",
  purpose: "Step through one ordinary day and see where gratitude, dua, tawbah and the akhirah come in.",
  summary: "Hamza says Alhamdulillah for small blessings, turns to Allah first when a problem comes, makes tawbah quickly after a sharp word, remembers death briefly, and asks Allah for Paradise three times.",
  actors: [
    { name: "Hamza" },
    { name: "His day" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "a blessing",
      title: "Alhamdulillah, out loud",
      note: "If you are grateful, I will surely give you more (Quran 14:7). Hamza says Alhamdulillah for hot water, a working laptop, his mother's tea.",
      chips: ["Quran 14:7"],
    },
    {
      from: 1,
      to: 0,
      label: "a problem",
      title: "Ask Allah first",
      note: "When you ask, ask Allah; when you seek help, seek help from Allah (Jami' at-Tirmidhi 2516, sahih). Your Lord says: call on Me, I will answer you (Quran 40:60). Then he takes the means.",
      chips: ["Jami' at-Tirmidhi 2516", "Quran 40:60"],
    },
    {
      from: 0,
      to: 0,
      label: "a sharp word",
      tone: "warn",
      outcome: "tawbah",
      title: "Tawbah, quickly",
      note: "He speaks sharply to his sister and regrets it. Those who, when they wrong themselves, remember Allah and ask forgiveness (Quran 3:135). He apologises before the evening.",
      chips: ["Quran 3:135"],
    },
    {
      from: 0,
      to: 0,
      label: "remembers death",
      title: "A brief remembrance",
      note: "Remember often the destroyer of pleasures, death (Jami' at-Tirmidhi 2307, hasan sahih). Be in this world as if you were a stranger or a traveller (Sahih al-Bukhari 6416).",
      chips: ["Jami' at-Tirmidhi 2307", "Sahih al-Bukhari 6416"],
    },
    {
      from: 0,
      to: 0,
      label: "asks Jannah x3",
      tone: "good",
      title: "Ask for Paradise",
      note: "Whoever asks Allah for Paradise three times, Paradise says: O Allah, admit him; and whoever seeks refuge from the Fire three times, the Fire says: O Allah, protect him from me (Jami' at-Tirmidhi 2572, sahih).",
      chips: ["Jami' at-Tirmidhi 2572"],
    },
  ],
  tryThis: [
    "Before step 2, predict: when a problem comes, what does Jami' at-Tirmidhi 2516 say to do first?",
    "Name three small blessings from today you have not yet thanked Allah for.",
  ],
  limits: "Remembering death is meant to bring focus and hope, not fear that stops you living. If thoughts of death feel heavy or frightening for a long time, talk to someone you trust or a counsellor.",
};
