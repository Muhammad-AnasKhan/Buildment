import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 5.2: Yara asks a chat assistant how to join an open
// source program (a fictional fellow; the program rules are real, checked
// 2026-10-25). Three things she may or may not do before she decides: read
// the primary page, give her own facts, ask a second assistant. The rules
// are the course's own and follow the chapter's claim: only the page fixes an
// out of date fact (B69, B70), her facts make the answer fit her (B11), and a
// second assistant alone can repeat the same old rule (B15).
export const FIRST_OR_RESEARCHED_ANSWER: ContextPickerConfig = {
  question: "Which answer does Yara end up with?",
  factors: [
    {
      id: "page",
      label: "Primary page",
      choices: [
        { id: "unread", label: "Not read" },
        { id: "read", label: "Read" },
      ],
    },
    {
      id: "facts",
      label: "Her own facts",
      choices: [
        { id: "none", label: "Not given" },
        { id: "given", label: "Given" },
      ],
    },
    {
      id: "second",
      label: "Second assistant",
      choices: [
        { id: "one", label: "Not asked" },
        { id: "two", label: "Asked" },
      ],
    },
  ],
  options: [
    { id: "old", label: "Old answer", sub: "may be out of date" },
    { id: "current", label: "Current only", sub: "not shaped to her" },
    { id: "fits", label: "Fits her only", sub: "not checked" },
    { id: "researched", label: "Researched", sub: "current, fits her" },
  ],
  rules: [
    {
      when: { page: "read", facts: "given", second: "two" },
      pick: "researched",
      why: "The page fixes the facts, her facts fix the fit, and two answers show gaps.",
    },
    {
      when: { page: "read", facts: "given" },
      pick: "researched",
      why: "The page fixes the facts and her facts fix the fit. A second assistant can still help.",
    },
    {
      when: { page: "read" },
      pick: "current",
      why: "The rules are current, but the answer was not written for her hours or laptop.",
    },
    {
      when: { page: "unread", facts: "given" },
      pick: "fits",
      why: "It fits her hours and laptop, but an out of date rule can still sit inside it.",
    },
    {
      when: { page: "unread", facts: "none", second: "two" },
      pick: "old",
      why: "Two assistants can repeat the same old rule. Only the page settles it.",
    },
  ],
  fallback: { pick: "old", why: "One answer, no page, no facts: a first answer to check, not a decision." },
  start: { page: "unread", facts: "none", second: "one" },
  hint: "Tap a pill to change what Yara did before she decided.",
};

export const firstOrResearchedAnswer: CustomCanvasSpec = {
  kind: "custom",
  title: "First answer or researched answer",
  purpose:
    "Change three things Yara did before she decided about an open source program: whether she read the primary page, whether she gave her own facts, and whether she asked a second assistant. See which kind of answer she ends with.",
  limits:
    "A teaching model with three facts, not a measure of how often assistants are wrong. The rules are this course's own, written from Yara's example (Hacktoberfest 2026 and Google Summer of Code, rules checked 2026-10-25). Program rules change every year, so read the current pages. Yara is a fictional fellow.",
  component: makeContextPickerCanvas(FIRST_OR_RESEARCHED_ANSWER),
};
