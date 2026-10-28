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
// -- text -->, == text ==>, -. text .->, or an arrow (-->, --->, -.->, ==>) or a plain
// line (---, ----), with an optional |text|.
const LINK = /^(?:(?:--|==)\s+([^|>]*?)\s+(-->|==>)|-\.\s+([^|>]*?)\s+\.->|(-{2,}>|-{3,}|-\.->|={2,}>)(?:\|([^|]*)\|)?)/;
const IGNORED = /^(classDef|class|style|linkStyle|click)\b/;

type FlowNode = { id: string; label?: string; kind: "actor" | "box" | "decision" | "store" };

function flowchart(header: string, lines: string[]): Converted | null {
  const dir = header.split(/\s+/)[1] ?? "TD";
  const direction = dir === "LR" ? "right" : dir === "TD" || dir === "TB" ? "down" : null;
  if (!direction) return null;
  const nodes = new Map<string, FlowNode>();
  const edges: { from: string; to: string; label?: string; dashed: boolean; head: boolean }[] = [];

  const readNode = (text: string): { node: FlowNode; rest: string } | null => {
    const match = NODE.exec(text);
    if (!match) return null;
    const [whole, id, open, label, close] = match;
    if (open && CLOSE[open] !== close) return null;
    const kind = open === "[(" ? "store" : open === "((" ? "actor" : open === "{" ? "decision" : "box";
    const existing = nodes.get(id);
    const node: FlowNode = existing ?? { id, kind };
    if (open) {
      if (existing?.label !== undefined && existing.label !== plain(label)) return null;
      node.label = plain(label);
      node.kind = kind;
    }
    nodes.set(id, node);
    return { node, rest: text.slice(whole.length).trim() };
  };

  for (const line of lines) {
    if (IGNORED.test(line)) continue;
    if (/^(subgraph|end|direction)\b/.test(line) || line.includes("&")) return null;
    let read = readNode(line);
    if (!read) return null;
    let { rest } = read;
    while (rest) {
      const link = LINK.exec(rest);
      if (!link) return null;
      const [whole, textLabel, , dottedLabel, arrow, pipeLabel] = link;
      const next = readNode(rest.slice(whole.length).trim());
      if (!next) return null;
      const label = plain(textLabel ?? dottedLabel ?? pipeLabel ?? "");
      const dashed = dottedLabel !== undefined || arrow === "-.->";
      const head = arrow === undefined || arrow.endsWith(">");
      edges.push({ from: read.node.id, to: next.node.id, label: label || undefined, dashed, head });
      read = next;
      rest = next.rest;
    }
  }
  if (!edges.length) return null;

  const name = (id: string) => quoteIfNeeded(nodes.get(id)!.label ?? id);
  const names = [...nodes.values()].map((node) => name(node.id));
  if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) return null;
  return {
    kind: "flow",
    lines: [
      `direction: ${direction}`,
      ...[...nodes.values()].map((node) => `${node.kind} ${name(node.id)}`),
      ...edges.map((edge) => `${name(edge.from)} ${edge.head ? (edge.dashed ? "-->" : "->") : "---"} ${name(edge.to)}${edge.label ? `: ${edge.label}` : ""}`),
    ],
  };
}

// ---------------------------------------------------------------- sequence

// Ids may hold single hyphens ("web-app") but never the dashes of an arrow.
const PARTICIPANT = /^(participant|actor)\s+(\w+(?:-\w+)*)(?:\s+as\s+(.+))?$/;
const MESSAGE = /^(\w+(?:-\w+)*)\s*(-->>|->>|-->|->)\s*[+-]?(\w+(?:-\w+)*)\s*:\s*(.+)$/;

function sequence(lines: string[]): Converted | null {
  const parts = new Map<string, { label: string; kind: "actor" | "box" }>();
  const messages: string[][] = [];
  let title: string | undefined;
  const ensure = (id: string) => { if (!parts.has(id)) parts.set(id, { label: id, kind: "box" }); };

  for (const line of lines) {
    if (line === "autonumber") continue;
    const titled = /^title\s*:?\s+(.+)$/.exec(line);
    if (titled) { title = plain(titled[1]); continue; }
    const participant = PARTICIPANT.exec(line);
    if (participant) {
      parts.set(participant[2], { label: plain(participant[3] ?? participant[2]), kind: participant[1] === "actor" ? "actor" : "box" });
      continue;
    }
    const message = MESSAGE.exec(line);
    if (!message) return null;
    const [, from, arrow, to, text] = message;
    ensure(from);
    ensure(to);
    messages.push([from, arrow.startsWith("--") ? "-->" : "->", to, plain(text)]);
  }
  if (!messages.length) return null;

  const labels = [...parts.values()].map((part) => part.label.toLowerCase());
  if (new Set(labels).size !== labels.length) return null;
  const label = (id: string) => quoteIfNeeded(parts.get(id)!.label);
  return {
    kind: "sequence",
    title,
    lines: [
      ...[...parts.values()].map((part) => `${part.kind} ${quoteIfNeeded(part.label)}`),
      ...messages.map(([from, arrow, to, text]) => `${label(from)} ${arrow} ${label(to)}: ${text}`),
    ],
  };
}
