// The tiered-architecture model: the engine behind the HLD lab board. Pure and
// server-importable (no DOM, no React), so a graded lab can run it on the server.
// From a board and an offered load it computes, analytically, each tier's
// utilisation, the system capacity ceiling, p50/p99 latency (with the queueing
// knee), availability, and cost, then checks them against the lab's targets.
//
// Numbers are illustrative. The rules below are stated so a "how this is
// calculated" panel can show them.

import type { Board, BoardNode } from "@/lab/types";
import type { ComponentKind } from "@/lab/catalog";
import { COMPONENT_CATALOG, SIZE_CATALOG } from "@/lab/catalog";

const PER_VCPU: Record<string, number> = { general: 800, compute: 1200, memory: 600 };
const NETWORK_MS = 10;

const SERVICE_MS: Partial<Record<ComponentKind, number>> = {
  "load-balancer": 2,
  "api-gateway": 3,
  "app-server": 20,
  cache: 1,
  database: 8,
  worker: 15,
  cdn: 1,
  "object-storage": 5,
};

const SINGLE_AVAIL: Partial<Record<ComponentKind, number>> = {
  "load-balancer": 0.9995,
  "api-gateway": 0.9995,
  "app-server": 0.99,
  cache: 0.999,
  database: 0.999,
  worker: 0.99,
  cdn: 0.9999,
  "object-storage": 0.9999,
};

const CAPACITY_KINDS = new Set<ComponentKind>([
  "load-balancer",
  "api-gateway",
  "app-server",
  "cache",
  "database",
  "worker",
  "object-storage",
]);

export interface TierLoad {
  id: string;
  kind: ComponentKind;
  capacity: number;
  utilisation: number;
  down: boolean;
  reachable: boolean;
}

export interface Targets {
  rps?: number;
  p99Ms?: number;
  availability?: number;
  budgetPerHour?: number;
}

export interface ModelResult {
  capacityCeiling: number;
  p50Ms: number;
  p99Ms: number;
  availability: number;
  costPerHour: number;
  tiers: TierLoad[];
  pass: { rps: boolean; p99: boolean; availability: boolean; budget: boolean };
  allPass: boolean;
  /** Why the design is broken, when a component is down or unlinked. */
  failure?: string;
}

function num(node: BoardNode, key: string, fallback: number): number {
  const v = node.props?.[key];
  return typeof v === "number" ? v : fallback;
}

function tierOf(node: BoardNode): { vcpu: number; family: string; price: number } {
  const id = node.props?.size;
  const tier = SIZE_CATALOG.find((t) => t.id === id) ?? SIZE_CATALOG[0];
  return { vcpu: tier.vcpu, family: tier.family, price: tier.pricePerHour };
}

function unitsOf(node: BoardNode): number {
  // load balancers scale by zones; databases by replicas; everything else by count.
  if (node.kind === "load-balancer") return num(node, "zones", 1);
  if (node.kind === "database") return num(node, "replicas", 1);
  return num(node, "count", 1);
}

const isDown = (node: BoardNode) => Boolean(node.props?.down);

/** Nodes a request can reach from any live client, following the links and skipping down nodes. */
function reachableFrom(board: Board): Set<string> {
  const byId = new Map(board.nodes.map((n) => [n.id, n]));
  const next = new Map<string, string[]>();
  for (const e of board.edges) next.set(e.from, [...(next.get(e.from) ?? []), e.to]);
  const seen = new Set<string>();
  const queue = board.nodes.filter((n) => n.kind === "client" && !isDown(n)).map((n) => n.id);
  for (const id of queue) seen.add(id);
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const to of next.get(id) ?? []) {
      const node = byId.get(to);
      if (node && !isDown(node) && !seen.has(to)) {
        seen.add(to);
        queue.push(to);
      }
    }
  }
  return seen;
}

/** Live links between reachable nodes, deduplicated, as parent to children and child to parents. */
function liveLinks(board: Board, reachable: Set<string>) {
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  for (const e of board.edges) {
    if (!reachable.has(e.from) || !reachable.has(e.to) || e.from === e.to) continue;
    const kids = children.get(e.from) ?? [];
    if (kids.includes(e.to)) continue;
    children.set(e.from, [...kids, e.to]);
    parents.set(e.to, [...(parents.get(e.to) ?? []), e.from]);
  }
  return { children, parents };
}

/** Reachable nodes in topological order (Kahn), so load and latency flow parent before child. */
function topoOrder(reachable: Set<string>, children: Map<string, string[]>, parents: Map<string, string[]>): string[] {
  const indegree = new Map([...reachable].map((id) => [id, (parents.get(id) ?? []).length]));
  const queue = [...reachable].filter((id) => indegree.get(id) === 0);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const kid of children.get(id) ?? []) {
      indegree.set(kid, (indegree.get(kid) ?? 1) - 1);
      if (indegree.get(kid) === 0) queue.push(kid);
    }
  }
  return order;
}

