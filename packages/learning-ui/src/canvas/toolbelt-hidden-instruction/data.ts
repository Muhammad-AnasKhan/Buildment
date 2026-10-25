import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Course 13 v2, chapter 9.5: an AI tool reads an issue that a stranger wrote,
// and the issue hides an instruction. First the tool holds a wide token and
// the private notes leak. Then it holds a narrow token for one repository and
// the same instruction has nowhere to go. A made-up case modelled on the
// documented risk (dossier C45: Invariant Labs, 26 May 2025; C43 and C44 for
// MCP and read-only mode). The read-only point is the chapter's claim; the
// scene says the tool is still tricked in the second pass.
export const toolbeltHiddenInstruction: SceneSpec = {
  kind: "scene",
  title: "A hidden order in an issue",
  purpose: "An AI tool reads a stranger's issue that hides an instruction. With a wide token the private notes leak. With a narrow token the same instruction has nowhere to go.",
  hint: "Watch: it plays on its own. Press Replay to see it again.",
  limits:
    "A made-up case in the shape of a documented risk. Real attacks vary, and a narrow token limits the damage but does not stop the tool from reading the hidden order. Keep human review and never put secrets where a tool can read them.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "stranger", label: "Stranger", kind: "user", sub: "unknown person", x: 90, y: 95 },
      { id: "issue", label: "Issue", kind: "note", sub: "no issue yet", x: 330, y: 95 },
      { id: "repo", label: "Private repo", kind: "database", sub: "private notes", x: 90, y: 245 },
      { id: "tool", label: "AI tool", kind: "worker", sub: "wide token", x: 330, y: 245 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "stranger", to: "issue", label: "writes issue" },
      { kind: "say", at: 1.2, actor: "issue", text: "hidden order", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.9, from: "tool", to: "issue", label: "reads issue" },
      { kind: "fly", at: 2.6, dur: 0.9, from: "issue", to: "tool", label: "hidden order", tone: "bad" },
      { kind: "say", at: 3.5, actor: "tool", text: "obeys it", tone: "bad" },
      { kind: "fly", at: 3.7, dur: 1.0, from: "tool", to: "repo", label: "asks for notes", tone: "bad" },
      { kind: "say", at: 4.7, actor: "repo", text: "notes leaked", tone: "bad" },
      { kind: "verdict", at: 4.9, text: "Wide access: notes leak", tone: "bad" },

      { kind: "say", at: 7.5, actor: "repo", text: "private notes" },
      { kind: "say", at: 7.5, actor: "tool", text: "narrow token", tone: "good" },
      { kind: "verdict", at: 7.5, text: "Same issue, narrow token", tone: "accent" },
      { kind: "fly", at: 7.8, dur: 0.9, from: "tool", to: "issue", label: "reads issue" },
      { kind: "fly", at: 8.8, dur: 0.9, from: "issue", to: "tool", label: "hidden order", tone: "bad" },
      { kind: "say", at: 9.7, actor: "tool", text: "tricked, stuck", tone: "warn" },
      { kind: "fly", at: 9.9, dur: 1.0, from: "tool", to: "repo", label: "asks for notes", tone: "bad" },
      { kind: "say", at: 10.9, actor: "repo", text: "no access", tone: "good" },
      { kind: "verdict", at: 11.1, text: "Least access: nothing leaks", tone: "good" },
    ],
    loop: 14.5,
  },
};
