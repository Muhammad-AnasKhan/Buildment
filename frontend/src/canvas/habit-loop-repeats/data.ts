import type { StateMachineSpec } from "../renderers/state-machine/types";

// Building Habits That Last course, chapter 1.3 "Cue, routine and reward".
// Rami's phone habit: the cue (sitting down), the routine (picking up the
// phone) and the reward (something new), repeated in the same place, build a
// link. After many weeks the cue can start the routine with less need for the
// reward ("can", not "will": the human evidence is mixed). See spec.md.
export const habitLoopRepeats: StateMachineSpec = {
  kind: "state-machine",
  title: "How Rami's phone habit was built",
  purpose: "Go round the cue, the routine and the reward, and watch the link grow until the cue can start the habit with less need for the reward.",
  summary:
    "Rami sits down after dinner (the cue), picks up the phone (the routine) and finds something new (the reward). Repeated in the same place every evening, the link from sitting down to the phone grows. After many weeks it is a strong habit, and on a night with nothing new the cue can still start the routine, because the reward matters less once a habit is strong.",
  states: [
    { id: "cue", name: "Cue", sub: "sits down after dinner", col: 0, row: 0 },
    { id: "routine", name: "Routine", sub: "picks up the phone", col: 1, row: 0 },
    { id: "strong", name: "Strong habit", sub: "after many weeks", col: 2, row: 0 },
    { id: "link", name: "Link grows", sub: "same place each day", col: 0, row: 1 },
    { id: "reward", name: "Reward", sub: "something new", col: 1, row: 1 },
    { id: "cueAlone", name: "Runs on the cue", sub: "reward matters less", col: 2, row: 1 },
  ],
  edges: [
    { from: "cue", to: "routine", label: "starts" },
    { from: "routine", to: "reward", label: "get" },
    { from: "reward", to: "link", label: "repeat" },
    { from: "link", to: "cue", label: "so" },
    { from: "routine", to: "strong", label: "weeks later" },
    { from: "strong", to: "cueAlone", label: "can" },
  ],
  steps: [
    {
      state: "cue",
      edge: 0,
      title: "The cue: sitting down",
      note: "After dinner Rami sits down on the mattress in the room he shares with his brothers. Sitting down is the cue. It happens every evening, in the same place.",
      chips: ["after dinner", "the mattress", "tea in hand"],
    },
    {
      state: "routine",
      edge: 1,
      title: "The routine: the phone",
      note: "His hand picks up the phone and opens his messages, then videos. This is the part you could film.",
    },
    {
      state: "reward",
      edge: 2,
      tone: "good",
      outcome: "reward",
      title: "The reward: something new",
      note: "A message from a friend, a funny video, a small break from the day. The reward makes him want to do it again tomorrow. While a habit forms, the reward does real work.",
    },
    {
      state: "link",
      edge: 3,
      title: "The same place, again and again",
      note: "The next evening the same cue, the same routine and often the same kind of reward. Each repeat in the same situation makes the link from sitting down to the phone a little stronger.",
      chips: ["week 1", "week 2", "week 3"],
    },
    {
      state: "cue",
      edge: 0,
      title: "Round again, with a stronger link",
      note: "Now sitting down starts the routine faster. Rami no longer notices the moment his hand moves. The loop has gone round dozens of times.",
      chips: ["week 6"],
    },
    {
      state: "strong",
      edge: 4,
      title: "Weeks later: a strong habit",
      note: "After many weeks, the phone is in his hand before he has a single thought about it, wherever he sits down.",
    },
    {
      state: "cueAlone",
      edge: 5,
      tone: "warn",
      outcome: "can",
      title: "The cue can start it alone",
      note: "On Friday nobody writes, and he knows it. He sits down and the hand still moves. Once a habit is strong, the cue can start the routine with less need for the reward. This works in both directions: it keeps the phone habit going, and it could carry a study habit on tired nights.",
    },
  ],
  tryThis: [
    "Before step 7, predict whether the routine can still start on a night with no reward. Then check.",
    "At step 7, cover the reward box with your finger. What is left that can start the habit?",
  ],
  limits:
    "Real habits have many cues at once, and rewards are not all or nothing. The evidence that strong habits run without the reward comes mostly from animals trained for a long time; in people it is mixed, so the canvas says can, not will.",
};
