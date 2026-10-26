import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 05.02 "After the salam".
// The adhkar after each prayer (namazon ke baad ke azkar) are the easiest
// habit to stack, because the cue, the salam, already happens five times a
// day.
// See spec.md.
export const afterTheSalam: SequenceSpec = {
  kind: "sequence",
  title: "After the salam",
  purpose: "Step through the three minutes after one prayer and see the order of the adhkar and their sources.",
  summary: "After the imam's salam, Hamza says astaghfirullah three times and 'Allahumma antas-salam', then SubhanAllah, Alhamdulillah and Allahu akbar 33 times each with the tahlil to complete a hundred, then the dua the Prophet taught Mu'adh; on days he must leave quickly he says them while walking.",
  actors: [
    { name: "The imam" },
    { name: "Hamza", sub: "in the row" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "salam",
      title: "The cue: the salam",
      note: "The imam turns his head: 'As-salamu alaykum wa rahmatullah'. This cue comes five times a day, in the same place, with no alarm needed.",
    },
    {
      from: 1,
      to: 1,
      label: "istighfar x3",
      title: "Forgiveness, then peace",
      note: "When the Prophet, peace be upon him, finished his prayer, he asked forgiveness three times and said: 'O Allah, You are Peace and from You is peace; blessed are You, O Owner of majesty and honour' (Sahih Muslim 591).",
      chips: ["Sahih Muslim 591"],
    },
    {
      from: 1,
      to: 1,
      label: "33, 33, 33 + 1",
      tone: "good",
      outcome: "100",
      title: "Tasbih, tahmid, takbir",
      note: "SubhanAllah 33 times, Alhamdulillah 33 times, Allahu akbar 33 times, and to complete a hundred: 'La ilaha illallahu wahdahu la sharika lah...'. His sins are forgiven even if they are like the foam of the sea (Sahih Muslim 597).",
      chips: ["Sahih Muslim 597"],
    },
    {
      from: 1,
      to: 1,
      label: "Mu'adh's dua",
      title: "The dua for every prayer",
      note: "The Prophet took Mu'adh by the hand, told him twice that he loved him, and advised him never to leave saying after every prayer: 'O Allah, help me to remember You, to thank You, and to worship You well' (Sunan Abi Dawud 1522, graded sahih).",
      chips: ["Sunan Abi Dawud 1522"],
    },
    {
      from: 1,
      to: 1,
      label: "must leave? walk",
      tone: "warn",
      outcome: "said walking",
      title: "When he must leave quickly",
      note: "At the office, a meeting starts right after Dhuhr. He says the adhkar while walking back to his desk. Allah praises those who remember Him standing, sitting and lying on their sides (Quran 3:191).",
      chips: ["Quran 3:191"],
    },
  ],
  tryThis: [
    "Before step 3, predict: how long do all of these take, said at a normal pace? Time yourself after your next prayer.",
    "Which one would you start with this week if you could add only one?",
  ],
  limits: "This is one common order of the sourced adhkar after the prayer; there are others in the books of adhkar, and scholars describe the order differently. It takes roughly three minutes at a normal pace, more when learning. Women and men praying at home use the same adhkar after their own salam.",
};
