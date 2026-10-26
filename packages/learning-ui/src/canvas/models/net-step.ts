// The step model behind the net-step canvases (the `[netstep]` beat renderer).
// Pure: no React, no clock, no randomness. A slug is plain, serialisable data:
// a few devices on links, optional tables that fill step by step, and a list of
// steps. Each step says what happens (a caption), may put a packet on a link,
// may change table rows, may end on a verdict, and may ask the learner to pick
// what happens before the step plays.
//
// The schema checks the data, so a Markdown `canvas` fence can feed the same
// parameters later and the same topology can be ported to a lab spec.
//
// Rules in one place:
//   - A step plays in order. Next shows the next step; Start over goes back to
//     the first. A step with a `pick` waits: its packet, rows, highlight and
//     verdict stay hidden until the learner picks an option.
//   - Table updates add up. A row index equal to the number of rows adds a row;
//     a smaller index replaces that row. Nothing else may change a table.
//   - The rows marked "new" or "changed" are the ones the latest played step
//     touched, and only while that step is the one on screen.
//   - At most two tables, two picks, six packet fields and ten steps. A caption
//     is at most 20 words.
//   - No em dash anywhere in the data.

import { z } from "zod";

// ---------------------------------------------------------------- limits

export const DEVICE_KINDS = ["host", "router", "switch", "server", "phone", "cloud"] as const;
export type DeviceKind = (typeof DEVICE_KINDS)[number];
export const TONES_ALLOWED = ["good", "warn", "bad", "accent"] as const;

export const MAX_CAPTION_WORDS = 20;
export const MAX_PICKS = 2;
export const MAX_TABLES = 2;
export const MAX_TABLE_ROWS = 6;
export const MAX_PACKET_FIELDS = 6;
export const MAX_STEPS = 10;
export const MAX_DEVICES = 6;
export const MAX_LINKS = 8;
export const MAX_LABEL_CHARS = 10;
export const MAX_ADDRESS_CHARS = 12;
export const MAX_ADDRESSES = 2;
export const MAX_VERDICT_CHARS = 40;
/** A packet chip is `label value` plus the word "changed"; this keeps its widest case inside the picture. */
export const MAX_CHIP_CHARS = 35;

/** Units of picture width per character of 13-unit text: a safe upper bound, so text never runs past its shape. */
export const CHAR_W = 8;
/** The picture is 420 units wide; shapes keep 12 from the edge. */
export const VIEW_W = 420;
export const MARGIN = 12;
export const CARD_W = 116;
export const X_MIN = MARGIN + CARD_W / 2;
export const X_MAX = VIEW_W - MARGIN - CARD_W / 2;
/** Space for the "new" or "changed" tag at the right end of a table row. */
export const TAG_W = 72;
export const TABLE_GAP = 14;
/** The width left for a table's columns: the picture less the margins, the tag and the table padding. */
export const TABLE_COLUMNS_W = VIEW_W - 2 * MARGIN - 2 * 10 - TAG_W;

/** Card height for a device with up to `lines` address lines. */
export const cardHeight = (lines: number): number => (lines <= 0 ? 36 : 30 + 18 * lines);

const EM_DASH = /\u2014/;

// ---------------------------------------------------------------- the schema

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => !EM_DASH.test(s), { message: "no em dash" });

const id = z.string().regex(/^[a-z][a-z0-9-]{0,23}$/, { message: "an id is lower case letters, digits and hyphens" });
const index = z.number().int().min(0);

const deviceSchema = z.object({
  id,
  kind: z.enum(DEVICE_KINDS),
  label: text(MAX_LABEL_CHARS),
  x: z.number().min(X_MIN).max(X_MAX),
  y: z.number().min(0).max(400),
  addresses: z.array(text(MAX_ADDRESS_CHARS)).max(MAX_ADDRESSES).optional(),
});

const linkSchema = z.object({ from: id, to: id, label: text(14).optional() });

const tableSchema = z.object({
  id,
  title: text(30),
  device: id,
  columns: z.array(text(14)).min(1).max(4),
  rows: z.array(z.array(text(24))).max(MAX_TABLE_ROWS),
});

