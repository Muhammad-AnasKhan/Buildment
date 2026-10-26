import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 9.5: give a CLI or connector the least access the
// task needs. Dossier: C39 to C42 (GitHub CLI, fine-grained tokens), C43 to
// C45 (MCP, read-only mode, hidden instructions in issues), C46 to C50 (cloud
// cost views, budgets, billing read-only also shows invoices), C52 (practise
// on a sample report).

export const LEAST_ACCESS_PICKER: ContextPickerConfig = {
  question: "How much access does the job need?",
  factors: [
    {
      id: "task",
      label: "The task",
      choices: [
        { id: "read", label: "Read" },
        { id: "change", label: "Change" },
        { id: "pay", label: "Pay or delete" },
      ],
    },
    {
      id: "place",
      label: "Where",
      choices: [
        { id: "repo", label: "GitHub repo" },
        { id: "bill", label: "Cloud bill" },
        { id: "none", label: "No account" },
      ],
    },
    {
      id: "runner",
      label: "Who runs it",
      choices: [
        { id: "you", label: "You type" },
        { id: "ai", label: "An AI tool" },
      ],
    },
  ],
  options: [
    { id: "read-only", label: "Read-only", sub: "one repo, expiry" },
    { id: "write-one", label: "Write, 1 repo", sub: "expiry, you review" },
    { id: "cost-view", label: "Cost view only", sub: "custom policy" },
    { id: "sample", label: "Sample report", sub: "no account" },
    { id: "by-hand", label: "You, by hand", sub: "no tool acts" },
  ],
  rules: [
    {
      when: { task: "pay" },
      pick: "by-hand",
      why: "Money and deletions stay with a person. A tool may prepare a list; you press the button.",
    },
    {
      when: { place: "none" },
      pick: "sample",
      why: "No account: practise on a supplied sample cost report. Nothing to leak or to spend.",
    },
    {
      when: { place: "bill", task: "read" },
      pick: "cost-view",
      why: "Costs only. A billing read-only policy also shows invoices and payment details.",
    },
    {
      when: { place: "bill", task: "change" },
      pick: "by-hand",
      why: "Cloud changes stay with a person. A budget alert tells you but does not stop spending.",
    },
    {
      when: { place: "repo", task: "read" },
      pick: "read-only",
      why: "Read permission on one repository, with an expiry date. Use read-only mode if offered.",
    },
    {
      when: { place: "repo", task: "change", runner: "you" },
      pick: "write-one",
      why: "Write on this one repository only, with an expiry. You read the change before it merges.",
    },
    {
      when: { place: "repo", task: "change", runner: "ai" },
      pick: "read-only",
      why: "An AI tool that reads strangers' text gets read-only. It drafts; you type the change.",
    },
  ],
  fallback: {
    pick: "by-hand",
    why: "When no rule fits, do the task yourself and ask a mentor before you give any tool access.",
  },
  start: { task: "read", place: "repo", runner: "ai" },
  hint: "Tap a fact to change it. Watch how much access the job needs.",
};

export const leastAccessPicker: CustomCanvasSpec = {
  kind: "custom",
  title: "How much access does the job need?",
  purpose: "Change the task, where it happens and who runs it, and see the smallest access that does the job.",
  limits:
    "These picks are this course's advice for small projects, not a security standard. Real teams add reviews, logs and more settings. Menus and plan names change, so read each tool's own page. The cost view uses a policy your instructor has tested; do not copy one from a chat.",
  component: makeContextPickerCanvas(LEAST_ACCESS_PICKER),
};
