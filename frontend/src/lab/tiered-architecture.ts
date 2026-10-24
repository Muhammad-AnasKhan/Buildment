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
import { SIZE_CATALOG } from "@/lab/catalog";

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

export function runTieredModel(board: Board, load: number, targets: Targets): ModelResult {
  const cacheNode = board.nodes.find((n) => n.kind === "cache");
  const cacheHit = cacheNode ? num(cacheNode, "hitRate", 0) : 0;

  const tiers: TierLoad[] = [];
  let ceiling = Number.POSITIVE_INFINITY;
  let p50 = NETWORK_MS;
  let p99 = NETWORK_MS;
  let availability = 1;
  let cost = 0;

  for (const node of board.nodes) {
    if (!CAPACITY_KINDS.has(node.kind)) continue;
    const { vcpu, family, price } = tierOf(node);
    const units = unitsOf(node);
    const capacity = vcpu * (PER_VCPU[family] ?? 800) * units;
    const incoming = node.kind === "database" ? load * (1 - cacheHit) : load;
    const utilisation = capacity > 0 ? incoming / capacity : Number.POSITIVE_INFINITY;

    tiers.push({ id: node.id, kind: node.kind, capacity, utilisation });

    // Max load this tier can take, expressed back at the system's offered load.
    const loadFactor = incoming > 0 ? load / incoming : 1;
    ceiling = Math.min(ceiling, capacity * loadFactor);

    const service = SERVICE_MS[node.kind] ?? 5;
    const u = Math.min(utilisation, 0.985);
    p50 += service;
    p99 += service / (1 - u);

    const single = SINGLE_AVAIL[node.kind] ?? 0.99;
    availability *= 1 - Math.pow(1 - single, Math.max(units, 1));

    cost += price * units;
  }

  if (!Number.isFinite(ceiling)) ceiling = tiers.length > 0 ? 0 : 0;

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
    costPerHour: cost,
    tiers,
    pass,
    allPass: pass.rps && pass.p99 && pass.availability && pass.budget,
  };
}
