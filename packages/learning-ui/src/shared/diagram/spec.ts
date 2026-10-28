// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
/**
 * The diagram spec: a few lines of text in a ```flow or ```sequence fence.
 * See docs/diagram-components-plan.md "The spec grammar". Every line must
 * match the grammar; anything else is a problem with its line number, so a
 * typo fails validation instead of drawing a wrong picture.
 */

export const DIAGRAM_KINDS = ["flow", "sequence"] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];

export const NODE_KINDS = ["actor", "box", "end", "store", "external"] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

export type DiagramNode = { id: string; label: string; kind: NodeKind; line: number };
export type DiagramEdge = { from: string; to: string; label?: string; dashed: boolean; line: number };
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
};

export type DiagramParseResult = { ok: true; spec: DiagramSpec } | { ok: false; problems: string[] };

export const DIAGRAM_LIMITS = {
  title: 80,
  name: 60,
  label: 60,
  flowNodes: 12,
  flowEdges: 16,
  sequenceNodes: 5,
  sequenceEdges: 12,
} as const;

export function isDiagramKind(value: unknown): value is DiagramKind {
  return typeof value === "string" && (DIAGRAM_KINDS as readonly string[]).includes(value);
}

// A bare name can hold anything but the characters the grammar uses; a quoted name can also hold ":".
const BARE_NAME = /^[^:"|`]+$/;
const QUOTED_NAME = /^[^"|`]+$/;
const SETTING = /^(title|direction|packet)\s*:\s*(.*)$/i;
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

type RawEdge = { names: string[]; dashes: boolean[]; label?: string; line: number };
type Name = { text: string; quoted: boolean };

function readName(raw: string): Name {
  const text = raw.trim();
  const quoted = text.length >= 2 && text.startsWith("\"") && text.endsWith("\"");
  return { text: (quoted ? text.slice(1, -1) : text).trim().replace(/\s+/g, " "), quoted };
}

/**
 * Splits an arrow line outside quotes: the names between "->" and "-->", and
 * the label after the first ":". Null when the line has no arrow.
 */
function splitArrows(text: string): { names: Name[]; dashes: boolean[]; label?: string } | null {
  const names: Name[] = [];
  const dashes: boolean[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "\"") quoted = !quoted;
    else if (!quoted && text.startsWith("-->", i)) { names.push(readName(current)); dashes.push(true); current = ""; i += 2; continue; }
    else if (!quoted && text.startsWith("->", i)) { names.push(readName(current)); dashes.push(false); current = ""; i += 1; continue; }
    else if (!quoted && char === ":" && dashes.length) {
      names.push(readName(current));
      return { names, dashes, label: text.slice(i + 1).trim() };
    }
    current += char;
  }
  if (!dashes.length) return null;
  names.push(readName(current));
  return { names, dashes };
}

export function parseDiagram(kind: DiagramKind, source: string): DiagramParseResult {
  const problems: string[] = [];
  const at = (line: number, message: string) => problems.push(`Line ${line}: ${message}`);
  let title: string | undefined;
  let direction: "right" | "down" | undefined;
  let packetLine: { names: string[]; line: number } | undefined;
  const nodes: DiagramNode[] = [];
  const byId = new Map<string, DiagramNode>();
  const rawEdges: RawEdge[] = [];

  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  lines.forEach((rawLine, index) => {
    const line = index + 1;
    const text = rawLine.trim();
    if (!text || text.startsWith("#")) return;
    if (hasControl(text)) {
      at(line, "remove the control character from this line.");
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
          if (!path || path.label !== undefined || path.names.some((name) => !name.text)) at(line, "write the packet path as names joined by arrows, for example \"packet: You -> DNS -> Server\".");
          else if (path.dashes.some(Boolean)) at(line, "write the packet path with \"->\" only. It follows the arrows already drawn.");
          else packetLine = { names: path.names.map((name) => name.text), line };
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
      const id = nodeId(label);
      const existing = byId.get(id);
      if (existing) {
        at(line, `"${label}" is already declared on line ${existing.line}. Declare each part once.`);
        return;
      }
      const node = { id, label, kind: nodeKind, line };
      nodes.push(node);
      byId.set(id, node);
      return;
    }

    if (arrows) {
      const { dashes, label } = arrows;
      const names = arrows.names.map((name) => name.text);
      if (names.some((name) => !name)) {
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
      rawEdges.push({ names, dashes, label, line });
      return;
    }

    at(line, `"${shorten(text)}" is not a diagram line. Write a part ("box DNS"), an arrow ("You -> DNS") or a setting ("title: How a page loads").`);
  });

  if (title === undefined) problems.push("Add a title line, for example \"title: How your phone finds a website\".");

  const edges: DiagramEdge[] = [];
  for (const raw of rawEdges) {
    const ids: string[] = [];
    for (const name of raw.names) {
      const node = byId.get(nodeId(name));
      if (!node) {
        at(raw.line, `"${name}" is not declared. Declare it first, for example "box ${name}".${declaredList(nodes)}`);
        ids.length = 0;
        break;
      }
      ids.push(node.id);
    }
    if (ids.length !== raw.names.length) continue;
    for (let i = 0; i < ids.length - 1; i++) {
      if (ids[i] === ids[i + 1]) {
        at(raw.line, `an arrow from "${raw.names[i]}" to itself cannot be drawn. Describe it in the text instead.`);
        continue;
      }
      if (kind === "flow") {
        const twin = edges.find((edge) => edge.from === ids[i] && edge.to === ids[i + 1]);
        if (twin) {
          at(raw.line, `there is already an arrow from "${raw.names[i]}" to "${raw.names[i + 1]}" on line ${twin.line}. Keep one.`);
          continue;
        }
      }
      edges.push({ from: ids[i], to: ids[i + 1], label: raw.label, dashed: raw.dashes[i], line: raw.line });
    }
  }

  const hops: PacketHop[] = [];
  const packet: string[] = [];
  if (packetLine) {
    const ids = packetLine.names.map((name) => byId.get(nodeId(name))?.id);
    const missing = packetLine.names.filter((_, i) => !ids[i]);
    if (missing.length) {
      at(packetLine.line, `"${missing[0]}" is not declared.${declaredList(nodes)}`);
    } else {
      for (let i = 0; i < ids.length - 1; i++) {
        const from = ids[i]!;
        const to = ids[i + 1]!;
        const forward = edges.findIndex((edge) => edge.from === from && edge.to === to);
        const backward = forward === -1 ? edges.findIndex((edge) => edge.from === to && edge.to === from) : -1;
        if (forward === -1 && backward === -1) {
          at(packetLine.line, `the packet moves from "${packetLine.names[i]}" to "${packetLine.names[i + 1]}", but no arrow joins them. Add the arrow or change the path.`);
          continue;
        }
        hops.push({ edge: forward === -1 ? backward : forward, reversed: forward === -1 });
      }
      packet.push(...(ids as string[]));
    }
  }

  const used = new Set(edges.flatMap((edge) => [edge.from, edge.to]));
  const unused = nodes.filter((node) => !used.has(node.id));
  // Unused parts are usually a misspelt arrow; only report them when the arrows themselves parsed.
  if (problems.length === 0) {
    for (const node of unused) at(node.line, `"${node.label}" has no arrow. Connect it or remove it.`);
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
    spec: { kind, title: title!, direction: direction ?? "right", nodes, edges, packet, hops },
  };
}

function checkName({ text, quoted }: Name): string | null {
  if (!text) return "write a name after the kind, for example \"box DNS\".";
  if (text.length > DIAGRAM_LIMITS.name) return `shorten "${shorten(text)}" to ${DIAGRAM_LIMITS.name} characters or fewer (it has ${text.length}).`;
  if (!quoted && text.includes(":")) return `put a name with ":" in quotes, for example box "Step 1: plan".`;
  if (!(quoted ? QUOTED_NAME : BARE_NAME).test(text)) return `"${shorten(text)}" cannot contain a quote mark, "|" or a backtick.`;
  return null;
}

function declaredList(nodes: DiagramNode[]): string {
  return nodes.length ? ` Declared: ${nodes.map((node) => node.label).join(", ")}.` : "";
}

function shorten(text: string): string {
  return text.length > 40 ? `${text.slice(0, 37)}...` : text;
}
