import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 6.5: do you need the outbox? Rules read from the
// outbox pattern pages, Debezium, Kafka's design page and Confluent's dual
// write article (dossier B57 to B62). The picture shows four options; event
// sourcing is a fifth, named in the chapter.
export const OUTBOX_OR_NOT: ContextPickerConfig = {
  question: "Do you need an outbox?",
  factors: [
    {
      id: "loss",
      label: "A lost event",
      choices: [
        { id: "must", label: "Must arrive" },
        { id: "rebuild", label: "Can rebuild" },
      ],
    },
    {
      id: "tx",
      label: "Transactions",
      choices: [
        { id: "yes", label: "Available" },
        { id: "no", label: "Not available" },
      ],
    },
    {
      id: "others",
      label: "Others need",
      choices: [
        { id: "event", label: "One event" },
        { id: "rows", label: "Every change" },
      ],
    },
  ],
  options: [
    { id: "outbox", label: "Outbox", sub: "same transaction" },
    { id: "direct", label: "Direct publish", sub: "no extra table" },
    { id: "cdc", label: "CDC", sub: "read the log" },
    { id: "listen", label: "Listen to yourself", sub: "Kafka first" },
  ],
  rules: [
    { when: { loss: "rebuild" }, pick: "direct", why: "An event you can rebuild can be lost. Publish it directly: no extra table." },
    { when: { tx: "no" }, pick: "listen", why: "No transactions, no outbox. Write to Kafka first; your data lags a moment." },
    { when: { others: "rows" }, pick: "cdc", why: "Others need every row change: read the database log. It can also run the relay." },
    { when: { loss: "must", tx: "yes", others: "event" }, pick: "outbox", why: "The change and the event must both happen or neither: one transaction." },
  ],
  fallback: { pick: "outbox", why: "The change and the event must both happen or neither: one transaction." },
  start: { loss: "must", tx: "yes", others: "event" },
  hint: "Change one fact at a time and read the reason.",
};

export const outboxOrNot: CustomCanvasSpec = {
  kind: "custom",
  title: "Outbox or not",
  purpose: "Set how bad a lost event is, whether your database has transactions and what other services need, and see whether the outbox pays or another way fits.",
  limits:
    "The rules are the course's reading of five sources, not a law. Real systems have more facts, and event sourcing is a fifth way left out of the picture. The outbox also has costs the picture does not show: an extra table, a relay to run, repeats to handle and a small delay.",
  component: makeContextPickerCanvas(OUTBOX_OR_NOT),
};
