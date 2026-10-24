import type { StateMachineSpec } from "../renderers/state-machine/types";

// Building Habits That Last course, chapter 4.3 "Same cue, same need, new
// routine". Maha's night: the cue (lying in bed at 23:00, tired, phone on the
// pillow) starts scrolling until about 1:00. Asking what scrolling gives her
// finds the need (her mind slowing down after a busy day). A paper book of
// short stories meets the same need at the same cue, and she is asleep by
// about 23:45 on most nights. See spec.md.
export const mahaNightLoop: StateMachineSpec = {
  kind: "state-machine",
  title: "Maha's night: same cue, new routine",
  purpose: "Find the cue and the need behind Maha's scrolling, then swap the routine for one that meets the same need while the cue stays.",
  summary:
    "Lying in bed at 23:00, tired, with the phone on the pillow, starts scrolling until about 1:00, and she wakes tired. Asking what scrolling gives her finds the need: her mind slowing down after a busy day. A paper book of short stories meets the same need at the same cue, and on 4 of 6 nights she is asleep by about 23:45. On the other nights the phone on the pillow still pulls her back.",
  states: [
    { id: "cue", name: "In bed, 23:00", sub: "the cue", col: 0, row: 0 },
    { id: "scroll", name: "Scrolls videos", sub: "old routine", col: 1, row: 0 },
    { id: "late", name: "Asleep at 1:00", sub: "tired at 8:00", col: 2, row: 0 },
    { id: "need", name: "Mind slows down", sub: "the need", col: 0, row: 1 },
    { id: "book", name: "Reads a story", sub: "new routine", col: 1, row: 1 },
    { id: "early", name: "Asleep by 23:45", sub: "rested at 8:00", col: 2, row: 1 },
  ],
  edges: [
    { from: "cue", to: "scroll", label: "old" },
    { from: "scroll", to: "late", label: "costs" },
    { from: "cue", to: "need", label: "why" },
    { from: "need", to: "book", label: "new" },
    { from: "book", to: "early", label: "then" },
  ],
  steps: [
    {
      state: "cue",
      title: "The cue",
      note: "After a long day at the pharmacy counter, Maha lies down at 23:00. The flat is quiet, she is tired, and the phone lies on the pillow beside her, charging, because it is also her alarm.",
      chips: ["place: her bed", "time: 23:00", "object: phone on the pillow"],
    },
    {
      state: "scroll",
      edge: 0,
      title: "The old routine",
      note: "She opens the video app 'for a few videos'. One video starts before the last has finished.",
    },
    {
      state: "late",
      edge: 1,
      tone: "bad",
      outcome: "about 1:00",
      title: "What it costs",
      note: "She puts the phone down at about 1:00. Her alarm rings at 6:45, and at the counter she reads each prescription twice to be sure.",
      chips: ["tired at 8:00"],
    },
    {
      state: "need",
      edge: 2,
      title: "Ask why: what does it give her?",
      note: "One night she lies in the dark with no phone. She feels restless, and the day's customers replay in her head. The videos were not about the videos: they slowed her mind down. That is the need, and it is real.",
      chips: ["test: one night with no phone", "need: a quiet mind"],
    },
    {
      state: "book",
      edge: 3,
      title: "A new routine for the same need",
      note: "She tries two replacements at the same cue. A downloaded audio story, played with the screen off, helps a little. A paper book of short stories by a small lamp works best: one short story, and her mind slows down.",
      chips: ["same cue: in bed at 23:00", "same need: a quiet mind"],
    },
    {
      state: "early",
      edge: 4,
      tone: "good",
      outcome: "4 of 6",
      title: "The cue stays, the routine changes",
      note: "Her if-then plan: 'When I lie down at 23:00, I read one short story.' In the first week, in this example, she read on 4 of 6 nights and was asleep by about 23:45 on those nights.",
      chips: ["4 of 6 nights", "asleep by about 23:45"],
    },
    {
      state: "scroll",
      tone: "warn",
      outcome: "old routine",
      title: "The phone still pulls",
      note: "On the other 2 nights she was very tired, the phone lit up on the pillow, and the old routine won. The new routine meets the need, but the old cue is still right beside her. Chapter 4.4 moves it.",
    },
  ],
  tryThis: [
    "Check the prediction you made above the canvas: at step 5, which replacement met the need she found at step 4?",
    "At the last step, name what is still in the bedroom that starts the old routine.",
  ],
  limits:
    "Real needs are often mixed: scrolling can give calm, fun and company at the same time, and one replacement may meet only part of it. Testing one night is a quick practical method, not a research procedure. A replacement is weaker against a very strong habit when the old cue stays close, so it works best together with the tools in chapter 4.4. The numbers belong to this example.",
};
