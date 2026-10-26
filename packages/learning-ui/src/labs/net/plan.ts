// Plan mode: the learner splits one block into smaller blocks, one per group
// of devices, and the checks say whether each block is a real block start,
// sits inside the parent, is big enough and overlaps nothing else.

import type { Cidr } from "./ip";
import { contains, formatIp, formatNetwork, maskOf, networkOf, overlaps, parseCidr, usableHosts } from "./ip";

export interface PlanNeed {
  id: string;
  label: string;
  hosts: number;
}

export interface PlanSpec {
  parent: string;
  needs: PlanNeed[];
}

export interface PlanNeedResult {
  id: string;
  ok: boolean;
  problems: string[];
  block?: Cidr;
}

export interface PlanResult {
  needs: PlanNeedResult[];
  allPass: boolean;
  // Addresses of the parent block left unassigned.
  free: number;
}

export function smallestPrefixFor(hosts: number): number {
  for (let prefix = 30; prefix >= 0; prefix -= 1) {
    if (usableHosts(prefix) >= hosts) return prefix;
  }
  return 0;
}

export function checkPlan(spec: PlanSpec, answers: Record<string, string>): PlanResult {
  const parent = parseCidr(spec.parent) as Cidr;
  const parsed = new Map<string, Cidr>();
  const needs: PlanNeedResult[] = spec.needs.map((need) => {
    const text = (answers[need.id] ?? "").trim();
    if (!text) return { id: need.id, ok: false, problems: ["No block yet."] };
    const block = parseCidr(text);
    if (!block) return { id: need.id, ok: false, problems: [`"${text}" is not written as address/prefix, for example 10.20.0.0/26.`] };
    const problems: string[] = [];
    if (networkOf(block) !== block.addr) {
      problems.push(`${formatIp(block.addr)} is not where a /${block.prefix} starts. The block that holds it starts at ${formatNetwork(block)}.`);
    }
    if (block.prefix < parent.prefix || !contains(parent, block.addr)) {
      problems.push(`It is not inside ${spec.parent}.`);
    }
    if (usableHosts(block.prefix) < need.hosts) {
      problems.push(`A /${block.prefix} has ${usableHosts(block.prefix)} usable addresses; ${need.label} needs ${need.hosts}.`);
    }
    parsed.set(need.id, { addr: networkOf(block), prefix: block.prefix });
    return { id: need.id, ok: problems.length === 0, problems, block };
  });
  for (const result of needs) {
    const mine = parsed.get(result.id);
    if (!mine) continue;
    for (const other of spec.needs) {
      if (other.id === result.id) continue;
      const theirs = parsed.get(other.id);
      if (theirs && overlaps(mine, theirs)) {
        result.problems.push(`It overlaps the block for ${other.label}.`);
        result.ok = false;
      }
    }
  }
  // Count each address once, even where two blocks overlap.
  const spans = [...parsed.values()]
    .filter((b) => b.prefix >= parent.prefix && contains(parent, b.addr))
    .map((b) => [b.addr, b.addr + 2 ** (32 - b.prefix)] as const)
    .sort((x, y) => x[0] - y[0]);
  let used = 0;
  let reached = -1;
  for (const [from, to] of spans) {
    const start = Math.max(from, reached);
    if (to > start) used += to - start;
    reached = Math.max(reached, to);
  }
  return { needs, allPass: needs.every((n) => n.ok), free: Math.max(0, 2 ** (32 - parent.prefix) - used) };
}

export function blockRange(block: Cidr): string {
  const first = networkOf(block);
  const last = (first | (~maskOf(block.prefix) >>> 0)) >>> 0;
  return `${formatIp(first)} to ${formatIp(last)}`;
}
