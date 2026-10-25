import type { CustomCanvasSpec } from "../registry";
import type { ContextPickerConfig } from "../models/context-picker";
import { makeContextPickerCanvas } from "../primitives/canvas-factories";

// Course 13 v2, chapter 6.3: the fastest database depends on the job, the
// writers, the setup and the size of the data. Every rule is the course's
// reading of project docs (dossier B44 to B56); see spec.md for the
// rule-by-rule sources. The "small table" rules are the course's reading: the
// sources describe where column stores help (many rows), not a row count, so
// the reasons say "measure".
export const FASTEST_DATABASE_DEPENDS: ContextPickerConfig = {
  question: "Which database is fast for this job?",
  factors: [
    {
      id: "job",
      label: "The job",
      choices: [
        { id: "orders", label: "Shop orders" },
        { id: "totals", label: "Totals" },
        { id: "stream", label: "Event stream" },
      ],
    },
    {
      id: "writers",
      label: "Who writes",
      choices: [
        { id: "one", label: "One program" },
        { id: "many", label: "Many at once" },
      ],
    },
    {
      id: "setup",
      label: "Setup",
      choices: [
        { id: "app", label: "Inside the app" },
        { id: "server", label: "Own server" },
      ],
    },
    {
      id: "size",
      label: "Data size",
      choices: [
        { id: "small", label: "Small" },
        { id: "large", label: "Very large" },
      ],
    },
  ],
  options: [
    { id: "sqlite", label: "SQLite", sub: "one file" },
    { id: "postgres", label: "PostgreSQL", sub: "row store" },
    { id: "duckdb", label: "DuckDB", sub: "columns, in-app" },
    { id: "clickhouse", label: "ClickHouse", sub: "column store" },
    { id: "lsm", label: "LSM store", sub: "write-optimised" },
  ],
  rules: [
    { when: { job: "orders", writers: "one", setup: "app" }, pick: "sqlite", why: "One writer at a time is fine, and there is no server to run." },
    { when: { job: "orders" }, pick: "postgres", why: "Many small saves with transactions, or many writers: a row store on a server." },
    { when: { job: "totals", size: "small", setup: "app" }, pick: "sqlite", why: "A small table may total fine in SQLite. Measure before you add an engine." },
    { when: { job: "totals", size: "small" }, pick: "postgres", why: "A small table may total fine in PostgreSQL. Measure before you add an engine." },
    { when: { job: "totals", setup: "app" }, pick: "duckdb", why: "Totals over very many rows with no server: it runs inside your program." },
    { when: { job: "totals" }, pick: "clickhouse", why: "Totals over very many rows on a server: a column store, speed grows with cores." },
    { when: { job: "stream" }, pick: "lsm", why: "A heavy write stream: writes are cheap, but reads cost more." },
  ],
  fallback: { pick: "postgres", why: "Nothing special matches: try PostgreSQL and measure on your own data." },
  start: { job: "orders", writers: "one", setup: "app", size: "small" },
  hint: "Change one fact at a time and watch the ring move.",
};

export const fastestDatabaseDepends: CustomCanvasSpec = {
  kind: "custom",
  title: "The fast database depends on the job",
  purpose: "Set the job, who writes, the setup and the size of the data, and see which kind of database fits, with the reason.",
  limits:
    "The rules are the course's reading of project docs, not a ranking and not a benchmark. The sources do not give a row count where a column store starts to pay, so the small-table answers say to measure. Real choices have more than four facts, and more than one database can fit a job. Check each project's own page, and measure on your own data before you decide.",
  component: makeContextPickerCanvas(FASTEST_DATABASE_DEPENDS),
};
