import type { SequenceSpec } from "../renderers/sequence/types";

// Software Engineering Concepts course (software-engineering-concepts),
// chapter 1.3 "Why code is split into layers". One POST /tasks request goes
// down through the layers and back, and each step says what that layer may
// know and may not know. Errand is a fictional app. See spec.md.
export const seM1RequestLayers: SequenceSpec = {
  kind: "sequence",
  title: "One request through the layers",
  purpose: "Follow POST /tasks down through the layers and back, and see what each layer may know and may not know.",
  summary:
    "The browser sends POST /tasks with a JSON body. The route hands it to the controller, which reads HTTP. The controller calls the service, which holds the rules. The service calls the repository, which holds the SQL and talks to Postgres. The row goes back up, the view builds the response, and the browser gets the task. A last step shows Errand's first version, where one 300-line route handler does all of this.",
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
      label: "POST /tasks",
      title: "The route picks the controller",
      note: "The browser sends POST /tasks with a JSON body. The route matches the URL and the method, then hands the request to the controller. The route knows URLs. It does not know SQL.",
      chips: ["POST /tasks", "JSON body"],
    },
    {
      from: 1,
      to: 1,
      label: "read the body",
      title: "The controller reads HTTP",
      note: "It reads the body and the headers, and it chooses the status code. It knows HTTP. It does not know SQL, and it does not decide the rules.",
      chips: ["body", "headers"],
    },
    {
      from: 1,
      to: 2,
      label: "createTask()",
      title: "The service holds the rules",
      note: "The controller calls the service with plain values, not with the request. The service knows the rules, such as a due date not in the past. It does not know HTTP or SQL.",
      chips: ["title", "due"],
    },
    {
      from: 2,
      to: 3,
      label: "save(task)",
      title: "The repository owns the SQL",
      note: "The service asks for a save. It does not say how. The repository knows SQL and the table names. It does not know HTTP.",
      chips: ["save(task)"],
    },
    {
      from: 3,
      to: 3,
      label: "INSERT INTO",
      title: "Postgres stores the row",
      note: "The repository runs the SQL and Postgres keeps the row. If the table is renamed, only this layer changes.",
      chips: ["INSERT INTO tasks"],
    },
    {
      from: 3,
      to: 2,
      label: "the saved row",
      title: "The row goes back up",
      note: "The repository hands back the saved row. Each layer passes up only what the next layer needs.",
      chips: ["row"],
    },
    {
      from: 2,
      to: 1,
      label: "the task",
      title: "The service answers the controller",
      note: "The service returns the task to the controller. It still knows nothing about HTTP.",
      chips: ["task"],
    },
    {
      from: 1,
      to: 0,
      label: "task as JSON",
      tone: "good",
      outcome: "view model only",
      title: "The view builds the response",
      note: "The view turns the task into JSON for the screen, with only the fields the screen needs. The controller sets the status code and sends it.",
      chips: ["view model", "JSON"],
    },
    {
      from: 1,
      to: 1,
      label: "one big handler",
      tone: "warn",
      outcome: "rename breaks HTML",
      title: "Errand's first version had no layers",
      note: "One 300-line route handler read the body, ran the rules, wrote the SQL and built the HTML. Rename the table and the lines that build the HTML break too.",
      chips: ["300 lines", "SQL + HTML"],
    },
  ],
  tryThis: [
    "Before step 4, predict: which layer should know the name of the table?",
    "At each step, say what this layer may know and what it may not know.",
  ],
  limits:
    "Errand is a small fictional app. Real projects group and name layers in different ways, and a 30-line app may not need all of them. Layers that only pass data along add files and no value.",
};
