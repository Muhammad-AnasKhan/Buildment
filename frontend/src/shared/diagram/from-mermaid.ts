// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { DIAGRAM_LIMITS, parseDiagram, type DiagramKind } from "./spec";

/**
 * Turns a simple Mermaid flowchart or sequence diagram into a diagram spec, so
 * existing chapters get the branded Diagram block without being rewritten.
 * Only exact translations count: anything this cannot map one to one
 * (subgraphs, notes, loops, unusual arrows, more parts than a phone can show)
 * returns null and the chapter keeps its Mermaid diagram. The result must also
 * pass parseDiagram, so the usual limits and checks apply.
 *
 * A fence can stay on Mermaid with a first line of `%% keep-mermaid`.
 */

export type ConvertedMermaid = { kind: DiagramKind; source: string };

export const KEEP_MERMAID = /^\s*%%\s*keep-mermaid\b/;

/**
 * `title` (a MermaidDiagram tag's own title) wins over the chart's title, which
 * wins over `fallbackTitle` (the heading above a fence).
 */
export function mermaidToDiagram(chart: string, fallbackTitle?: string, title?: string): ConvertedMermaid | null {
  const converted = translateMermaid(chart, fallbackTitle, title);
  return converted && parseDiagram(converted.kind, converted.source).ok ? converted : null;
}

/** The translation before validation, so tooling can report why a chart stays on Mermaid. */
export function translateMermaid(chart: string, fallbackTitle?: string, title?: string): ConvertedMermaid | null {
  if (KEEP_MERMAID.test(chart)) return null;
  const { title: chartTitle, body } = frontmatterTitle(chart.replace(/\r\n?/g, "\n"));
  const lines = body.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("%%"));
  if (!lines.length) return null;
  const header = lines[0];
  const converted = /^(flowchart|graph)\b/.test(header)
    ? flowchart(header, lines.slice(1))
    : header === "sequenceDiagram"
      ? sequence(lines.slice(1))
      : /^stateDiagram(-v2)?$/.test(header)
        ? states(lines.slice(1))
        : null;
  if (!converted) return null;
  const name = cleanTitle(title?.trim() || converted.title || chartTitle || fallbackTitle || "Diagram");
  return { kind: converted.kind, source: [`title: ${name}`, ...converted.lines].join("\n") };
}

type Converted = { kind: DiagramKind; title?: string; lines: string[] };

function frontmatterTitle(chart: string): { title?: string; body: string } {
  const match = /^\s*---\n([\s\S]*?)\n---\n/.exec(chart);
  if (!match) return { body: chart };
  const title = /^title:\s*(.+)$/m.exec(match[1])?.[1];
  return { title: title ? unquote(title) : undefined, body: chart.slice(match[0].length) };
}

