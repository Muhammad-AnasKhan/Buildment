import type { CustomCanvasSpec } from "../registry";
import type { CommitHistory, CommitStoryConfig } from "../models/commit-story";
import { makeCommitStoryCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 10.6: Yara adds click counts to Qasir (fictional) in
// one week of 7 days. The same work, saved two ways. Both histories add 410
// lines and remove 38, so each totals 448 lines changed. The small steps touch
// seven different files in all, which is why the dump commit says 7 files.
// Commit advice: Pro Git on logically separate changes and messages (C74).

const DUMP: CommitHistory = {
  id: "dump",
  label: "One dump",
  commits: [
    {
      id: "d1",
      message: "update",
      day: 7,
      files: 7,
      added: 410,
      removed: 38,
      note: "Seven files and 448 lines under one word. A reviewer cannot tell what came first, what broke or why.",
    },
  ],
  verdict: "A reviewer cannot follow it",
  tone: "bad",
};

const STEPS: CommitHistory = {
  id: "steps",
  label: "Small steps",
  commits: [
    {
      id: "s1",
      message: "Add clicks table and migration",
      day: 1,
      files: 2,
      added: 42,
      removed: 0,
      note: "The data comes first. A reviewer sees where click counts will be stored.",
    },
    {
      id: "s2",
      message: "Count a click when a short link is opened",
      day: 2,
      files: 2,
      added: 61,
      removed: 4,
      note: "One feature, one commit. The message says what the code now does.",
    },
    {
      id: "s3",
      message: "Add test: two visits give a count of 2",
      day: 3,
      files: 1,
      added: 38,
      removed: 0,
      note: "A test written the day the count first worked. It shows how she checked her own work.",
    },
    {
      id: "s4",
      message: "Fix: do not count clicks on links that do not exist",
      day: 4,
      files: 2,
      added: 9,
      removed: 14,
      note: "She found the bug by opening a dead link. The message tells a reviewer what was wrong and what changed.",
    },
    {
      id: "s5",
      message: "Show click counts on the link list page",
      day: 5,
      files: 3,
      added: 176,
      removed: 12,
      note: "The visible feature. It is the biggest step, and the earlier steps are already checked.",
    },
    {
      id: "s6",
      message: "README: how click counts work and one known gap",
      day: 7,
      files: 1,
      added: 84,
      removed: 8,
      note: "She writes down what the count does not do yet. A reviewer learns where to look next.",
    },
  ],
  verdict: "A reviewer can follow every step",
  tone: "good",
};

export const DUMP_OR_STORY: CommitStoryConfig = {
  histories: [DUMP, STEPS],
  hint: "Switch between the two histories, then tap a dot to read what a reviewer would see.",
};

export const dumpOrStory: CustomCanvasSpec = {
  kind: "custom",
  title: "One dump or a story: Yara's Qasir week",
  purpose: "Compare one week of Qasir saved as a single commit with the same work saved in six small commits, and read what a reviewer learns from each.",
  limits:
    "A real history is less tidy, and commit size is only a rough signal: a reviewer reads the changes themselves. On a project that squashes pull requests, the main branch keeps one commit and the pull request carries this story. Yara, Qasir and the numbers are a fictional example.",
  component: makeCommitStoryCanvas(DUMP_OR_STORY),
};
