import type { SequenceSpec } from "../renderers/sequence/types";

// Software Engineering Concepts course (software-engineering-concepts),
// chapter 1.4 "One task, five shapes". One task takes five shapes on its way
// through Errand (a fictional app); the chips list the real fields each shape
// keeps, and mark the ones that are renamed, retyped or added. A side road
// shows the DTO refusing a body with an extra field, and the last step shows
// a stored row sent to the browser as it is, in a different design from Errand. See spec.md.
export const seM1TaskShapes: SequenceSpec = {
  kind: "sequence",
  title: "One task, five shapes",
  purpose: "Follow one task through the request body, the DTO, the domain model, the database row and the view model, and see which fields each one keeps.",
  summary:
    "The browser sends a request body with title and due, both as text. The DTO keeps title and due and trims the title. A side road shows a body with an extra field, isAdmin, refused with a 400 that names the field. The service builds the domain model, with a Date called dueAt and the owner added. The repository maps it to a database row with due_at, owner_id, status and created_at, then reads the row back into the domain model. The controller builds the view model with id, title, done, due and dueIn, and leaves out the owner and the creation time. A last step supposes a different design in which stored rows are sent to the browser as they are, which would leak owner_id, status and created_at.",
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
      note: "This is what the sender posted, as text. The title has stray spaces, and the due date is the text 2026-11-02. Nothing in it is trusted yet.",
      chips: ["title: text", "due: text"],
    },
    {
      from: 1,
      to: 1,
      label: "DTO",
      title: "Shape 2: the DTO",
      note: "The DTO is what a sender may send. It is an allow-list: only title and due get in, and the title is trimmed.",
      chips: ["title (trimmed)", "due: text"],
      outcome: "title and due only",
    },
    {
      from: 1,
      to: 0,
      label: "400 + isAdmin",
      title: "Side road: isAdmin is refused",
      note: "Same door, a different body. This one also holds isAdmin. The DTO does not let it on: Errand answers 400 and names the field, unknown field: isAdmin. No task is made. The next steps go back to the clean body.",
      chips: ["isAdmin: true", "400"],
      outcome: "400 names isAdmin",
    },
    {
      from: 1,
      to: 2,
      label: "domain model",
      title: "Shape 3: the domain model",
      note: "The service builds the domain model, which the rules use. The text becomes a real Date called dueAt, the owner is added, and the rule says the due date may not be in the past.",
      chips: ["id", "ownerId (added)", "title", "dueAt: Date (was due)", "done", "createdAt"],
    },
    {
      from: 2,
      to: 3,
      label: "database row",
      title: "Shape 4: the database row",
      note: "The repository maps the task to a row for storage, with column names. The Date is stored as a timestamp, and the status column stores the word open or done.",
      chips: ["id", "owner_id", "title", "due_at", "status (was done)", "created_at"],
    },
    {
      from: 3,
      to: 2,
      label: "row to model",
      title: "The row is read back",
      note: "The repository reads the saved row and builds the domain model again. The column names turn back into the model's names, and the row goes no further.",
      chips: ["due_at to dueAt", "status to done"],
    },
    {
      from: 2,
      to: 1,
      label: "the task",
      title: "The service answers the controller",
      note: "The service hands the domain model to the controller. It holds the owner and the creation time, so it is not fit for the browser yet.",
      chips: ["ownerId", "createdAt"],
    },
    {
      from: 1,
      to: 0,
      label: "view model",
      tone: "good",
      outcome: "no ownerId",
      title: "Shape 5: the view model",
      note: "The controller builds the view model for the screen. The date becomes words, dueIn is added, and the owner and the creation time are left out.",
      chips: ["id", "title", "done", "due: text", "dueIn: 3 days (added)"],
    },
    {
      from: 3,
      to: 0,
      label: "row, unchanged",
      tone: "warn",
      outcome: "owner_id would leak",
      title: "Reuse the row and a field leaks",
      note: "Suppose a different design, where the repository hands up rows and nothing builds the domain model. A list that sent those rows to the browser as they are would send every column, including owner_id, status and created_at. Nobody wrote code to send them.",
      chips: ["owner_id", "status", "created_at"],
    },
  ],
  tryThis: [
    "Before step 9, predict: the row goes to the browser as it is. Which fields does the browser get?",
    "At each step, say which fields the shape keeps, which it drops and which it renames.",
  ],
  limits:
    "Errand is a small fictional app, and these five shapes are the ones this course uses. Other projects use fewer shapes or other names for them. Merging two shapes is a choice with a cost, which chapter 1.4 explains.",
};
