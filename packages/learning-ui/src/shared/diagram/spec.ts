// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
/**
 * The diagram spec: a few lines of text in a ```flow or ```sequence fence.
 * See docs/diagram-components-plan.md "The spec grammar". Every line must
 * match the grammar; anything else is a problem with its line number, so a
 * typo fails validation instead of drawing a wrong picture.
 */

export const DIAGRAM_KINDS = ["flow", "sequence"] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];

export const NODE_KINDS = ["actor", "box", "decision", "end", "store", "external", "state", "start", "stop"] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

/** `group` is the index of the innermost group the part sits in, or null. */
export type DiagramNode = { id: string; label: string; kind: NodeKind; line: number; group: number | null };
/** A labelled box around some parts, such as a private network. Groups may sit inside groups. */
export type DiagramGroup = { label: string; parent: number | null; line: number };
/** Sequence only: a note before message `before`, over one or two lanes or beside one. */
export type DiagramNote = { before: number; from: string; to: string; side: "over" | "left" | "right"; text: string; line: number };
/**
 * Sequence only: a framed block around messages `start` to `end` (exclusive), such as a loop
 * or the branches of an alt. `sections` mark where an else or and branch begins.
 */
export const BLOCK_KINDS = ["loop", "alt", "opt", "par", "critical", "break"] as const;
export type DiagramBlock = {
  kind: (typeof BLOCK_KINDS)[number];
  label: string;
  start: number;
  end: number;
  sections: { at: number; label: string }[];
  depth: number;
  line: number;
};
/**
 * `head` is false for a plain line (`---`), which joins two parts without a direction;
 * `tail` is true for a two-way arrow (`<->`), with a head at each end.
 */
export type DiagramEdge = { from: string; to: string; label?: string; dashed: boolean; head: boolean; tail: boolean; line: number };
/** One move of the packet: along `edge`, backwards when the arrow points the other way. */
export type PacketHop = { edge: number; reversed: boolean };

export type DiagramSpec = {
  kind: DiagramKind;
  title: string;
  direction: "right" | "down";
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** Flow only: the node ids the packet visits, in order. Empty without a packet line. */
  packet: string[];
  hops: PacketHop[];
  groups: DiagramGroup[];
  notes: DiagramNote[];
  blocks: DiagramBlock[];
};

export type DiagramParseResult = { ok: true; spec: DiagramSpec } | { ok: false; problems: string[] };

export const DIAGRAM_LIMITS = {
  title: 80,
  name: 110,
  label: 100,
  flowNodes: 30,
  flowEdges: 40,
  sequenceNodes: 8,
  sequenceEdges: 30,
} as const;

export function isDiagramKind(value: unknown): value is DiagramKind {
  return typeof value === "string" && (DIAGRAM_KINDS as readonly string[]).includes(value);
}

