import type { StateMachineSpec } from "../renderers/state-machine/types";

// Building Habits That Last course, chapter 6.4 "A daily rhythm: prayer times,
// sleep, health and family". Dina's tea with her mother, written two ways:
// "after the evening meal" (the meal follows the sunset prayer) and "at 18:00".
// In winter both land in the same calm moment. In summer the sunset prayer and
// the meal move about three hours later, the event habit moves with them, and
// the clock habit lands in the busy hour. Times are this example's. See spec.md.
export const prayerTimeAnchors: StateMachineSpec = {
  kind: "state-machine",
  title: "Event or clock: what happens when the seasons change",
  purpose: "Follow one habit tied to an event and the same habit tied to a clock time, from winter to summer, and see which one keeps its place in the day.",
  summary:
    "In Dina's family the evening meal comes after the sunset prayer. In winter, in this example, the prayer is at about 16:45 and the meal ends at about 17:45, so tea after the meal and tea at 18:00 are the same moment. In summer the prayer is at about 19:45 and the meal ends at about 20:45. Tea after the meal moves with it. Tea at 18:00 now rings while Dina is cooking and caring for her mother, so it is rushed or skipped.",
  states: [
    { id: "prayer", name: "Sunset prayer", sub: "moves with the sun", col: 0, row: 0 },
    { id: "meal", name: "Evening meal", sub: "after the prayer", col: 1, row: 0 },
    { id: "tea", name: "Tea with mother", sub: "15 minutes", col: 2, row: 0 },
    { id: "skipped", name: "Tea skipped", sub: "or rushed", col: 0, row: 1 },
    { id: "busy", name: "Busy hour", sub: "summer: cooking", col: 1, row: 1 },
    { id: "alarm", name: "Alarm at 18:00", sub: "fixed clock time", col: 2, row: 1 },
  ],
  edges: [
    { from: "prayer", to: "meal", label: "then" },
    { from: "meal", to: "tea", label: "then" },
    { from: "alarm", to: "tea", label: "fit" },
    { from: "alarm", to: "busy", label: "summer" },
    { from: "busy", to: "skipped", label: "clash" },
  ],
  steps: [
    {
      state: "prayer",
      edge: 0,
      title: "Winter: the event plan",
      note: "Dina's plan: 'After the evening meal, I make mint tea and sit with my mother for 15 minutes, phones away.' In winter, in this example, the sunset prayer is at about 16:45, and the family eats after it.",
      chips: ["winter", "prayer about 16:45"],
    },
    {
      state: "meal",
      edge: 1,
      title: "The meal is the anchor",
      note: "The meal ends at about 17:45. Tea follows at once: the end of the meal is the cue, whatever the clock says.",
      chips: ["meal ends about 17:45"],
    },
    {
      state: "alarm",
      edge: 2,
      title: "Winter: the clock plan",
      note: "Her brother suggests a simpler plan: a phone alarm at 18:00 that says 'tea with mother'. In winter, 18:00 comes just after the meal, so the alarm and the meal point to the same calm moment.",
      chips: ["winter", "18:00 is after the meal"],
    },
    {
      state: "tea",
      tone: "good",
      outcome: "both fit",
      title: "In winter, both plans look the same",
      note: "Tea at about 17:50 or tea at 18:00: a few minutes apart, in the same quiet part of the evening. Nothing yet shows which plan is stronger.",
    },
    {
      state: "prayer",
      edge: 0,
      title: "Summer: the sun moves the day",
      note: "Prayer times follow the sun, so they move through the year. In summer, in this example, the sunset prayer is at about 19:45, three hours later than in winter. The family meal moves with it.",
      chips: ["summer", "prayer about 19:45"],
    },
    {
      state: "tea",
      edge: 1,
      tone: "good",
      outcome: "moved with the day",
      title: "The event plan moves too",
      note: "The meal ends at about 20:45, and tea follows it, as always. The clock time changed by three hours, but the habit kept its place in the order of the evening.",
      chips: ["tea about 20:45"],
    },
    {
      state: "busy",
      edge: 3,
      title: "Summer: the clock plan stays at 18:00",
      note: "At 18:00 in summer the meal is still two hours away. Dina is cooking and helping her mother. The alarm rings in the busiest hour of her afternoon.",
      chips: ["summer", "18:00 is before the meal"],
    },
    {
      state: "skipped",
      edge: 4,
      tone: "warn",
      outcome: "drifted",
      title: "The clock habit drifts away from the day",
      note: "She turns the alarm off and means to sit down later. Some days the tea happens late; often it does not happen. The clock time stayed the same, so the habit moved to a different part of her day.",
    },
  ],
  tryThis: [
    "Before step 5, predict which plan still fits Dina's evening in summer: tea after the meal, or tea at 18:00. Then check.",
    "Think of a clock-time habit of your own, or Dina's 18:00 alarm. Which event in the day could it follow instead?",
  ],
  limits:
    "The times are this example's: real prayer times depend on where you live and the date. Research has not shown that event cues beat clock cues in general; in the few studies that compared them they worked about equally well. The point here is fit with your own day: a clock time works if you check it each season, and an event works only if it really happens every day.",
};
