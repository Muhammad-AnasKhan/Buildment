import type { StateMachineSpec } from "../renderers/state-machine/types";

// Learn and Build with AI course, chapter 6.3 "Say when AI helped".
// Hani's new post about the stock app he built for the print and copy shop where he works: list what AI did,
// write the three-part AI-use line, check the rules where he posts, publish,
// and correct openly when a reader finds a mistake. "All my own work" is
// refused because it is not true. See spec.md.
export const discloseAiHelp: StateMachineSpec = {
  kind: "state-machine",
  title: "Before you publish: say when AI helped",
  purpose: "Follow Hani's new post from a finished draft to a published post with an honest AI-use line, and see the claim the path refuses.",
  summary:
    "Hani's draft is ready. He lists every task AI did: Gemini wrote the first version of the low-stock check, which he rewrote, explained one error and suggested the title. The line 'all my own work' is refused because it is not true. He writes a three-part AI-use line: the tool, what it did, and what he checked. He checks the rules where he posts and the shop owner's condition on the screenshot, then publishes. When a reader finds a mistake, he corrects it openly, as he did on his first post.",
  states: [
    { id: "draft", name: "Draft ready", sub: "written by Hani", col: 0, row: 0 },
    { id: "listed", name: "AI help listed", sub: "every task it did", col: 1, row: 0 },
    { id: "line", name: "AI line written", sub: "tool, task, check", col: 2, row: 0 },
    { id: "rules", name: "Rules checked", sub: "where he posts", col: 2, row: 1 },
    { id: "published", name: "Published", sub: "honest and checked", col: 1, row: 1 },
    { id: "corrected", name: "Corrected", sub: "if a reader asks", col: 0, row: 1 },
  ],
  edges: [
    { from: "draft", to: "listed", label: "list AI help" },
    { from: "listed", to: "line", label: "write line" },
    { from: "line", to: "line", label: "all my own", kind: "rejected" },
    { from: "line", to: "rules", label: "ok" },
    { from: "rules", to: "published", label: "publish" },
    { from: "published", to: "corrected", label: "error found" },
  ],
  steps: [
    {
      state: "draft",
      edge: 0,
      title: "The new draft is ready",
      note: "Hani wrote this post himself, about the stock app as it really is: a row turns red when paper runs low, and there are no text messages. Before he publishes, he lists every task AI did, for the post and for the app it describes.",
      chips: ["written by Hani", "no text messages"],
    },
    {
      state: "listed",
      edge: 1,
      title: "List what AI did, first",
      note: "Months ago, Gemini wrote the first version of the low-stock check, which Hani later rewrote and tested. This week it explained one error message and suggested the title. Nothing else. A list first stops him remembering only the last thing AI did.",
      chips: ["first low-stock check", "one error explained", "the title"],
    },
    {
      state: "line",
      edge: 2,
      tone: "bad",
      outcome: "refused",
      title: "'All my own work' is refused",
      note: "Hani wrote every word of this post, so 'all my own work' is tempting. It is still false: AI wrote the first version of part of the app and suggested the title. A post can be mostly yours and still say honestly what AI did.",
    },
    {
      state: "line",
      edge: 3,
      title: "Write the three-part line",
      note: "'AI use: Gemini wrote the first version of the low-stock check, which I rewrote and tested. It also explained one error and suggested the title. I wrote this post and checked every feature it mentions against the running app.'",
      chips: ["which tool", "what it did", "what he checked"],
    },
    {
      state: "rules",
      edge: 4,
      title: "Check the rules where he posts",
      note: "At the time of writing, LinkedIn makes him responsible for what he posts, and DEV lets him mark the post as AI-assisted, so he does. The owner agreed the shop can be named but not its numbers, so the screenshot shows made-up stock.",
      chips: ["LinkedIn: he is responsible", "DEV: AI-assisted", "made-up stock"],
    },
    {
      state: "published",
      edge: 5,
      tone: "good",
      outcome: "honest",
      title: "Published, with the line",
      note: "The post goes out with the AI-use line at the end. A reader can see which parts are Hani's, what AI did, and what he checked. If a reader finds a mistake, the habit continues.",
    },
    {
      state: "corrected",
      tone: "good",
      outcome: "corrected openly",
      title: "Correct mistakes in the open",
      note: "This is what Hani did with his first post. He added one line at the top: 'Correction: the app does not send text messages. An earlier version of this post said it did.' He kept the rest, so the comments still make sense.",
    },
  ],
  tryThis: [
    "Go to step 3 and read why the path refuses 'all my own work': it is about the app and the title, not about who typed the words.",
    "At step 4, cover the line and say its three parts from memory. Which part would a reader miss most if it were gone?",
  ],
  limits:
    "This follows one post on two platforms. Platform rules were checked on 2026-10-24 and change often, so read each place's help page before you post. Rules at a university, a client or an employer can ask for more than a platform does; ask them before you start.",
};