const fieldSchema = z
  .object({ label: text(20), value: text(24), changed: z.boolean().optional() })
  .refine((f) => f.label.length + f.value.length <= MAX_CHIP_CHARS, { message: `label and value total at most ${MAX_CHIP_CHARS} characters` });

const wordCount = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length;

const stepSchema = z.object({
  caption: text(160).refine((s) => wordCount(s) <= MAX_CAPTION_WORDS, { message: `a caption is at most ${MAX_CAPTION_WORDS} words` }),
  highlight: z
    .object({
      links: z.array(index).max(MAX_LINKS).optional(),
      devices: z.array(id).max(MAX_DEVICES).optional(),
      rows: z.array(z.object({ table: id, row: index })).max(MAX_TABLE_ROWS * MAX_TABLES).optional(),
    })
    .optional(),
  packet: z
    .object({
      at: index,
      fields: z.array(fieldSchema).min(1).max(MAX_PACKET_FIELDS),
      /** The packet travels from the link's second device to its first. */
      reverse: z.boolean().optional(),
    })
    .optional(),
  tableUpdates: z.array(z.object({ table: id, row: index, cells: z.array(text(24)).min(1).max(4) })).max(4).optional(),
  verdict: z.object({ text: text(MAX_VERDICT_CHARS), tone: z.enum(TONES_ALLOWED) }).optional(),
  pick: z
    .object({
      prompt: text(120),
      options: z.array(z.object({ label: text(32), correct: z.boolean(), why: text(140) })).min(2).max(4),
    })
    .optional(),
});

const baseSchema = z.object({
  title: text(60),
  purpose: text(240),
  limits: text(600),
  devices: z.array(deviceSchema).min(2).max(MAX_DEVICES),
  links: z.array(linkSchema).min(1).max(MAX_LINKS),
  tables: z.array(tableSchema).max(MAX_TABLES).optional(),
  steps: z.array(stepSchema).min(1).max(MAX_STEPS),
});

type Base = z.infer<typeof baseSchema>;
type Ctx = z.RefinementCtx;

const distinct = (xs: readonly string[]) => new Set(xs).size === xs.length;

/** The width a table's columns need: the longest cell of each column, ever (rows and updates), at `CHAR_W` a character. */
export function tableColumnsWidth(table: z.infer<typeof tableSchema>, updates: readonly (readonly string[])[] = []): number {
  const all = [table.columns, ...table.rows, ...updates];
  let sum = 0;
  for (let c = 0; c < table.columns.length; c += 1) sum += Math.max(...all.map((r) => (r[c] ?? "").length)) * CHAR_W;
  return sum + TABLE_GAP * (table.columns.length - 1);
}

