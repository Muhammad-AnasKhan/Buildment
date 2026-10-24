import type { StateMachineSpec } from "../renderers/state-machine/types";

// Steady Hearts course, chapter 1.3 "Life as a test, with a purpose".
// The same hard week in Yasmin's life, read two ways. Read as "Allah is angry
// with me", it leads to giving up. Read as a test with a purpose (Quran 67:2,
// Jami' at-Tirmidhi 2398), it leads to patience and good work. The week itself
// never changes. Every fact matches the chapter. See spec.md.
export const aHardWeekTwoReadings: StateMachineSpec = {
  kind: "state-machine",
  title: "One hard week, two readings",
  purpose: "See how the same hard week leads to giving up or to patience and good work, depending on how it is read.",
  summary:
    "Yasmin's week is hard: her client has been silent for ten days, the power comes mostly at night, and her younger brother has a fever. Read as a sign that Allah is angry with her, the week leads her to stop trying. Read as a test with a purpose, as the Quran describes life, and knowing that the prophets were tested most, the same week leads her to patience, to asking for help and to her next good deed.",
  states: [
    { id: "anger", name: "Allah is angry", sub: "reading 1", col: 0, row: 0 },
    { id: "week", name: "A hard week", sub: "night power, no reply", col: 1, row: 0 },
    { id: "test", name: "A test, a purpose", sub: "reading 2", col: 2, row: 0 },
    { id: "giveup", name: "Give up", sub: "why try at all?", col: 0, row: 1 },
    { id: "work", name: "Good work", sub: "the next step", col: 1, row: 1 },
    { id: "steady", name: "Patience", sub: "steady, asks for help", col: 2, row: 1 },
  ],
  edges: [
    { from: "week", to: "anger", label: "read as" },
    { from: "anger", to: "giveup", label: "so" },
    { from: "week", to: "test", label: "read as" },
    { from: "test", to: "steady", label: "so" },
    { from: "steady", to: "work", label: "then" },
  ],
  steps: [
    {
      state: "week",
      title: "The facts of the week",
      note: "It is ten days since Yasmin sent her draft, and her polite follow-up has had no answer either. This week the power comes mostly at night, from 01:00 to 07:00. Her younger brother has a fever, and she sits with him in the evenings. She has done only two hours of paid work since Saturday.",
      chips: ["client silent for 10 days", "power 01:00 to 07:00", "brother has a fever"],
    },
    {
      state: "anger",
      edge: 0,
      title: "Reading 1: Allah is angry with me",
      note: "Late one night, a thought comes: maybe Allah is angry with me, and that is why everything is stuck. Once she reads the week this way, every small thing seems to prove it. This reading does not come from the Quran or the Sunnah. It comes from tiredness and fear.",
    },
    {
      state: "giveup",
      edge: 1,
      tone: "bad",
      outcome: "stops trying",
      title: "Where reading 1 leads",
      note: "If Allah is angry with her, she thinks, why send proposals, and why ask Him for the scholarship? She closes the laptop and does not send the two proposals she planned. The week has not changed. Her reading of it has stopped her.",
    },
    {
      state: "test",
      edge: 2,
      title: "Reading 2: a test with a purpose",
      note: "Allah created death and life to test which of us is best in deeds (Quran 67:2). People who say 'we believe' are tested, as those before them were (Quran 29:2). When the Prophet, peace be upon him, was asked who is tested most severely, he said the prophets, then those most like them (Jami' at-Tirmidhi 2398). So hardship cannot be read as proof that Allah is angry with her.",
      chips: ["Quran 67:2", "Quran 29:2", "Tirmidhi 2398"],
    },
    {
      state: "steady",
      edge: 3,
      title: "Where reading 2 leads: patience",
      note: "Allah does not place on any soul more than it can bear (Quran 2:286). That is a mercy, not an order to cope alone. Yasmin asks her cousin to sit with her brother for an hour each evening, and she makes dua in her own words.",
    },
    {
      state: "work",
      edge: 4,
      tone: "good",
      outcome: "keeps acting",
      title: "Then: the next good deed",
      note: "If the test is about the best deeds, the question becomes: what is the best thing I can do now? She sets an alarm for 05:00, uses two hours of night power to send the two proposals, and cares for her brother with patience. With hardship comes ease (Quran 94:5 to 6).",
      chips: ["two proposals sent", "brother cared for"],
    },
  ],
  tryThis: [
    "At step 4, check your prediction: who did the Prophet say are tested most severely?",
    "Compare step 3 and step 6. The week is the same in both. What changed?",
  ],
  limits:
    "A reading of a week is not a switch: real thoughts come back, and tiredness makes the first reading louder. The canvas does not explain why any hardship happens to any person; only Allah knows that. It shows what each reading leads a person to do next.",
};
