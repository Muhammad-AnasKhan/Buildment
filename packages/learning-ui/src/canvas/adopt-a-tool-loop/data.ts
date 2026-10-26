import type { StateMachineSpec } from "../renderers/state-machine/types";

// Course 13 v2, chapter 8.2 "Learn, adopt and research fast".
// Yazan (a fictional fellow) adopts Mawid (a made-up scheduling tool) for a
// language school's class reminders: docs first, a tiny lab, explain it back,
// then one small use. The machine refuses "use it from a post" and "use it
// because it ran". See spec.md.
export const adoptAToolLoop: StateMachineSpec = {
  kind: "state-machine",
  title: "Adopt a new tool in days",
  purpose: "Follow one tool from a post to one small use in a project, and see the two moves the loop refuses.",
  summary:
    "Yazan sees a post about Mawid, a made-up scheduling tool. Using it straight from the post is refused. He reads the docs first and writes down the version, the date and a limit: a restart forgets jobs. He runs a tiny lab of about 30 minutes and stops the program on purpose, and a job never runs. Using it because the lab ran is refused. He explains the tool back without notes, then uses it in one small feature, with the version and date in the README.",
  states: [
    { id: "new", name: "New tool", sub: "seen in a post", col: 0, row: 0 },
    { id: "docs", name: "Docs read", sub: "version and date", col: 1, row: 0 },
    { id: "lab", name: "Tiny lab", sub: "run and break", col: 2, row: 0 },
    { id: "explained", name: "Explained back", sub: "no notes", col: 2, row: 1 },
    { id: "used", name: "In my project", sub: "one small use", col: 1, row: 1 },
  ],
  edges: [
    { from: "new", to: "docs", label: "read docs" },
    { from: "docs", to: "lab", label: "run" },
    { from: "lab", to: "explained", label: "say" },
    { from: "explained", to: "used", label: "use small" },
    { from: "new", to: "new", label: "from a post", kind: "rejected" },
    { from: "lab", to: "used", label: "it ran", kind: "rejected" },
  ],
  steps: [
    {
      state: "new",
      title: "A post says ten minutes",
      note: "Yazan builds class reminders for a language school (a fictional job). He sees a post about Mawid, a made-up scheduling tool: ten lines, no setup. The reminders are due on Sunday, and he has never used the tool.",
      chips: ["post", "ten lines", "due Sunday"],
    },
    {
      state: "new",
      edge: 4,
      tone: "bad",
      outcome: "refused",
      title: "Use it from the post? No.",
      note: "He could paste the post's ten lines into the school's app tonight. The loop refuses. A post has no version, no date and no list of limits. The tool stays New until he reads its own docs.",
    },
    {
      state: "docs",
      edge: 0,
      tone: "good",
      title: "Docs first: version, date, limits",
      note: "He opens the Mawid docs, not the post. In 30 minutes he writes down the version (3.2), the date of the latest release note, the licence and one limit: jobs live in memory, so a restart forgets them. The post never said that.",
      chips: ["version 3.2", "release note dated", "restart forgets jobs"],
    },
    {
      state: "lab",
      edge: 1,
      tone: "warn",
      outcome: "limit found",
      title: "Tiny lab: run it, change it, break it",
      note: "In a scratch folder he runs the docs' example (15 minutes). He sets a job for 20:00, stops the program on purpose and starts it again (10 minutes). The job never runs. He writes a five-part lab entry (5 minutes). The lab took about 30 minutes.",
      chips: ["15 min run", "10 min break", "5 min write"],
    },
    {
      state: "lab",
      edge: 5,
      tone: "bad",
      outcome: "refused",
      title: "Use it because it ran? No.",
      note: "An assistant gave him a setup that works and matches the docs. But he cannot yet say why the restart lost the job. The loop refuses In my project from here: code he cannot explain does not go in.",
    },
    {
      state: "explained",
      edge: 2,
      tone: "good",
      outcome: "explained",
      title: "Explain it back, without notes",
      note: "He tells a friend what Mawid does, what it needs, what breaks and why he chose it. About 20 minutes. He stalls on where jobs are kept, rereads one docs section and finds the storage option. Now he can say it in his own words.",
      chips: ["what it does", "what breaks", "why this one"],
    },
    {
      state: "used",
      edge: 3,
      tone: "good",
      outcome: "in the project",
      title: "Use it small, and log it",
      note: "He adds Mawid to one feature only: the Sunday reminder, with the storage option on and a test that restarts the program. About 40 minutes. The README names the version and the date he read the docs, and he sets a review for two weeks later.",
      chips: ["one feature", "restart test", "version in README"],
    },
  ],
  tryThis: [
    "Step 5 shows what the loop does after a lab that ran: does it let Yazan use the tool, or send him to explain it first?",
    "At step 3, which fact did the post leave out, and which step found it again by breaking something?",
    "Steps 2 and 5 are both refused. What would each one have cost the school's Sunday reminders?",
  ],
  limits:
    "One made-up tool and one fictional person. Real tools have much longer docs, and some cannot be tried in 30 minutes; then the lab is smaller or the use waits. The times are this example's numbers. The loop is the course's habit, not a law, and it does not say which tool to choose.",
};