function cleanTitle(title: string): string {
  const flat = title.replace(/[`*_]/g, "").replace(/\s+/g, " ").trim();
  return flat.length > DIAGRAM_LIMITS.title ? `${flat.slice(0, DIAGRAM_LIMITS.title - 3).trimEnd()}...` : flat;
}

function unquote(text: string): string {
  const t = text.trim();
  return /^".*"$|^'.*'$/.test(t) ? t.slice(1, -1) : t;
}

/** A name with ":" or a leading "#" needs quotes in the spec. */
function quoteIfNeeded(name: string): string {
  return name.includes(":") || name.startsWith("#") ? `"${name}"` : name;
}

/** Mermaid label text as plain words: line breaks become spaces, quotes go. */
function plain(text: string): string {
  return unquote(text).replace(/<br\s*\/?>/gi, " ").replace(/#quot;/g, "\"").replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------- flowchart

// id, then an optional shape with its text: ["a"], ("a"), (["a"]), [("a")], (("a")), {"a"}, [/a/], >a].
const NODE = /^([A-Za-z_][\w-]*)(?:(\[\(|\(\(|\(\[|\[\/|\[\\|\[|\(|\{|>)\s*("[^"]*"|[^\])}"]*?)\s*(\)\]|\)\)|\]\)|\/\]|\\\]|\]|\)|\}))?/;
const CLOSE: Record<string, string> = { "[(": ")]", "((": "))", "([": "])", "[/": "/]", "[\\": "\\]", "[": "]", "(": ")", "{": "}", ">": "]" };
// -- text -->, -- text ---, == text ==>, -. text .-> or -.text.-> (and .- for a line), or an
// arrow (-->, --->, -.->, ==>) or a line (---, -.-), with an optional |text|.
const LINK = /^(?:(?:--|==)\s+([^|>]*?)\s+(-->|==>|---)|-\.(?![->])\s*("[^"]*"|[^|[\]"]+?)\s*\.(->|-)(?!>)|(<-{2,}>|<={2,}>|-{2,}>|-{3,}|-\.->|-\.-|={2,}>)(?:\|([^|]*)\|)?)/;
const IGNORED = /^(classDef|class|style|linkStyle|click)\b/;

/** `group` is the index of the subgraph the node belongs to: where it got its label, else where it first appeared. */
type FlowNode = { id: string; label?: string; kind: "actor" | "box" | "decision" | "store"; group: number | null };
type FlowGroup = { id: string; label: string; parent: number | null };

// subgraph ID["Label"], subgraph ID[Label], subgraph "Label", or subgraph Some words.
const SUBGRAPH = /^subgraph\s+(?:([A-Za-z_][\w-]*)\s*\[\s*("[^"]*"|[^\]]*)\s*\]|("[^"]*")|(.+))$/;

function flowchart(header: string, lines: string[]): Converted | null {
  const dir = header.split(/\s+/)[1] ?? "TD";
  const direction = dir === "LR" ? "right" : dir === "TD" || dir === "TB" ? "down" : null;
  if (!direction) return null;
  const nodes = new Map<string, FlowNode>();
  const edges: { from: string; to: string; label?: string; dashed: boolean; head: boolean; both: boolean }[] = [];
  const groups: FlowGroup[] = [];
  const stack: number[] = [];
  const current = () => (stack.length ? stack[stack.length - 1] : null);

  const readNode = (text: string): { node: FlowNode; rest: string } | null => {
    const match = NODE.exec(text);
    if (!match) return null;
    const [whole, id, open, label, close] = match;
    if (open && CLOSE[open] !== close) return null;
    const kind = open === "[(" ? "store" : open === "((" ? "actor" : open === "{" ? "decision" : "box";
    const existing = nodes.get(id);
    const node: FlowNode = existing ?? { id, kind, group: current() };
    if (open) {
      if (existing?.label !== undefined && existing.label !== plain(label)) return null;
      // A node belongs where it is given its text, even if an arrow outside mentioned it first.
      if (existing && existing.label === undefined) node.group = current();
      node.label = plain(label);
      node.kind = kind;
    }
    nodes.set(id, node);
    return { node, rest: text.slice(whole.length).trim() };
  };

  // One or more nodes joined by "&" (A & B --> C means two arrows).
  const readNodes = (text: string): { nodes: FlowNode[]; rest: string } | null => {
    const found: FlowNode[] = [];
    let rest = text;
    for (;;) {
      const read = readNode(rest);
      if (!read) return null;
      found.push(read.node);
      rest = read.rest;
      if (!rest.startsWith("&")) return { nodes: found, rest };
      rest = rest.slice(1).trim();
    }
  };

  for (const line of lines) {
    if (IGNORED.test(line) || /^direction\s+\w+$/.test(line)) continue;
    const subgraph = SUBGRAPH.exec(line);
    if (subgraph) {
      const [, id, bracketLabel, quotedLabel, words] = subgraph;
      const label = plain(bracketLabel ?? quotedLabel ?? words ?? "");
      groups.push({ id: id ?? label, label, parent: current() });
      stack.push(groups.length - 1);
      continue;
    }
    if (line === "end") {
      if (!stack.length) return null;
      stack.pop();
      continue;
    }
    let read = readNodes(line);
    if (!read) return null;
    let { rest } = read;
    while (rest) {
      const link = LINK.exec(rest);
      if (!link) return null;
      const [whole, textLabel, textArrow, dottedLabel, dottedEnd, arrow, pipeLabel] = link;
      const next = readNodes(rest.slice(whole.length).trim());
      if (!next) return null;
      const label = plain(textLabel ?? dottedLabel ?? pipeLabel ?? "");
      const dashed = dottedLabel !== undefined || arrow === "-.->" || arrow === "-.-";
      const head = textArrow !== undefined ? textArrow !== "---" : dottedEnd !== undefined ? dottedEnd === "->" : arrow!.endsWith(">");
      const both = arrow?.startsWith("<") ?? false;
      for (const from of read.nodes) for (const to of next.nodes) edges.push({ from: from.id, to: to.id, label: label || undefined, dashed, head, both });
      read = next;
      rest = next.rest;
    }
  }
  if (!edges.length || stack.length) return null;
  // An arrow to a subgraph itself (A --> MyGroup) has no part to point at; keep Mermaid.
  if (groups.some((group) => nodes.has(group.id) && nodes.get(group.id)!.label === undefined)) return null;

  // Boxes that share their text keep their Mermaid ids, written as [id], so arrows find the right one.
  const text = (id: string) => nodes.get(id)!.label ?? id;
  const count = new Map<string, number>();
  for (const node of nodes.values()) count.set(text(node.id).toLowerCase(), (count.get(text(node.id).toLowerCase()) ?? 0) + 1);
  const shared = (id: string) => count.get(text(id).toLowerCase())! > 1;
  const declare = (id: string) => (shared(id) ? `[${id}] ` : "") + quoteIfNeeded(text(id));
  const refer = (id: string) => (shared(id) ? `[${id}]` : quoteIfNeeded(text(id)));
  const link = (edge: (typeof edges)[number]) =>
    edge.both ? "<->" : edge.head ? (edge.dashed ? "-->" : "->") : edge.dashed ? "-.-" : "---";
  // Parts, then each group as a block holding its parts and inner groups; empty groups are left out.
  const holds = (g: number): boolean => [...nodes.values()].some((node) => node.group === g) || groups.some((child, c) => child.parent === g && holds(c));
  const block = (parent: number | null, indent: string): string[] => [
    ...[...nodes.values()].filter((node) => node.group === parent).map((node) => `${indent}${node.kind} ${declare(node.id)}`),
    ...groups.flatMap((group, g) => (group.parent === parent && holds(g) ? [`${indent}group ${group.label}`, ...block(g, `${indent}  `), `${indent}end`] : [])),
  ];
  return {
    kind: "flow",
    lines: [
      `direction: ${direction}`,
      ...block(null, ""),
      ...edges.map((edge) => `${refer(edge.from)} ${link(edge)} ${refer(edge.to)}${edge.label ? `: ${edge.label}` : ""}`),
    ],
  };
}

// ---------------------------------------------------------------- sequence

// Ids may hold single hyphens ("web-app") but never the dashes of an arrow.
const PARTICIPANT = /^(participant|actor)\s+(\w+(?:-\w+)*)(?:\s+as\s+(.+))?$/;
// ->> and -> are calls, -->> and --> replies; -x (lost) and -) (async) are drawn as calls.
const MESSAGE = /^(\w+(?:-\w+)*)\s*(-->>|->>|--x|-x|--\)|-\)|-->|->)\s*[+-]?(\w+(?:-\w+)*)\s*:\s*(.+)$/;
const NOTE = /^note\s+(over|left of|right of)\s+([\w-]+(?:\s*,\s*[\w-]+)?)\s*:\s*(.+)$/i;
const BLOCK = /^(loop|alt|opt|par|critical|break)\b\s*(.*)$/;
const SECTION = /^(else|and|option)\b\s*(.*)$/;

function sequence(lines: string[]): Converted | null {
  const parts = new Map<string, { label: string; kind: "actor" | "box" }>();
  // Statements in order: messages, notes, and block lines, written out once every part is known.
  const statements: ((label: (id: string) => string) => string)[] = [];
  const blocks: ("block" | "rect")[] = [];
  let messages = 0;
  let title: string | undefined;
  const ensure = (id: string) => { if (!parts.has(id)) parts.set(id, { label: id, kind: "box" }); };

  for (const line of lines) {
    if (line === "autonumber" || /^(activate|deactivate)\s/.test(line)) continue;
    const titled = /^title\s*:?\s+(.+)$/.exec(line);
    if (titled) { title = plain(titled[1]); continue; }
    const participant = PARTICIPANT.exec(line);
    if (participant) {
      parts.set(participant[2], { label: plain(participant[3] ?? participant[2]), kind: participant[1] === "actor" ? "actor" : "box" });
      continue;
    }
    // A coloured background (rect) has no meaning to keep; its end is skipped too.
    if (/^rect\b/.test(line)) { blocks.push("rect"); continue; }
    if (line === "end") {
      const closed = blocks.pop();
      if (!closed) return null;
      if (closed === "block") statements.push(() => "end");
      continue;
    }
    const block = BLOCK.exec(line);
    if (block) {
      blocks.push("block");
      statements.push(() => `${block[1]} ${plain(block[2])}`.trim());
      continue;
    }
    const section = SECTION.exec(line);
    if (section) {
      statements.push(() => `${section[1]} ${plain(section[2])}`.trim());
      continue;
    }
    const note = NOTE.exec(line);
    if (note) {
      const ids = note[2].split(",").map((id) => id.trim());
      ids.forEach(ensure);
      statements.push((label) => `note ${note[1].toLowerCase()} ${ids.map(label).join(", ")}: ${plain(note[3])}`);
      continue;
    }
    const message = MESSAGE.exec(line);
    if (!message) return null;
    const [, from, arrow, to, text] = message;
    ensure(from);
    ensure(to);
    messages++;
    const link = arrow.startsWith("--") && !arrow.endsWith("x") && !arrow.endsWith(")") ? "-->" : "->";
    statements.push((label) => `${label(from)} ${link} ${label(to)}: ${plain(text)}`);
  }
  if (!messages || blocks.length) return null;

  const labels = [...parts.values()].map((part) => part.label.toLowerCase());
  if (new Set(labels).size !== labels.length) return null;
  const label = (id: string) => quoteIfNeeded(parts.get(id)!.label);
  return {
    kind: "sequence",
    title,
    lines: [...[...parts.values()].map((part) => `${part.kind} ${quoteIfNeeded(part.label)}`), ...statements.map((statement) => statement(label))],
  };
}

// ---------------------------------------------------------------- state diagrams

const TRANSITION = /^(\[\*\]|[\w-]+)(?::::\w+)?\s*-->\s*(\[\*\]|[\w-]+)(?::::\w+)?\s*(?::\s*(.+))?$/;
const STATE_ALIAS = /^state\s+"([^"]+)"\s+as\s+([\w-]+)\s*(\{)?$/;
const STATE_OPEN = /^state\s+([\w-]+)\s*\{$/;
const STATE_SPECIAL = /^state\s+([\w-]+)\s*<<(\w+)>>$/;
const STATE_NOTE = /^([\w-]+)\s*:\s*(.+)$/;

type StatePart = { id: string; label: string; kind: "state" | "decision" | "start" | "stop"; group: number | null };

/**
 * A state diagram becomes a flow: states are rounded boxes, [*] a start dot or a finish
 * ring (one each per composite state), <<choice>> a decision, composite states groups,
 * and a state's arrow to itself a loop. Notes, fork and join, and concurrent regions
 * stay on Mermaid.
 */
function states(lines: string[]): Converted | null {
  let direction: "right" | "down" = "down";
  const parts = new Map<string, StatePart>();
  const groups: { label: string; parent: number | null; id: string }[] = [];
  const stack: number[] = [];
  const transitions: { from: string; to: string; label?: string }[] = [];
  const scope = () => (stack.length ? stack[stack.length - 1] : null);
  const part = (id: string): StatePart => {
    const existing = parts.get(id);
    if (existing) return existing;
    const created: StatePart = { id, label: id, kind: "state", group: scope() };
    parts.set(id, created);
    return created;
  };
  const marker = (end: "start" | "stop") => {
    const id = `${end}-${scope() ?? "top"}`;
    if (!parts.has(id)) parts.set(id, { id, label: end === "start" ? "Start" : "Finish", kind: end, group: scope() });
    return id;
  };

  for (const line of lines) {
    if (/^(classDef|class|style)\b/.test(line)) continue;
    const dir = /^direction\s+(\w+)$/.exec(line);
    if (dir) {
      if (dir[1] === "LR") direction = "right";
      else if (dir[1] !== "TB" && dir[1] !== "TD") return null;
      continue;
    }
    if (line === "}") {
      if (!stack.length) return null;
      stack.pop();
      continue;
    }
    if (/^note\b/i.test(line) || line === "--") return null;
    const alias = STATE_ALIAS.exec(line);
    const open = STATE_OPEN.exec(line);
    if (alias || open) {
      const id = alias ? alias[2] : open![1];
      if (alias && !alias[3]) {
        part(id).label = plain(alias[1]);
        continue;
      }
      groups.push({ label: alias ? plain(alias[1]) : id, parent: scope(), id });
      stack.push(groups.length - 1);
      continue;
    }
    const special = STATE_SPECIAL.exec(line);
    if (special) {
      if (special[2] !== "choice") return null;
      const choice = part(special[1]);
      choice.kind = "decision";
      choice.label = special[1];
      continue;
    }
    const move = TRANSITION.exec(line);
    if (move) {
      const [, from, to, label] = move;
      const a = from === "[*]" ? marker("start") : part(from).id;
      const b = to === "[*]" ? marker("stop") : part(to).id;
      transitions.push({ from: a, to: b, label: label ? plain(label) : undefined });
      continue;
    }
    const described = STATE_NOTE.exec(line);
    if (described) {
      const state = part(described[1]);
      state.label = `${state.label}: ${plain(described[2])}`;
      continue;
    }
    return null;
  }
  if (!transitions.length || stack.length) return null;
  // An arrow to a composite state points at a whole group; keep Mermaid.
  if (transitions.some((t) => groups.some((g) => g.id === t.from || g.id === t.to))) return null;
  for (const group of groups) parts.delete(group.id);

  const count = new Map<string, number>();
  for (const p of parts.values()) count.set(p.label.toLowerCase(), (count.get(p.label.toLowerCase()) ?? 0) + 1);
  const ref = (p: StatePart) => p.kind === "start" || p.kind === "stop" || count.get(p.label.toLowerCase())! > 1;
  const safeId = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, "-");
  const declare = (p: StatePart) => (ref(p) ? `[${safeId(p.id)}] ` : "") + quoteIfNeeded(p.label);
  const refer = (id: string) => (ref(parts.get(id)!) ? `[${safeId(id)}]` : quoteIfNeeded(parts.get(id)!.label));
  const holds = (g: number): boolean => [...parts.values()].some((p) => p.group === g) || groups.some((child, c) => child.parent === g && holds(c));
  const block = (parent: number | null, indent: string): string[] => [
    ...[...parts.values()].filter((p) => p.group === parent).map((p) => `${indent}${p.kind} ${declare(p)}`),
    ...groups.flatMap((group, g) => (group.parent === parent && holds(g) ? [`${indent}group ${group.label}`, ...block(g, `${indent}  `), `${indent}end`] : [])),
  ];
  return {
    kind: "flow",
    lines: [
      `direction: ${direction}`,
      ...block(null, ""),
      ...transitions.map((t) => `${refer(t.from)} -> ${refer(t.to)}${t.label ? `: ${t.label}` : ""}`),
    ],
  };
}
