import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 02.02 "The first takbir".
// Catching the first takbir (takbir al-ula, in Urdu takbir-e-ula) means being
// in the row when the imam says 'Allahu akbar' to start the prayer, and saying
// your own takbir right after him. The way to catch it is leaving early, not
// running.
// See spec.md.
export const adhanToFirstTakbir: SequenceSpec = {
  kind: "sequence",
  title: "From the adhan to the first takbir",
  purpose: "Step through one Maghrib, from the adhan to the first takbir, and see where the first takbir is really won or lost.",
  summary: "At the adhan Hamza stops work and repeats the words, makes wudu at home, walks to the mosque with calm, waits in the row, and says his takbir right after the imam; on a day he leaves late he walks calmly anyway and completes what he missed.",
  actors: [
    { name: "Hamza", sub: "at home" },
    { name: "The mosque", sub: "6 min walk" },
    { name: "The imam" },
  ],
  steps: [
    {
      from: 1,
      to: 0,
      label: "adhan",
      title: "The adhan is the real start",
      note: "At Maghrib the adhan comes. This is the moment that decides the first takbir. Hamza closes the laptop and repeats the words of the adhan. The iqamah will come in about five minutes, so the time to move is now.",
    },
    {
      from: 0,
      to: 0,
      label: "wudu at home",
      title: "Wudu before he leaves",
      note: "He makes wudu at home, carefully. Wudu done well when it is hard is one of the deeds the Prophet, peace be upon him, said wipes away sins and raises ranks, together with many steps to the mosque and waiting for the prayer (Sahih Muslim 251).",
      chips: ["Sahih Muslim 251"],
    },
    {
      from: 0,
      to: 1,
      label: "walks, calmly",
      title: "Walking, not running",
      note: "He walks the six minutes with calm. The Prophet said: when you hear the iqamah, walk to the prayer with calm and dignity and do not rush; pray what you catch and complete what you missed (Sahih al-Bukhari 636).",
      chips: ["Sahih al-Bukhari 636"],
    },
    {
      from: 1,
      to: 1,
      label: "waits in row",
      tone: "good",
      outcome: "in the row",
      title: "In the row before the iqamah",
      note: "He arrives with a minute to spare and sits in the row. While a person waits for the prayer, he is counted as in prayer, and the angels ask Allah to forgive him and have mercy on him (Sahih al-Bukhari 659).",
      chips: ["Sahih al-Bukhari 659"],
    },
    {
      from: 2,
      to: 1,
      label: "Allahu akbar",
      tone: "good",
      outcome: "first takbir",
      title: "The first takbir",
      note: "The imam says 'Allahu akbar'. Hamza says his own takbir right after him. The imam is there to be followed (Sahih al-Bukhari 722), so the first takbir is the follower's takbir straight after the imam's.",
    },
    {
      from: 0,
      to: 1,
      label: "late day: calm",
      tone: "warn",
      outcome: "still calm",
      title: "On a late day",
      note: "Another evening a call runs long and he leaves at the iqamah. He hears the imam begin while he is still on the street. He does not run. He joins where the imam is and completes what he missed (Sahih al-Bukhari 636). Tomorrow he will close the laptop at the adhan.",
      chips: ["Sahih al-Bukhari 636"],
    },
  ],
  tryThis: [
    "Before step 3, predict: is it better to run the last 100 metres to catch the takbir, or to walk?",
    "Find the step where the first takbir was really decided. Is it at the iqamah, or earlier?",
  ],
  limits: "This shows one man, one prayer and one mosque six minutes away. Times between adhan and iqamah differ from mosque to mosque. Women and anyone who prays at home or at work have their own version of this habit in chapter 2.2. Questions about who must pray in the mosque are fiqh: ask a scholar you trust.",
};
