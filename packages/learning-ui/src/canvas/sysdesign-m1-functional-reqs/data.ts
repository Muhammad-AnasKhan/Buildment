import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// Beat 1 of 1.2: a student does three things in Daftar (a fictional notes
// app). Each action that works becomes one line on the feature list: the
// functional requirements are the verbs users need.
export const sysdesignM1FunctionalReqs: SceneSpec = {
  kind: "scene",
  title: "Functional requirements: what students can do",
  purpose: "A student uploads, searches and opens a note; each action becomes one line on Daftar's feature list.",
  limits: "Daftar is a fictional app. Three features stand for a longer list; a real list also says who may do each action (for example, only the owner can delete a note).",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "student", label: "Student", kind: "user", sub: "exam next week", x: 70, y: 110 },
      { id: "app", label: "Daftar", kind: "server", sub: "notes app", x: 300, y: 110 },
      { id: "list", label: "Features", kind: "database", sub: "empty", x: 300, y: 225 },
    ],
    events: [
      { kind: "fly", at: 0, dur: 0.8, from: "student", to: "app", label: "upload notes" },
      { kind: "say", at: 0.8, actor: "app", text: "note saved", tone: "good" },
      { kind: "fly", at: 0.9, dur: 0.6, from: "app", to: "list", label: "upload" },
      { kind: "say", at: 1.5, actor: "list", text: "1: upload", tone: "accent" },

      { kind: "fly", at: 2.0, dur: 0.8, from: "student", to: "app", label: "search CS101" },
      { kind: "say", at: 2.8, actor: "app", text: "3 notes found", tone: "good" },
      { kind: "fly", at: 2.9, dur: 0.6, from: "app", to: "list", label: "search" },
      { kind: "say", at: 3.5, actor: "list", text: "2: search", tone: "accent" },

      { kind: "fly", at: 4.0, dur: 0.8, from: "student", to: "app", label: "open a note" },
      { kind: "say", at: 4.8, actor: "app", text: "PDF shown", tone: "good" },
      { kind: "fly", at: 4.9, dur: 0.6, from: "app", to: "list", label: "read" },
      { kind: "say", at: 5.5, actor: "list", text: "3: read", tone: "accent" },
      { kind: "verdict", at: 5.8, text: "Functional: what users can do", tone: "accent" },
    ],
    loop: 8.8,
  },
};
