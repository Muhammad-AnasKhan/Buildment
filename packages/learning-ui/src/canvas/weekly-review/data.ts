import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 15.02 "A tracker that helps".
// A tracker should help you see patterns and restart quickly, not punish you
// or feed showing off. A weekly review on one fixed day turns ticks into
// decisions.
// See spec.md.
export const weeklyReview: SequenceSpec = {
  kind: "sequence",
  title: "The Friday review",
  purpose: "Step through Hamza's weekly review and see how he turns a week of ticks into one decision.",
  summary: "Each Friday after Jumu'ah Hamza counts days done for each habit, looks for the habit with the most misses and the reason in his notes, changes one thing about it, decides whether he is ready to add next week's new habit, and renews his intention.",
  actors: [
    { name: "Hamza" },
    { name: "His tracker", sub: "private" },
    { name: "Next week" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "count days done",
      title: "Count, do not judge",
      note: "He counts days done for each habit: Maghrib 7 of 7, Fajr 4 of 7, Quran 6 of 7. A count of 4 out of 7 is information. A broken streak would have said zero.",
    },
    {
      from: 1,
      to: 0,
      label: "most misses: Fajr",
      tone: "warn",
      outcome: "find why",
      title: "Find the habit with the most misses",
      note: "Fajr has the most misses. His notes on the missed days say: 'slept 00:30', 'slept 00:45', 'phone in bed'. The misses have one cause, not three.",
    },
    {
      from: 0,
      to: 2,
      label: "change one thing",
      title: "Change one thing",
      note: "He changes one thing: the phone goes on the charger in the hall at 22:00. If he changes three things at once, he will not know which one helped.",
    },
    {
      from: 0,
      to: 2,
      label: "add a new one?",
      title: "Ready for the next habit?",
      note: "His rule: add next week's new habit only if every habit so far was done on at least 5 of 7 days. This week Fajr was 4 of 7, so he waits a week. One step at a time is still progress.",
    },
    {
      from: 0,
      to: 0,
      label: "renew intention",
      tone: "good",
      outcome: "for Allah",
      title: "Renew the intention",
      note: "He ends with a quiet dua and renews his intention: the tracker is a tool, not the goal. Actions are by intentions (Sahih al-Bukhari 1).",
      chips: ["Sahih al-Bukhari 1"],
    },
  ],
  tryThis: [
    "Before step 4, predict: should Hamza add next week's new habit even though Fajr was 4 of 7?",
    "Look at step 2. What would Hamza have missed if he had only counted, without writing a few words on each missed day?",
  ],
  limits: "The 5-of-7 rule is Hamza's own rule, not a teaching of the sources; pick a rule that fits you. Obligatory prayers are not optional habits to drop when the count is low; the review only helps you plan how to keep them. Keep the tracker private.",
};
