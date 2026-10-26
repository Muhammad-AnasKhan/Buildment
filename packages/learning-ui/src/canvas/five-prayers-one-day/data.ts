import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 02.03 "A plan for each prayer".
// Each of the five prayers falls in a different part of the day, so each one
// needs its own cue and its own plan. Fajr is planned the night before.
// See spec.md.
export const fivePrayersOneDay: SequenceSpec = {
  kind: "sequence",
  title: "Five prayers, five plans",
  purpose: "Follow Hamza through one office day and see the cue and the plan behind each prayer.",
  summary: "Hamza sleeps after Isha with an alarm across the room for Fajr, blocks his calendar for Dhuhr and Asr in the office prayer room, leaves the office in time for Maghrib near home, and walks to Isha with his phone on the charger.",
  actors: [
    { name: "Hamza" },
    { name: "Home and mosque" },
    { name: "Office", sub: "prayer room" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "night before",
      title: "Fajr starts the night before",
      note: "At 22:00 his phone goes on the charger in the hall, and the alarm clock sits across the room so he must stand up to stop it. Asleep by 22:15, he gets about seven hours before Fajr. The Prophet, peace be upon him, said Satan ties three knots on the sleeper; remembering Allah, wudu and prayer undo them one by one (Sahih al-Bukhari 1142).",
      chips: ["Sahih al-Bukhari 1142", "alarm across room"],
    },
    {
      from: 0,
      to: 1,
      label: "Fajr",
      tone: "good",
      outcome: "if alarm, then up",
      title: "Fajr: if the alarm, then feet on the floor",
      note: "If the alarm rings, then he stands, remembers Allah, and goes straight to wudu. No phone. Whoever prays Fajr in congregation, it is as if he prayed the whole night (Sahih Muslim 656).",
      chips: ["Sahih Muslim 656"],
    },
    {
      from: 0,
      to: 2,
      label: "Dhuhr",
      title: "Dhuhr: a calendar block",
      note: "At the office, a recurring 20-minute block 'Dhuhr' sits in his calendar from the adhan time. Colleagues see it and do not book him. If the adhan time arrives in a meeting, then he asks for five minutes at the next pause.",
    },
    {
      from: 0,
      to: 2,
      label: "Asr",
      title: "Asr: the one that slips",
      note: "Asr comes when work is busiest. Allah says: guard the prayers, and the middle prayer (Quran 2:238). He sets a second block, and his phone reminder says only 'Stand up now'.",
      chips: ["Quran 2:238"],
    },
    {
      from: 2,
      to: 1,
      label: "Maghrib",
      tone: "warn",
      outcome: "short window",
      title: "Maghrib: the short window",
      note: "Maghrib's time is short and it often falls on his commute. If he is at the office when Asr ends, then he leaves early enough to reach the mosque near home, or prays with colleagues at the office.",
    },
    {
      from: 0,
      to: 1,
      label: "Isha",
      title: "Isha links to tomorrow's Fajr",
      note: "He walks to Isha, comes home, and the phone goes on the charger. Whoever prays Isha in congregation, it is as if he prayed half the night (Sahih Muslim 656). An early night after Isha is tomorrow's Fajr.",
      chips: ["Sahih Muslim 656"],
    },
  ],
  tryThis: [
    "Before step 1, predict: which prayer does this plan start with, and why is it not Fajr's alarm?",
    "Match each prayer to its obstacle: sleep, meetings, the busiest hour, a short window, the phone at night.",
  ],
  limits: "This shows one office day for one man who lives near a mosque. Your prayers, times and obstacles will differ. Women, students and remote workers adapt the same plan to home, campus or a shared room. Prayer times change through the year, so plans need checking each month.",
};
