import type { SequenceSpec } from "../renderers/sequence/types";

// Building Habits That Last course, chapter 5.2 "Tracking that helps".
// Yousef tracks one week on a new card: a tick or a cross for the action he
// controls (20 minutes of practice questions after the evening meal) and a few
// words on each day. His memory says "I miss on tired days"; the notes show
// that every miss was an evening with no power. See spec.md.
export const trackerWeekNotes: SequenceSpec = {
  kind: "sequence",
  title: "Yousef's week: what the notes show",
  purpose: "Step through one week of tracking with a short note on each day, and see the notes find a pattern that memory missed.",
  summary:
    "Yousef makes a card with a tick or a cross and a few words for each day. He does his practice questions on Saturday, Sunday, Tuesday and Thursday, two of them on tired evenings. He misses Monday, Wednesday and Friday, and every miss has the same note: no power after the evening meal. He reads the card, sees the pattern, and writes one change: a paper version for evenings with no power.",
  actors: [
    { name: "Yousef", sub: "after the meal" },
    { name: "Laptop", sub: "needs power" },
    { name: "Tracker card", sub: "tick, cross, note" },
  ],
  steps: [
    {
      from: 0,
      to: 2,
      label: "make a new card",
      title: "Before the week: a card with room for words",
      note: "Yousef's old calendar had only ticks. His new card has one line a day: the day, a tick or a cross, and a few words. He tracks the action he controls, 20 minutes of practice questions, not his practice score.",
      chips: ["day", "tick or cross", "a few words"],
    },
    {
      from: 0,
      to: 1,
      label: "Sat: 20 min",
      tone: "good",
      outcome: "tick",
      title: "Saturday: done",
      note: "After the evening meal he opens the practice questions and works for 20 minutes. Note: 'Tired after the shop. Did it.'",
      chips: ["tired after the shop"],
    },
    {
      from: 0,
      to: 1,
      label: "Sun: 20 min",
      tone: "good",
      outcome: "tick",
      title: "Sunday: done",
      note: "Done again. Note: '20 min, easy start.'",
    },
    {
      from: 0,
      to: 2,
      label: "Mon: cross, note",
      tone: "warn",
      outcome: "cross",
      title: "Monday: missed",
      note: "The power is off from 18:00 to midnight, and the laptop battery lasts only a few minutes. Note: 'Power off after dinner. Laptop dead.'",
      chips: ["no power after the meal"],
    },
    {
      from: 0,
      to: 1,
      label: "Tue: 20 min",
      tone: "good",
      outcome: "tick",
      title: "Tuesday: done",
      note: "A long day at the shop. Note: 'Very tired. Did it anyway.'",
      chips: ["very tired"],
    },
    {
      from: 0,
      to: 2,
      label: "Wed: cross, note",
      tone: "warn",
      outcome: "cross",
      title: "Wednesday: missed",
      note: "Note: 'No power after dinner.'",
      chips: ["no power after the meal"],
    },
    {
      from: 0,
      to: 1,
      label: "Thu: 20 min",
      tone: "good",
      outcome: "tick",
      title: "Thursday: done",
      note: "Note: 'Power on. 20 min.'",
    },
    {
      from: 0,
      to: 2,
      label: "Fri: cross, note",
      tone: "warn",
      outcome: "cross",
      title: "Friday: missed",
      note: "Note: 'Power off all evening.'",
      chips: ["no power after the meal"],
    },
    {
      from: 0,
      to: 0,
      label: "read the notes",
      title: "Read the card, not your memory",
      note: "Done 4 of 7. Yousef's memory says 'I miss on tired days.' The card says something else: both tired evenings were ticks, and all three crosses say 'no power after dinner'. The habit depends on the laptop, and the laptop depends on the power.",
      chips: ["done 4 of 7", "tired days: both done", "misses: all no power"],
    },
    {
      from: 0,
      to: 2,
      label: "write one change",
      tone: "good",
      outcome: "one change",
      title: "One specific change",
      note: "He writes on the card: 'If there is no power after the evening meal, then I do 10 questions from my paper notebook by the lamp.' When the power is on, he copies a page of questions into the notebook, so a dark evening always has questions ready.",
      chips: ["if no power, then paper"],
    },
  ],
  tryThis: [
    "Before step 9, predict what the three missed days have in common. Then check the card.",
    "Look only at the ticks. Would a tick-only calendar have shown Yousef why he missed?",
  ],
  limits:
    "This is one week with a very clear pattern. Real notes are often messier: two causes on one day, or a miss with no clear reason. Then keep writing notes for another week or two before you change anything, and change one thing at a time.",
};
