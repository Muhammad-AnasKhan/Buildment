import type { SequenceSpec } from "../renderers/sequence/types";

// Software Engineering Concepts course (software-engineering-concepts),
// chapter 1.4 "One task, five shapes". One task takes five shapes on its way
// through Errand (a fictional app); the chips list the fields each shape
// keeps. The last step is the leak from chapter 1.1. See spec.md.
export const seM1TaskShapes: SequenceSpec = {
  kind: "sequence",
  title: "One task, five shapes",
  purpose: "Follow one task through the request body, the DTO, the domain model, the database row and the view model, and see which fields each one keeps.",
  summary:
    "The browser sends a request body with title, due and isAdmin. The DTO keeps only title and due, and rejects the unknown field. The service builds a domain model with dueAt as a Date. The repository stores a database row with due_at, owner_id and created_at. The controller builds a view model with title and dueIn, and no owner_id. A last step shows the row returned straight to the browser, which leaks owner_id.",
  actors: [
    { name: "Browser", sub: "the client" },
    { name: "Controller", sub: "HTTP only" },
    { name: "Service", sub: "the rules" },
    { name: "Repository", sub: "SQL only" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "request body",
      title: "Shape 1: the request body",
      note: "This is what the client sent, as text. The due date is the text 2026-11-02, and the client added a field of its own: isAdmin.",
      chips: ["title: Pay rent", "due: 2026-11-02", "isAdmin: true"],
    },
    {
      from: 1,
      to: 1,
      label: "DTO",
      title: "Shape 2: the DTO",
      note: "The DTO is what a client may send. It is an allow-list: only title and due get in. Unknown fields such as isAdmin are rejected, so only title and due go on.",
      chips: ["title", "due"],
      outcome: "isAdmin rejected",
    },
    {
      from: 1,
      to: 2,
      label: "domain model",
      title: "Shape 3: the domain model",
      note: "The service turns the DTO into the domain model, which holds the rules. Here due becomes dueAt, a real Date, and the rule says the due date may not be in the past.",
      chips: ["title", "dueAt: Date"],
    },
    {
      from: 2,
      to: 3,
      label: "database row",
      title: "Shape 4: the database row",
      note: "The repository maps the task to a row for storage. The date becomes a timestamp with a time zone, and the row gets columns the client never sees.",
      chips: ["title", "due_at timestamptz", "owner_id", "created_at"],
    },
    {
      from: 3,
      to: 1,
      label: "row back",
      title: "The row goes back up",
      note: "The saved row travels back to the controller. It is made for storage, not for the screen, so it must not go out as it is.",
      chips: ["due_at", "owner_id", "created_at"],
    },
    {
      from: 1,
      to: 0,
      label: "view model",
      tone: "good",
      outcome: "no owner_id",
      title: "Shape 5: the view model",
      note: "The view model is made for the screen. The date becomes words, and the owner is left out, so the browser only gets what the screen needs.",
      chips: ["title", "dueIn: 3 days"],
    },
    {
      from: 3,
      to: 0,
      label: "row, unchanged",
      tone: "warn",
      outcome: "owner_id leaked",
      title: "Reuse the row and a field leaks",
      note: "If the row goes straight to the response, every column goes with it, including owner_id. For a user row it also sends password_hash. Nobody wrote code to send it.",
      chips: ["owner_id", "password_hash"],
    },
  ],
  tryThis: [
    "Before step 7, predict: the row goes to the browser as it is. What does the browser get?",
    "At each step, say which fields the shape keeps and which it drops.",
  ],
  limits:
    "Errand is a small fictional app, and these five shapes are the ones this course uses. Other projects use fewer shapes or other names for them. Merging two shapes is a choice with a cost, as the last step shows.",
};
