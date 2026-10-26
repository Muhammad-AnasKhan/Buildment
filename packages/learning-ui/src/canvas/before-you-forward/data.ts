import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 10.04 "Mobile and internet".
// The phone gathers every test of the tongue, the eyes and time into one
// device. A few planned rules handle most of it.
// See spec.md.
export const beforeYouForward: SequenceSpec = {
  kind: "sequence",
  title: "Before you forward",
  purpose: "Follow one forwarded message and one evening on the phone, and see the sourced rule for each step.",
  summary: "Hamza receives a shocking forwarded message, checks it before sharing, finds it false, does not forward it, refuses to share a screenshot of a private chat, and uses app limits so his evening is not lost.",
  actors: [
    { name: "Group chat" },
    { name: "Hamza" },
    { name: "His phone", sub: "settings" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "shocking forward",
      tone: "warn",
      title: "A shocking message",
      note: "A forwarded message claims something terrible about a shop in his area, with no source.",
    },
    {
      from: 1,
      to: 1,
      label: "verify first",
      title: "Verify",
      note: "If a person of bad character brings you news, verify it, lest you harm people out of ignorance (Quran 49:6). He checks; it is false.",
      chips: ["Quran 49:6"],
    },
    {
      from: 1,
      to: 0,
      label: "does not forward",
      tone: "good",
      title: "Not passing it on",
      note: "It is enough of a sin for a man to narrate everything he hears (Sunan Abi Dawud 4992, sahih).",
      chips: ["Sunan Abi Dawud 4992"],
    },
    {
      from: 0,
      to: 1,
      label: "share private chat",
      title: "Privacy",
      note: "Someone asks him to share a screenshot of a friend's private message. Do not spy on one another (Quran 49:12; Sahih Muslim 2563). He refuses.",
      chips: ["Quran 49:12", "Sahih Muslim 2563"],
    },
    {
      from: 1,
      to: 2,
      label: "limits + filter",
      tone: "good",
      outcome: "evening kept",
      title: "Limits and filters",
      note: "Two blessings many people lose: health and free time (Sahih al-Bukhari 6412). He sets a daily limit on two apps and turns on content filters, as taking the means.",
      chips: ["Sahih al-Bukhari 6412"],
    },
  ],
  tryThis: [
    "Before step 3, predict: if Hamza cannot verify a message, should he forward it 'just in case'?",
    "Which one setting on your phone would protect you most?",
  ],
  limits: "Some versions of the hearsay hadith say 'enough of a lie'; the narration checked here (Sunan Abi Dawud 4992) says 'enough of a sin'. App limits and filters are tools; the habit is the choice behind them.",
};
