import type { SequenceSpec } from "../renderers/sequence/types";

// Steady Hearts course, chapter 1.4 "Qadr and effort together".
// After her client says no, Yasmin's thoughts go back to the past with "if
// only" and come back with the same pain. Then she says "Allah decreed",
// takes one lesson, asks what benefits her now, seeks Allah's help and takes
// the next step (Sahih Muslim 2664). Every fact matches the chapter.
// See spec.md.
export const actNotIfOnly: SequenceSpec = {
  kind: "sequence",
  title: "After a setback: \"if only\" or the next step",
  purpose: "See how \"if only\" keeps sending your thoughts back to the past, and how \"Allah decreed\" with \"be keen on what benefits you\" moves them to today.",
  summary:
    "Yasmin's client tells her he has chosen another developer, so the second $200 will not come. Her thoughts go back to the past with 'if only I had...' and come back with the same pain and no step. Then she says 'Allah decreed, and He did what He willed', takes one lesson from the past and stops there, asks what would benefit her now, seeks Allah's help in dua, and sends two proposals for new work.",
  actors: [
    { name: "The past", sub: "what happened" },
    { name: "Yasmin", sub: "her thoughts" },
    { name: "Today", sub: "what she can do" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "client says no",
      title: "The setback",
      note: "Twelve days after the draft, the client replies. He thanks her, but he has chosen another developer whose design was closer to what he imagined. The first $200 covers the draft. The second $200 will not come.",
      chips: ["$200 paid", "$200 not coming"],
    },
    {
      from: 1,
      to: 0,
      label: "if only I had...",
      tone: "warn",
      outcome: "looking back",
      title: "\"If only\"",
      note: "Her thoughts go straight back. If only I had sent the draft two days earlier. If only I had used the colours from his old site. If only I had asked more questions at the start. If only I had never taken this client.",
    },
    {
      from: 0,
      to: 1,
      label: "same pain again",
      tone: "bad",
      outcome: "no step",
      title: "The past sends back the same pain",
      note: "Each \"if only\" comes back with the same sadness and no step. The past cannot be changed, so the thought goes round again. The Prophet warned that \"if only\" opens the door to the work of Satan (Sahih Muslim 2664).",
    },
    {
      from: 1,
      to: 1,
      label: "Allah decreed",
      title: "Say: Allah decreed",
      note: "She says the words the Prophet taught for this moment: Allah decreed, and He did what He willed. She is still sad. But she stops arguing with what has already happened.",
    },
    {
      from: 1,
      to: 0,
      label: "one lesson",
      title: "Take one lesson, then stop",
      note: "Looking back once to learn is not \"if only\". She writes one lesson: next time, send the client a simple sketch of the home page in the first week, before building all five pages. Then she closes that page of the notebook.",
      chips: ["sketch in week 1"],
    },
    {
      from: 1,
      to: 2,
      label: "what benefits?",
      title: "Be keen on what benefits you",
      note: "Now she turns to today. What would benefit her? Two proposals for new work. Her notes for a possible scholarship interview. A short, kind reply to the client asking for one line of feedback.",
    },
    {
      from: 1,
      to: 1,
      label: "seek His help",
      title: "Seek Allah's help",
      note: "Before she starts, she makes dua in her own words: for good in what is coming, and for help with today's work.",
    },
    {
      from: 1,
      to: 2,
      label: "next step",
      tone: "good",
      outcome: "acting",
      title: "Do not give up: the next step",
      note: "That evening, while the power is on, she sends the two proposals and the reply to the client. The setback is still real. But today has a step in it, and she has taken it.",
      chips: ["two proposals sent", "reply sent"],
    },
  ],
  tryThis: [
    "At step 5, check your prediction: what is the difference between taking one lesson and saying \"if only\"?",
    "Count the arrows that go back to \"The past\". Which one brings back something useful, and which one only brings back pain?",
  ],
  limits:
    "Real regret does not stop after one sentence; the \"if only\" thoughts may come back for days, and each time the same words help. The canvas does not explain why the client chose someone else; only Allah knows the whole of it. It shows where each kind of thought leads.",
};
