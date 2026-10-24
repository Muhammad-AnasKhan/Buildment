// The LabSpec data contract. An author writes a LabSpec in a lab's data.ts; the
// registry, the runtime and the validator all read it. validateLabSpec is the
// runtime guard the registry test runs over every registered lab.

import type { ComponentKind } from "./catalog";
import { canConnect, isComponentKind } from "./catalog";

export type LabFamily = "hld" | "db";

export interface BoardNode {
  id: string;
  kind: ComponentKind;
  x: number;
  y: number;
  props?: Record<string, number | string>;
}

export interface BoardEdge {
  from: string;
  to: string;
}

export interface Board {
  nodes: BoardNode[];
  edges: BoardEdge[];
}

export interface LabLevel {
  id: string;
  load: number;
  targets: { rps?: number; p99Ms?: number; availability?: number; budgetPerHour?: number };
  event?: string;
}

export interface LabBase {
  slug: string;
  family: LabFamily;
  title: string;
  purpose: string;
  limits: string;
  hints: string[];
  referenceSlug?: string;
}

export interface HldLabSpec extends LabBase {
  family: "hld";
  allowedComponents: ComponentKind[];
  startingBoard?: Board;
  scenario: string;
  levels: LabLevel[];
}

export interface DbLabSpec extends LabBase {
  family: "db";
  startingDbml: string;
  query: string;
}

export type LabSpec = HldLabSpec | DbLabSpec;

function validateBoard(board: Board, allowed: ComponentKind[]): string[] {
  const problems: string[] = [];
  const byId = new Map<string, BoardNode>();
  for (const node of board.nodes) {
    byId.set(node.id, node);
    if (!allowed.includes(node.kind)) {
      problems.push(`startingBoard node "${node.id}" uses ${node.kind}, which is not in allowedComponents`);
    }
  }
  for (const edge of board.edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from) problems.push(`startingBoard edge from unknown node "${edge.from}"`);
    if (!to) problems.push(`startingBoard edge to unknown node "${edge.to}"`);
    if (from && to && !canConnect(from.kind, to.kind)) {
      problems.push(`startingBoard edge ${from.kind} -> ${to.kind} cannot connect: no matching port`);
    }
  }
  return problems;
}

export function validateLabSpec(spec: LabSpec): string[] {
  const problems: string[] = [];
  if (spec.limits.length <= 20) problems.push("limits must be longer than 20 characters");
  if (spec.title.trim().length === 0) problems.push("title must not be empty");
  if (spec.purpose.trim().length === 0) problems.push("purpose must not be empty");

  if (spec.family === "hld") {
    for (const kind of spec.allowedComponents) {
      if (!isComponentKind(kind)) problems.push(`allowedComponents names "${kind}", which is not a component kind`);
    }
    if (spec.levels.length === 0) problems.push("an hld lab needs at least one level");
    if (spec.startingBoard) problems.push(...validateBoard(spec.startingBoard, spec.allowedComponents));
  } else {
    if (spec.startingDbml.trim().length === 0) problems.push("a db lab needs startingDbml");
    if (spec.query.trim().length === 0) problems.push("a db lab needs a query");
  }

  return problems;
}
