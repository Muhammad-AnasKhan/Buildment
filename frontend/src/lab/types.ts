// The LabSpec data contract. An author writes a LabSpec in a lab's data.ts; the
// registry, the runtime and the validator all read it. validateLabSpec is the
// runtime guard the registry test runs over every registered lab.

import type { ComponentKind, Role } from "./catalog";
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

// ---- challenge: the checks a visual lab's Run puts the design through ----------

/** Something that goes wrong in a scenario. */
export type Fault =
  /** One instance of the first component with this role dies; a fleet of one dies whole. */
  | { type: "lose-instance"; role: Role }
  /** Every component with this role goes down. */
  | { type: "down"; role: Role };

export interface ChallengeScenario {
  id: string;
  /** Short name, shown on the run strip: "The cache dies". */
  title: string;
  /** One line shown while this phase plays. */
  story: string;
  faults: Fault[];
}

export type CheckMetric = "p99" | "capacity" | "served" | "availability" | "cost";

interface CheckBase {
  id: string;
  kind: "functional" | "non-functional";
  label: string;
}

export type CheckDef =
  /** A functional check: a request can travel client -> ... -> the next role, in order. */
  | (CheckBase & { type: "path"; chain: Role[]; target: string })
  /** A measured check: one number from one scenario against a limit. */
  | (CheckBase & { type: "metric"; scenario: string; metric: CheckMetric; op: "<=" | ">="; value: number })
  /** Work queued while its consumer is down must be fully counted once it is back. */
  | (CheckBase & { type: "drain"; outageSeconds: number; maxDrainSeconds: number });

export interface ChallengeDef {
  /** Requests a second at the busiest moment; every scenario runs at this load. */
  peakLoad: number;
  scenarios: ChallengeScenario[];
  checks: CheckDef[];
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
  /** A visual challenge: functional and non-functional checks and the scenarios that test them. */
  challenge?: ChallengeDef;
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

export function validateChallenge(challenge: ChallengeDef): string[] {
  const problems: string[] = [];
  const scenarioIds = new Set(["steady"]);
  for (const s of challenge.scenarios) {
    if (scenarioIds.has(s.id)) problems.push(`scenario id "${s.id}" is repeated or reserved`);
    scenarioIds.add(s.id);
    if (s.faults.length === 0) problems.push(`scenario "${s.id}" has no fault`);
  }
  const checkIds = new Set<string>();
  for (const c of challenge.checks) {
    if (checkIds.has(c.id)) problems.push(`check id "${c.id}" is repeated`);
    checkIds.add(c.id);
    if (c.type === "metric" && !scenarioIds.has(c.scenario)) problems.push(`check "${c.id}" names unknown scenario "${c.scenario}"`);
    if (c.type === "metric" && !Number.isFinite(c.value)) problems.push(`check "${c.id}" needs a finite value`);
    if (c.type === "path" && c.chain.length < 2) problems.push(`check "${c.id}" needs a chain of at least two roles`);
  }
  if (!(challenge.peakLoad > 0)) problems.push("challenge peakLoad must be positive");
  if (!challenge.checks.some((c) => c.kind === "functional")) problems.push("a challenge needs at least one functional check");
  if (!challenge.checks.some((c) => c.kind === "non-functional")) problems.push("a challenge needs at least one non-functional check");
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
    if (spec.challenge) problems.push(...validateChallenge(spec.challenge));
  } else {
    if (spec.startingDbml.trim().length === 0) problems.push("a db lab needs startingDbml");
    if (spec.query.trim().length === 0) problems.push("a db lab needs a query");
  }

  return problems;
}
