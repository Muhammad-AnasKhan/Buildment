// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { DiagramSpec, NodeKind } from "./spec";

/**
 * The text alternative for a diagram, written from the spec so it always
 * matches the picture: every part, every arrow and the packet's path in words.
 */

const KIND_WORD: Record<NodeKind, string | null> = {
  actor: "a person",
  box: null,
  end: "the end point",
  store: "stored data",
  external: "an outside service",
  decision: "a question",
};

export function describeDiagram(spec: DiagramSpec): string {
  const name = new Map(spec.nodes.map((node) => [node.id, node.label]));
  const parts = spec.nodes.map((node) => (KIND_WORD[node.kind] ? `${node.label} (${KIND_WORD[node.kind]})` : node.label));
  if (spec.kind === "sequence") {
    const steps = spec.edges.map((edge, i) => `${i + 1}. ${arrowText(name, edge)}.`);
    return `${spec.title}. A sequence of ${spec.edges.length} ${plural(spec.edges.length, "message")} between ${list(parts)}. ${steps.join(" ")}`;
  }
  const arrows = spec.edges.map((edge) => arrowText(name, edge));
  let out = `${spec.title}. A flow diagram with ${spec.nodes.length} parts: ${list(parts)}. Arrows: ${arrows.join("; ")}.`;
  if (spec.packet.length) out += ` A packet travels ${spec.packet.map((id) => name.get(id)).join(", then ")}.`;
  return out;
}

/** One caption per step. A flow's steps are the packet's stops; a sequence's are its messages. */
export function stepCaptions(spec: DiagramSpec): string[] {
  const name = new Map(spec.nodes.map((node) => [node.id, node.label]));
  if (spec.kind === "sequence") return spec.edges.map((edge) => arrowText(name, edge, false));
  if (!spec.packet.length) return [];
  return [
    `The packet starts at ${name.get(spec.packet[0])}.`,
    ...spec.hops.map((hop, i) => {
      const edge = spec.edges[hop.edge];
      const from = name.get(spec.packet[i]);
      const to = name.get(spec.packet[i + 1]);
      return edge.label ? `${from} to ${to}: ${edge.label}` : `${from} to ${to}.`;
    }),
  ];
}

/** `markDashed` names the dashed line for a screen reader; captions under the picture leave it out. */
function arrowText(name: Map<string, string>, edge: { from: string; to: string; label?: string; dashed: boolean; head: boolean; tail: boolean }, markDashed = true): string {
  const pair = edge.tail
    ? `${name.get(edge.from)} and ${name.get(edge.to)}, both ways`
    : `${name.get(edge.from)} ${edge.head ? "to" : "joined to"} ${name.get(edge.to)}`;
  const base = `${pair}${markDashed && edge.dashed ? " (dashed arrow)" : ""}`;
  return edge.label ? `${base}: ${edge.label}` : base;
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}