function referenceProblems(spec: Base, ctx: Ctx): void {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
  const deviceIds = spec.devices.map((d) => d.id);
  if (!distinct(deviceIds)) issue(["devices"], "device ids must differ");
  const tables = spec.tables ?? [];
  const tableIds = tables.map((t) => t.id);
  if (!distinct(tableIds)) issue(["tables"], "table ids must differ");

  spec.links.forEach((l, i) => {
    if (!deviceIds.includes(l.from)) issue(["links", i, "from"], `no device ${l.from}`);
    if (!deviceIds.includes(l.to)) issue(["links", i, "to"], `no device ${l.to}`);
    if (l.from === l.to) issue(["links", i], "a link joins two different devices");
  });

  // The cards must not touch, for the tallest card any device needs.
  const lines = Math.max(0, ...spec.devices.map((d) => d.addresses?.length ?? 0));
  const h = cardHeight(lines);
  for (let a = 0; a < spec.devices.length; a += 1) {
    for (let b = a + 1; b < spec.devices.length; b += 1) {
      const da = spec.devices[a];
      const db = spec.devices[b];
      if (Math.abs(da.x - db.x) < CARD_W + 6 && Math.abs(da.y - db.y) < h + 6) issue(["devices", b], `${da.id} and ${db.id} overlap`);
    }
  }

  const tableById = new Map(tables.map((t) => [t.id, t]));
  tables.forEach((t, i) => {
    if (!deviceIds.includes(t.device)) issue(["tables", i, "device"], `no device ${t.device}`);
    t.rows.forEach((r, k) => {
      if (r.length !== t.columns.length) issue(["tables", i, "rows", k], `a row has ${t.columns.length} cells`);
    });
  });

  // Walk the steps with the row counts as they grow.
  const counts = new Map(tables.map((t) => [t.id, t.rows.length]));
  const updateCells = new Map<string, string[][]>(tables.map((t) => [t.id, []]));
  let picks = 0;
  spec.steps.forEach((step, s) => {
    for (const [u, update] of (step.tableUpdates ?? []).entries()) {
      const at = ["steps", s, "tableUpdates", u];
      const table = tableById.get(update.table);
      if (!table) {
        issue([...at, "table"], `no table ${update.table}`);
        continue;
      }
      if (update.cells.length !== table.columns.length) issue([...at, "cells"], `a row has ${table.columns.length} cells`);
      const have = counts.get(table.id) ?? 0;
      if (update.row > have) issue([...at, "row"], `row ${update.row} skips a row (the table has ${have})`);
      else if (update.row === have) counts.set(table.id, have + 1);
      if (update.row >= MAX_TABLE_ROWS) issue([...at, "row"], `at most ${MAX_TABLE_ROWS} rows`);
      updateCells.get(table.id)?.push(update.cells);
    }
    const lit = step.highlight;
    lit?.links?.forEach((li, k) => {
      if (li >= spec.links.length) issue(["steps", s, "highlight", "links", k], `no link ${li}`);
    });
    lit?.devices?.forEach((d, k) => {
      if (!deviceIds.includes(d)) issue(["steps", s, "highlight", "devices", k], `no device ${d}`);
    });
    lit?.rows?.forEach((r, k) => {
      const have = counts.get(r.table);
      if (have === undefined) issue(["steps", s, "highlight", "rows", k], `no table ${r.table}`);
      else if (r.row >= have) issue(["steps", s, "highlight", "rows", k], `row ${r.row} does not exist yet`);
    });
    if (step.packet && step.packet.at >= spec.links.length) issue(["steps", s, "packet", "at"], `no link ${step.packet.at}`);
    if (step.pick) {
      picks += 1;
      const right = step.pick.options.filter((o) => o.correct).length;
      if (right !== 1) issue(["steps", s, "pick", "options"], "exactly one option is correct");
      if (!distinct(step.pick.options.map((o) => o.label))) issue(["steps", s, "pick", "options"], "option labels must differ");
    }
  });
  if (picks > MAX_PICKS) issue(["steps"], `${picks} picks, at most ${MAX_PICKS}`);

  tables.forEach((t, i) => {
    const w = tableColumnsWidth(t, updateCells.get(t.id));
    if (w > TABLE_COLUMNS_W) issue(["tables", i], `the columns need ${w} units, the picture has ${TABLE_COLUMNS_W}`);
  });
}

export const netStepSchema = baseSchema.superRefine(referenceProblems);
export type NetStepSpec = z.infer<typeof netStepSchema>;
/** What a slug's data.ts writes: the schema's input, so a typo is a compile error before the tests run. */
export type NetStepData = z.input<typeof netStepSchema>;
export type NetDevice = NetStepSpec["devices"][number];
export type NetLink = NetStepSpec["links"][number];
export type NetTable = NonNullable<NetStepSpec["tables"]>[number];
export type NetStep = NetStepSpec["steps"][number];
export type NetPick = NonNullable<NetStep["pick"]>;
export type NetPacket = NonNullable<NetStep["packet"]>;
export type NetTone = (typeof TONES_ALLOWED)[number];

export type ParseResult = { ok: true; spec: NetStepSpec } | { ok: false; problems: string[] };

