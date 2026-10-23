import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 3.6 "Notes you own, in your own
// words". Lina's routing page grows up: captured, rewritten in her own words,
// linked to a lab, reviewed every Friday, then used to teach. Pasting an AI
// summary as the note is refused. See spec.md.
export const notePageLifecycle: StateMachineSpec = {
  kind: "state-machine",
  title: "A note page grows up",
  purpose: "Follow one notes page from rough lines to a page you can test yourself with, and see the shortcut it refuses.",
  summary:
    "Lina's routing page starts as rough lines captured during her routing week. Pasting a chat assistant's summary as the page is refused. She rewrites the page in her own words with the sources closed, links it to her lab sheet and quiz log, reviews it every Friday by answering its recall questions, and finally uses it to teach a classmate.",
  states: [
    { id: "captured", name: "Captured", sub: "rough lines", col: 0, row: 0 },
    { id: "own", name: "Own words", sub: "sources closed", col: 1, row: 0 },
    { id: "linked", name: "Linked", sub: "to a lab", col: 2, row: 0 },
    { id: "reviewed", name: "Reviewed", sub: "every Friday", col: 2, row: 1 },
    { id: "used", name: "Used", sub: "to teach", col: 1, row: 1 },
  ],
  edges: [
    { from: "captured", to: "captured", label: "paste summary", kind: "rejected" },
    { from: "captured", to: "own", label: "rewrite" },
    { from: "own", to: "linked", label: "link lab" },
    { from: "linked", to: "reviewed", label: "Fri" },
    { from: "reviewed", to: "used", label: "teach it" },
  ],
  steps: [
    {
      state: "captured",
      title: "Captured",
      note: "During her routing week, Lina jots rough lines: the audio's claim she checked, the textbook page that corrected it, a question from the lab. Untidy, but every line has a source.",
      chips: ["a source on every line"],
    },
    {
      state: "captured",
      edge: 0,
      tone: "bad",
      outcome: "refused",
      title: "The shortcut: paste a summary",
      note: "A chat assistant offers a tidy, correct summary of routing. Pasting it as the page is refused. It is the AI's recall, not hers: it reads smoothly and gives her nothing to test herself with.",
    },
    {
      state: "own",
      edge: 1,
      title: "Rewritten in her own words",
      note: "With the sources closed, she fills the template: her explanation, a picture checked against her slides, the 10.1.5.9 example, and what breaks: no matching route and no default route, so the router drops the packet.",
      chips: ["five angles", "open questions", "recall questions"],
    },
    {
      state: "linked",
      edge: 2,
      title: "Linked to what she did",
      note: "She links lab sheet 4, where she read a real routing table, and her quiz log. Now the rule on the page is tied to a table she actually used.",
    },
    {
      state: "reviewed",
      edge: 3,
      tone: "warn",
      outcome: "1 missed",
      title: "Reviewed every Friday",
      note: "On Friday she covers the page and answers its three recall questions. She misses one about the default route, fixes that part of the page in her own words, and writes the date.",
    },
    {
      state: "used",
      edge: 4,
      tone: "good",
      outcome: "ready",
      title: "Used to teach",
      note: "A week before the exam, Odai asks why his lab answer was wrong. Lina explains the most specific match from her page, without reading it out. The page has done both of its jobs.",
    },
  ],
  tryThis: [
    "Before step 2, predict which page will help Lina more in six weeks: the pasted AI summary or her own short page.",
    "At step 5, what does the Friday review add that the first four states do not?",
  ],
  limits:
    "Real pages move back and forth: a review often sends a page back to be rewritten, and some topics need more than one page. The Friday review is Lina's choice of day, not a rule. Any notes app, plain text files or paper can hold this page.",
};