export function runTieredModel(board: Board, load: number, targets: Targets): ModelResult {
  const byId = new Map(board.nodes.map((n) => [n.id, n]));
  const reachable = reachableFrom(board);
  const { children, parents } = liveLinks(board, reachable);
  const order = topoOrder(reachable, children, parents);

  // Load enters at the live clients and flows down the links. Parallel children of
  // the same kind share it evenly; different kinds are different services and each
  // see the whole stream; a database next to a cache only sees the cache misses.
  const incoming = new Map<string, number>();
  const clients = order.filter((id) => byId.get(id)!.kind === "client");
  for (const id of clients) incoming.set(id, load / clients.length);
  for (const id of order) {
    const flow = incoming.get(id) ?? 0;
    const kids = children.get(id) ?? [];
    const cache = kids.map((k) => byId.get(k)!).find((n) => n.kind === "cache");
    const missRate = cache ? 1 - num(cache, "hitRate", 0) : 1;
    const byKind = new Map<ComponentKind, string[]>();
    for (const k of kids) byKind.set(byId.get(k)!.kind, [...(byKind.get(byId.get(k)!.kind) ?? []), k]);
    for (const [kind, ids] of byKind) {
      const share = kind === "database" ? flow * missRate : flow;
      for (const k of ids) incoming.set(k, (incoming.get(k) ?? 0) + share / ids.length);
    }
  }

  const tiers: TierLoad[] = [];
  const nodeAvail = new Map<ComponentKind, number[]>();
  let ceiling = Number.POSITIVE_INFINITY;
  let cost = 0;
  let failure: string | undefined;

  for (const node of board.nodes) {
    if (!CAPACITY_KINDS.has(node.kind)) continue;
    const { vcpu, family, price } = tierOf(node);
    const units = unitsOf(node);
    const down = isDown(node);
    const onPath = reachable.has(node.id);
    const capacity = down ? 0 : vcpu * (PER_VCPU[family] ?? 800) * units;
    const flow = onPath ? incoming.get(node.id) ?? 0 : 0;
    const utilisation = capacity > 0 ? flow / capacity : 0;

    tiers.push({ id: node.id, kind: node.kind, capacity, utilisation, down, reachable: onPath });
    cost += price * units; // placed hardware costs money whether or not it is serving
    if (!onPath) continue;

    // Max offered load before this tier saturates, expressed at the system's front door.
    if (flow > 0) ceiling = Math.min(ceiling, (capacity * load) / flow);
    const single = SINGLE_AVAIL[node.kind] ?? 0.99;
    nodeAvail.set(node.kind, [...(nodeAvail.get(node.kind) ?? []), 1 - Math.pow(1 - single, Math.max(units, 1))]);
  }

  // Latency is the slowest path from a client to the end of the line.
  const tierById = new Map(tiers.map((t) => [t.id, t]));
  const lat50 = new Map<string, number>();
  const lat99 = new Map<string, number>();
  for (const id of order) {
    const tier = tierById.get(id);
    const service = tier ? SERVICE_MS[tier.kind] ?? 5 : 0;
    const u = tier ? Math.min(tier.utilisation, 0.985) : 0;
    const before = parents.get(id) ?? [];
    lat50.set(id, service + Math.max(0, ...before.map((p) => lat50.get(p) ?? 0)));
    lat99.set(id, service / (1 - u) + Math.max(0, ...before.map((p) => lat99.get(p) ?? 0)));
  }
  const p50 = NETWORK_MS + Math.max(0, ...lat50.values());
  const p99 = NETWORK_MS + Math.max(0, ...lat99.values());

  // Parallel components of the same kind back each other up; the kinds are in series.
  let availability = 1;
  for (const parts of nodeAvail.values()) availability *= 1 - parts.reduce((all, a) => all * (1 - a), 1);

  // A placed database that requests cannot reach means nothing is served.
  const databases = board.nodes.filter((n) => n.kind === "database");
  if (databases.length > 0 && !databases.some((n) => reachable.has(n.id))) {
    ceiling = 0;
    availability = 0;
    const blocker = board.nodes.find((n) => isDown(n) && board.edges.some((e) => e.from === n.id || e.to === n.id));
    failure = blocker
      ? `${COMPONENT_CATALOG[blocker.kind].label} is down: requests through it fail.`
      : "The database is not linked into the request path.";
  }

  if (!Number.isFinite(ceiling)) ceiling = 0;

  const pass = {
    rps: targets.rps == null ? true : ceiling >= targets.rps,
    p99: targets.p99Ms == null ? true : p99 <= targets.p99Ms,
    availability: targets.availability == null ? true : availability >= targets.availability,
    budget: targets.budgetPerHour == null ? true : cost <= targets.budgetPerHour,
  };

  return {
    capacityCeiling: Math.round(ceiling),
    p50Ms: Math.round(p50),
    p99Ms: Math.round(p99),
    availability,
    failure,
    costPerHour: cost,
    tiers,
    pass,
    allPass: pass.rps && pass.p99 && pass.availability && pass.budget,
  };
}