/** Check data from a slug (or, later, a Markdown fence). The problems name the field. */
export function parseNetStep(data: unknown): ParseResult {
  const parsed = netStepSchema.safeParse(data);
  if (parsed.success) return { ok: true, spec: parsed.data };
  return { ok: false, problems: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`) };
}

// ---------------------------------------------------------------- tables over the steps

export type TableRows = string[][];

/** Every table's rows after the first `steps` steps have played (0: the starting rows). */
export function tablesAfter(spec: NetStepSpec, steps: number): Record<string, TableRows> {
  const out: Record<string, TableRows> = {};
  for (const t of spec.tables ?? []) out[t.id] = t.rows.map((r) => [...r]);
  for (const step of spec.steps.slice(0, Math.max(0, steps))) {
    for (const u of step.tableUpdates ?? []) {
      const rows = out[u.table];
      if (!rows || u.row > rows.length) continue;
      rows[u.row] = [...u.cells];
    }
  }
  return out;
}

/** The most rows a table ever holds, for reserving room in the picture. */
export function maxRows(spec: NetStepSpec, tableId: string): number {
  return Math.max(1, ...Array.from({ length: spec.steps.length + 1 }, (_, n) => tablesAfter(spec, n)[tableId]?.length ?? 0));
}

export type ChangedRow = { table: string; row: number; kind: "new" | "changed" };

/** The rows step `stepIndex` adds ("new") or replaces with different cells ("changed"). */
export function changedRowsAt(spec: NetStepSpec, stepIndex: number): ChangedRow[] {
  const step = spec.steps[stepIndex];
  if (!step) return [];
  const before = tablesAfter(spec, stepIndex);
  const out: ChangedRow[] = [];
  for (const u of step.tableUpdates ?? []) {
    const rows = before[u.table];
    if (!rows || u.row > rows.length) continue;
    if (u.row === rows.length) {
      out.push({ table: u.table, row: u.row, kind: "new" });
      rows.push([...u.cells]);
    } else if (rows[u.row].join("\u0000") !== u.cells.join("\u0000")) {
      out.push({ table: u.table, row: u.row, kind: "changed" });
      rows[u.row] = [...u.cells];
    }
  }
  return out;
}

// ---------------------------------------------------------------- state

/** Steps started so far (1 to steps.length) and the option picked at each step (null: not picked). */
export type NetStepState = { shown: number; choices: readonly (number | null)[] };

export const startState = (spec: NetStepSpec): NetStepState => ({ shown: 1, choices: spec.steps.map(() => null) });

/** The step the learner is on (0-based). */
export const currentIndex = (state: NetStepState): number => state.shown - 1;

/** True while the current step asks for a pick the learner has not made. */
export function awaitingPick(spec: NetStepSpec, state: NetStepState): boolean {
  const i = currentIndex(state);
  return spec.steps[i]?.pick !== undefined && state.choices[i] === null;
}

/** Steps that have played: all started steps, less the current one while it waits for a pick. */
export const playedSteps = (spec: NetStepSpec, state: NetStepState): number => state.shown - (awaitingPick(spec, state) ? 1 : 0);

export const canNext = (spec: NetStepSpec, state: NetStepState): boolean => !awaitingPick(spec, state) && state.shown < spec.steps.length;

export const isLast = (spec: NetStepSpec, state: NetStepState): boolean => state.shown >= spec.steps.length;

/** Start the next step. Waits while a pick is open and stops at the last step. */
export const next = (spec: NetStepSpec, state: NetStepState): NetStepState => (canNext(spec, state) ? { ...state, shown: state.shown + 1 } : state);

/** Pick an option of the current step. Ignored when nothing is waiting or the option does not exist. */
export function choose(spec: NetStepSpec, state: NetStepState, option: number): NetStepState {
  if (!awaitingPick(spec, state)) return state;
  const i = currentIndex(state);
  const options = spec.steps[i].pick?.options ?? [];
  if (!Number.isInteger(option) || option < 0 || option >= options.length) return state;
  return { ...state, choices: state.choices.map((c, k) => (k === i ? option : c)) };
}

export const startOver = (spec: NetStepSpec): NetStepState => startState(spec);

/** What the picture shows now: the step in effect (none while a pick is open), the tables and the marked rows. */
export type Stage = {
  /** The step whose packet, highlight and verdict are on screen, or null. */
  active: NetStep | null;
  activeIndex: number;
  played: number;
  tables: Record<string, TableRows>;
  changed: ChangedRow[];
};

export function stageOf(spec: NetStepSpec, state: NetStepState): Stage {
  const played = playedSteps(spec, state);
  const activeIndex = awaitingPick(spec, state) ? -1 : played - 1;
  return {
    active: activeIndex >= 0 ? spec.steps[activeIndex] : null,
    activeIndex,
    played,
    tables: tablesAfter(spec, played),
    changed: activeIndex >= 0 ? changedRowsAt(spec, activeIndex) : [],
  };
}

// ---------------------------------------------------------------- words

export type PickResult = { right: boolean; text: string };

/** The feedback for a pick: right, with why; or not quite, with why that one fails and the better pick. */
export function pickResult(pick: NetPick, choice: number): PickResult {
  const chosen = pick.options[choice];
  const answer = pick.options.find((o) => o.correct);
  if (!chosen || !answer) return { right: false, text: "" };
  if (chosen.correct) return { right: true, text: `Right. ${chosen.why}` };
  return { right: false, text: `Not quite. ${chosen.why} Better: ${answer.label}. ${answer.why}` };
}

const deviceLabel = (spec: NetStepSpec, deviceId: string): string => spec.devices.find((d) => d.id === deviceId)?.label ?? deviceId;

/** The ends of a link in travel order. */
export function linkEnds(spec: NetStepSpec, packet: NetPacket): { from: string; to: string } {
  const link = spec.links[packet.at];
  return packet.reverse ? { from: link.to, to: link.from } : { from: link.from, to: link.to };
}

/** "On the link: Laptop to Switch". */
export function packetTitle(spec: NetStepSpec, packet: NetPacket): string {
  const { from, to } = linkEnds(spec, packet);
  return `On the link: ${deviceLabel(spec, from)} to ${deviceLabel(spec, to)}`;
}

/** The packet fields in words: "dst MAC ff:ff:ff:ff:ff:ff (changed)". */
export const fieldText = (f: NetPacket["fields"][number]): string => `${f.label} ${f.value}${f.changed ? " (changed)" : ""}`;

/** "Step 2 of 5". */
export const stepWord = (spec: NetStepSpec, state: NetStepState): string => `Step ${state.shown} of ${spec.steps.length}`;

/** The sentence for the live region and the picture's description: the step, its picks, packet, rows and verdict. */
export function liveSummary(spec: NetStepSpec, state: NetStepState): string {
  const head = `${stepWord(spec, state)}.`;
  const i = currentIndex(state);
  const step = spec.steps[i];
  if (awaitingPick(spec, state) && step.pick) {
    return `${head} Your turn. ${step.pick.prompt} Options: ${step.pick.options.map((o) => o.label).join("; ")}.`;
  }
  const parts = [head, `${step.caption}`];
  const choice = state.choices[i];
  if (step.pick && choice !== null) parts.push(pickResult(step.pick, choice).text);
  if (step.packet) parts.push(`${packetTitle(spec, step.packet)}: ${step.packet.fields.map(fieldText).join(", ")}.`);
  for (const c of changedRowsAt(spec, i)) {
    const table = spec.tables?.find((t) => t.id === c.table);
    const cells = tablesAfter(spec, i + 1)[c.table]?.[c.row] ?? [];
    parts.push(`${table?.title ?? c.table}: row ${c.row + 1} ${c.kind === "new" ? "added" : "changed"}: ${table?.columns.map((col, k) => `${col} ${cells[k]}`).join(", ")}.`);
  }
  if (step.verdict) parts.push(`Result: ${step.verdict.text}.`);
  return parts.join(" ");
}

/** The words of a table row, for a screen reader. */
export function rowText(table: NetTable, cells: readonly string[]): string {
  return table.columns.map((c, k) => `${c} ${cells[k] ?? ""}`).join(", ");
}

/** True if the data has an em dash anywhere in its strings (the schema also refuses it). */
export function hasEmDash(data: unknown): boolean {
  return EM_DASH.test(JSON.stringify(data));
}

export { wordCount };