// A bare name can hold anything but the characters the grammar uses; a quoted name can also hold ":".
const BARE_NAME = /^[^:"`]+$/;
const QUOTED_NAME = /^[^"`]+$/;
const SETTING = /^(title|direction|packet)\s*:\s*(.*)$/i;
const GROUP_LINE = /^group\s+(.+)$/i;
const NOTE_LINE = /^note\s+(over|left of|right of)\s+([^:]+?)\s*:\s*(.+)$/i;
const BLOCK_LINE = new RegExp(`^(${BLOCK_KINDS.join("|")})\\b\\s*(.*)$`, "i");
const SECTION_LINE = /^(else|and|option)\b\s*(.*)$/i;
const NODE_LINE = new RegExp(`^(${NODE_KINDS.join("|")})\\s+(.+)$`, "i");
/** True when the text has a control character other than a tab. */
function hasControl(text: string): boolean {
  return [...text].some((char) => {
    const code = char.charCodeAt(0);
    return (code < 32 && code !== 9) || code === 127;
  });
}

/** Names match without case and with spaces collapsed, so "Load  balancer" is "load balancer". */
export function nodeId(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** `->` arrow, `-->` dashed arrow, `<->` two-way arrow, `---` plain line, `-.-` dashed line with no head. */
type Link = "arrow" | "dashed" | "both" | "line" | "dotted";
type RawEdge = { names: string[]; shown: string[]; links: Link[]; label?: string; line: number };
/** `ref` is an explicit id written as [id], for two parts that share the same text. */
type Name = { text: string; quoted: boolean; ref?: string };

const REF = /^\[([A-Za-z0-9_-]+)\]\s*(.*)$/;

function readName(raw: string): Name {
  const trimmed = raw.trim();
  const ref = REF.exec(trimmed);
  const text = ref ? ref[2] : trimmed;
  const quoted = text.length >= 2 && text.startsWith("\"") && text.endsWith("\"");
  return { text: (quoted ? text.slice(1, -1) : text).trim().replace(/\s+/g, " "), quoted, ref: ref?.[1] };
}

/** The key a name is looked up by: its [id] when it has one, else its text. */
function keyOf(name: Name): string {
  return name.ref ? `[${name.ref.toLowerCase()}]` : nodeId(name.text);
}

/**
 * Splits an arrow line outside quotes: the names between "->", "-->" and "---",
 * and the label after the first ":". Null when the line has no arrow.
 */
function splitArrows(text: string): { names: Name[]; links: Link[]; label?: string } | null {
  const names: Name[] = [];
  const links: Link[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "\"") quoted = !quoted;
    else if (!quoted && text.startsWith("<->", i)) { names.push(readName(current)); links.push("both"); current = ""; i += 2; continue; }
    else if (!quoted && text.startsWith("-.-", i)) { names.push(readName(current)); links.push("dotted"); current = ""; i += 2; continue; }
    else if (!quoted && text.startsWith("---", i)) { names.push(readName(current)); links.push("line"); current = ""; i += 2; continue; }
    else if (!quoted && text.startsWith("-->", i)) { names.push(readName(current)); links.push("dashed"); current = ""; i += 2; continue; }
    else if (!quoted && text.startsWith("->", i)) { names.push(readName(current)); links.push("arrow"); current = ""; i += 1; continue; }
    else if (!quoted && char === ":" && links.length) {
      names.push(readName(current));
      return { names, links, label: text.slice(i + 1).trim() };
    }
    current += char;
  }
  if (!links.length) return null;
  names.push(readName(current));
  return { names, links };
}

export function parseDiagram(kind: DiagramKind, source: string): DiagramParseResult {
  const problems: string[] = [];
  const at = (line: number, message: string) => problems.push(`Line ${line}: ${message}`);
  let title: string | undefined;
  let direction: "right" | "down" | undefined;
  let packetLine: { names: string[]; shown: string[]; line: number } | undefined;
  const nodes: DiagramNode[] = [];
  const groups: DiagramGroup[] = [];
  const open: number[] = [];
  const byId = new Map<string, DiagramNode>();
  const rawEdges: RawEdge[] = [];
  // Sequence notes and blocks, placed by how many messages come before them.
  let messages = 0;
  const rawNotes: { before: number; names: Name[]; side: DiagramNote["side"]; text: string; line: number }[] = [];
  const blocks: DiagramBlock[] = [];
  const openBlocks: number[] = [];

  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  lines.forEach((rawLine, index) => {
    const line = index + 1;
    const text = rawLine.trim();
    if (!text || text.startsWith("#")) return;
    if (hasControl(text)) {
      at(line, "remove the control character from this line.");
      return;
    }

    // "group <label>" opens a group; a line with only "end" closes the innermost one.
    // (A line that starts with "Group" but has an arrow, such as "Group by shop -> Total", is an arrow.)
    const groupLine = splitArrows(text) ? null : GROUP_LINE.exec(text);
    if (groupLine) {
      if (kind !== "flow") at(line, "groups are for flow diagrams only.");
      else {
        const label = readName(groupLine[1]).text;
        if (label.length > DIAGRAM_LIMITS.title) at(line, `shorten the group name to ${DIAGRAM_LIMITS.title} characters or fewer.`);
        groups.push({ label, parent: open.length ? open[open.length - 1] : null, line });
        open.push(groups.length - 1);
      }
      return;
    }
    if (kind === "sequence") {
      const note = NOTE_LINE.exec(text);
      if (note) {
        const side = note[1].toLowerCase().startsWith("left") ? "left" : note[1].toLowerCase().startsWith("right") ? "right" : "over";
        const names = note[2].split(",").map(readName);
        if (names.length > 2 || (side !== "over" && names.length > 1)) at(line, "a note sits over one or two parts, or beside one part.");
        else if (note[3].trim().length > DIAGRAM_LIMITS.label * 2) at(line, `shorten the note to ${DIAGRAM_LIMITS.label * 2} characters or fewer.`);
        else rawNotes.push({ before: messages, names, side, text: note[3].trim(), line });
        return;
      }
      const block = splitArrows(text) ? null : BLOCK_LINE.exec(text);
      if (block) {
        blocks.push({ kind: block[1].toLowerCase() as DiagramBlock["kind"], label: block[2].trim(), start: messages, end: messages, sections: [], depth: openBlocks.length, line });
        openBlocks.push(blocks.length - 1);
        return;
      }
      const section = splitArrows(text) ? null : SECTION_LINE.exec(text);
      if (section) {
        if (!openBlocks.length) at(line, `"${section[1]}" belongs inside a block, such as "alt" or "par".`);
        else blocks[openBlocks[openBlocks.length - 1]].sections.push({ at: messages, label: section[2].trim() });
        return;
      }
    }
    if (/^end$/i.test(text)) {
      if (kind === "sequence") {
        if (!openBlocks.length) at(line, "this \"end\" has no block to close. Open one with \"loop\", \"alt\", \"opt\" or \"par\".");
        else blocks[openBlocks.pop()!].end = messages;
      } else if (!open.length) at(line, "this \"end\" has no group to close. Open one with \"group <name>\".");
      else open.pop();
      return;
    }

    const setting = SETTING.exec(text);
    if (setting) {
      const key = setting[1].toLowerCase();
      const value = setting[2].trim();
      if (key === "title") {
        if (title !== undefined) at(line, "the diagram already has a title. Keep one title line.");
        else if (!value) at(line, "write the title after \"title:\".");
        else if (value.length > DIAGRAM_LIMITS.title) at(line, `shorten the title to ${DIAGRAM_LIMITS.title} characters or fewer (it has ${value.length}).`);
        title = value || title;
      } else if (key === "direction") {
        if (kind !== "flow") at(line, "direction is for flow diagrams only. A sequence always runs top to bottom.");
        else if (direction !== undefined) at(line, "the diagram already has a direction. Keep one direction line.");
        else if (value !== "right" && value !== "down") at(line, `direction must be "right" or "down", not "${value}".`);
        else direction = value;
      } else {
        if (kind !== "flow") at(line, "packet is for flow diagrams only. In a sequence, every arrow is already a step.");
        else if (packetLine) at(line, "the diagram already has a packet line. Keep one packet path.");
        else {
          const path = splitArrows(value);
          if (!path || path.label !== undefined || path.names.some((name) => !name.text && !name.ref)) at(line, "write the packet path as names joined by arrows, for example \"packet: You -> DNS -> Server\".");
          else if (path.links.some((link) => link !== "arrow")) at(line, "write the packet path with \"->\" only. It follows the arrows already drawn.");
          else packetLine = { names: path.names.map(keyOf), shown: path.names.map((name) => (name.ref ? `[${name.ref}]` : name.text)), line };
        }
      }
      return;
    }

    const arrows = splitArrows(text);
    const nodeLine = NODE_LINE.exec(text);
    if (nodeLine && !arrows) {
      const nodeKind = nodeLine[1].toLowerCase() as NodeKind;
      const name = readName(nodeLine[2]);
      const label = name.text;
      const nameProblem = checkName(name);
      if (nameProblem) {
        at(line, nameProblem);
        return;
      }
      const id = keyOf(name);
      const existing = byId.get(id);
      if (existing) {
        const hint = name.ref ? "" : ` To show the same text twice, give each an id, for example "${nodeKind} [A2] ${label}".`;
        at(line, `"${name.ref ? `[${name.ref}]` : label}" is already declared on line ${existing.line}. Declare each part once.${hint}`);
        return;
      }
      const node = { id, label, kind: nodeKind, line, group: open.length ? open[open.length - 1] : null };
      nodes.push(node);
      byId.set(id, node);
      return;
    }

    if (arrows) {
      const { links, label } = arrows;
      const shown = arrows.names.map((name) => (name.ref ? `[${name.ref}]` : name.text));
      const names = arrows.names.map(keyOf);
      if (arrows.names.some((name) => !name.text && !name.ref)) {
        at(line, "an arrow needs a name on both sides, for example \"You -> DNS\".");
        return;
      }
      if (label !== undefined && !label) {
        at(line, "write the label after the colon, or remove the colon.");
        return;
      }
      if (label !== undefined && names.length > 2) {
        at(line, "a label fits on one arrow only. Write one line per labelled arrow, for example \"You -> DNS: asks for the address\".");
        return;
      }
      if (label !== undefined && label.length > DIAGRAM_LIMITS.label) {
        at(line, `shorten the label to ${DIAGRAM_LIMITS.label} characters or fewer (it has ${label.length}). Put the detail in the text around the diagram.`);
        return;
      }
      if (kind === "sequence" && links.some((link) => link === "line" || link === "dotted" || link === "both")) {
        at(line, "a message needs a direction. Write \"->\" or \"-->\", not \"---\".");
        return;
      }
      rawEdges.push({ names, shown, links, label, line });
      messages += names.length - 1;
      return;
    }

    at(line, `"${shorten(text)}" is not a diagram line. Write a part ("box DNS"), an arrow ("You -> DNS") or a setting ("title: How a page loads").`);
  });

  for (const index of open) at(groups[index].line, `the group "${groups[index].label}" is never closed. Add a line with "end".`);
  for (const index of openBlocks) at(blocks[index].line, `the "${blocks[index].kind}" block is never closed. Add a line with "end".`);
  groups.forEach((group, index) => {
    const inside = (g: number | null): boolean => g !== null && (g === index || inside(groups[g].parent));
    if (!nodes.some((node) => inside(node.group))) at(group.line, `the group "${group.label}" has no parts in it.`);
  });
  if (title === undefined) problems.push("Add a title line, for example \"title: How your phone finds a website\".");

  // A part with an [id] can also be named by its text, as long as no other part has that text.
  for (const node of nodes) {
    if (!node.id.startsWith("[")) continue;
    const key = nodeId(node.label);
    if (!byId.has(key) && nodes.filter((other) => nodeId(other.label) === key).length === 1) byId.set(key, node);
  }

  const edges: DiagramEdge[] = [];
  for (const raw of rawEdges) {
    const ids: string[] = [];
    for (const [i, key] of raw.names.entries()) {
      const node = byId.get(key);
      if (!node) {
        const name = raw.shown[i];
        at(raw.line, `"${name}" is not declared. Declare it first, for example "box ${name}".${declaredList(nodes)}`);
        ids.length = 0;
        break;
      }
      ids.push(node.id);
    }
    if (ids.length !== raw.names.length) continue;
    for (let i = 0; i < ids.length - 1; i++) {
      // An arrow to the same part is drawn as a loop; repeated arrows between two parts sit side by side.
      const link = raw.links[i];
      edges.push({
        from: ids[i],
        to: ids[i + 1],
        label: raw.label,
        dashed: link === "dashed" || link === "dotted",
        head: link === "arrow" || link === "dashed" || link === "both",
        tail: link === "both",
        line: raw.line,
      });
    }
  }

  const hops: PacketHop[] = [];
  const packet: string[] = [];
  if (packetLine) {
    const ids = packetLine.names.map((key) => byId.get(key)?.id);
    const missing = packetLine.shown.filter((_, i) => !ids[i]);
    if (missing.length) {
      at(packetLine.line, `"${missing[0]}" is not declared.${declaredList(nodes)}`);
    } else {
      for (let i = 0; i < ids.length - 1; i++) {
        const from = ids[i]!;
        const to = ids[i + 1]!;
        const forward = edges.findIndex((edge) => edge.from === from && edge.to === to);
        const backward = forward === -1 ? edges.findIndex((edge) => edge.from === to && edge.to === from) : -1;
        if (forward === -1 && backward === -1) {
          at(packetLine.line, `the packet moves from "${packetLine.shown[i]}" to "${packetLine.shown[i + 1]}", but no arrow joins them. Add the arrow or change the path.`);
          continue;
        }
        hops.push({ edge: forward === -1 ? backward : forward, reversed: forward === -1 });
      }
      packet.push(...(ids as string[]));
    }
  }

  const notes: DiagramNote[] = [];
  for (const note of rawNotes) {
    const ids = note.names.map((name) => byId.get(keyOf(name))?.id);
    const missing = note.names.find((_, i) => !ids[i]);
    if (missing) {
      at(note.line, `"${missing.text}" is not declared.${declaredList(nodes)}`);
      continue;
    }
    notes.push({ before: note.before, from: ids[0]!, to: ids[ids.length - 1]!, side: note.side, text: note.text, line: note.line });
  }

  const maxNodes = kind === "flow" ? DIAGRAM_LIMITS.flowNodes : DIAGRAM_LIMITS.sequenceNodes;
  const maxEdges = kind === "flow" ? DIAGRAM_LIMITS.flowEdges : DIAGRAM_LIMITS.sequenceEdges;
  if (nodes.length < 2) problems.push("A diagram needs at least two parts, for example \"actor You\" and \"box DNS\".");
  if (nodes.length > maxNodes) problems.push(`A ${kind} diagram fits a phone with up to ${maxNodes} parts; this one has ${nodes.length}. Split it into two diagrams.`);
  if (rawEdges.length === 0 && nodes.length >= 2) problems.push("Add at least one arrow, for example \"You -> DNS\".");
  if (edges.length > maxEdges) problems.push(`A ${kind} diagram fits a phone with up to ${maxEdges} arrows; this one has ${edges.length}. Split it into two diagrams.`);

  if (problems.length) return { ok: false, problems };
  return {
    ok: true,
    spec: { kind, title: title!, direction: direction ?? "right", nodes, edges, packet, hops, groups, notes, blocks },
  };
}

function checkName({ text, quoted }: Name): string | null {
  if (!text) return "write a name after the kind, for example \"box DNS\".";
  if (text.length > DIAGRAM_LIMITS.name) return `shorten "${shorten(text)}" to ${DIAGRAM_LIMITS.name} characters or fewer (it has ${text.length}).`;
  if (!quoted && text.includes(":")) return `put a name with ":" in quotes, for example box "Step 1: plan".`;
  if (!(quoted ? QUOTED_NAME : BARE_NAME).test(text)) return `"${shorten(text)}" cannot contain a quote mark or a backtick.`;
  return null;
}

function declaredList(nodes: DiagramNode[]): string {
  return nodes.length ? ` Declared: ${nodes.map((node) => node.label).join(", ")}.` : "";
}

function shorten(text: string): string {
  return text.length > 40 ? `${text.slice(0, 37)}...` : text;
}
