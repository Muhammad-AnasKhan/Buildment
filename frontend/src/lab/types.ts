// The LabSpec data contract. An author writes a LabSpec in a lab's data.ts; the
// registry, the runtime and the validator all read it. validateLabSpec is the
// runtime guard the registry test runs over every registered lab.

import type { ComponentKind } from "./catalog";
import { canConnect, isComponentKind } from "./catalog";
import type { NetCheck } from "./net/checks";
import type { NetTopology } from "./net/model";
import type { PlanSpec } from "./net/plan";
import { validateChecks, validatePlan, validateSolution, validateTopology } from "./net/validate";

export type LabFamily = "hld" | "db" | "net";

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

export interface NetSolutionStep {
  device: string;
  command: string;
  // Why this command, in plain words: what was wrong and what it changes.
  why: string;
}

// Kept hidden until the learner asks for it. A fault lab's steps must pass
// every check from the starting network, and a plan's blocks must all fit;
// the validator runs both.
export interface NetSolution {
  summary: string;
  steps?: NetSolutionStep[];
  blocks?: Record<string, { block: string; why: string }>;
}

// A network lab: explore a topology from its devices' terminals, fix a broken
// one until every check passes, or plan blocks inside one parent block.
export interface NetLabSpec extends LabBase {
  family: "net";
  mode: "explore" | "fault" | "plan";
  topology?: NetTopology;
  checks?: NetCheck[];
  plan?: PlanSpec;
  // The device whose terminal opens first.
  startDevice?: string;
  // What the learner is asked to do, shown above the board.
  tasks?: string[];
  // One-tap commands under the terminal, run on the selected device.
  suggested?: string[];
  solution?: NetSolution;
}

export type LabSpec = HldLabSpec | DbLabSpec | NetLabSpec;

function validateNetLab(spec: NetLabSpec): string[] {
  const problems: string[] = [];
  if (spec.mode !== "explore" && !spec.solution) problems.push(`a ${spec.mode} lab needs a solution`);
  if (spec.mode === "plan") {
    if (!spec.plan) problems.push("a plan lab needs a plan");
    else problems.push(...validatePlan(spec.plan));
    if (spec.plan && spec.solution) problems.push(...validateSolution(spec.solution, { plan: spec.plan }));
    return problems;
  }
  if (!spec.topology) return ["an explore or fault lab needs a topology"];
  problems.push(...validateTopology(spec.topology));
  if (spec.checks) problems.push(...validateChecks(spec.topology, spec.checks));
  if (spec.mode === "fault" && !spec.checks?.length) problems.push("a fault lab needs checks");
  if (spec.solution) problems.push(...validateSolution(spec.solution, { topology: spec.topology, checks: spec.checks }));
  if (spec.startDevice && !spec.topology.devices.some((d) => d.id === spec.startDevice)) {
    problems.push(`startDevice "${spec.startDevice}" is not a device`);
  }
  return problems;
}

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
    if (from && to) {
      if (!isComponentKind(from.kind) || !isComponentKind(to.kind)) {
        // An unknown kind is already reported by the node loop; skip canConnect
        // so the validator reports rather than throwing on a bad catalog lookup.
      } else if (!canConnect(from.kind, to.kind)) {
        problems.push(`startingBoard edge ${from.kind} -> ${to.kind} cannot connect: no matching port`);
      }
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
  } else if (spec.family === "net") {
    problems.push(...validateNetLab(spec));
  } else {
    if (spec.startingDbml.trim().length === 0) problems.push("a db lab needs startingDbml");
    if (spec.query.trim().length === 0) problems.push("a db lab needs a query");
  }

  return problems;
}
