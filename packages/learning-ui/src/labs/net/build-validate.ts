// The guard for a build lab's data, run by the registry test over every
// registered lab. Like the other net guards it reports problems rather than
// throwing, and it proves the solution by running it through the engine.

import type { NetLabSpec } from "../types";
import { evaluateGoals } from "./build-goals";
import type { BuildPart, BuildSeed } from "./build-model";
import { checkAddress, checkGateway, checkRoute, partById, seedToState, toTopology } from "./build-model";
import { buildWorld } from "./model";
import { parseCidr, parseIp } from "./ip";
import { validateTopology } from "./validate";

const KINDS = new Set(["host", "router", "switch"]);

export function validateBuildLab(spec: NetLabSpec): string[] {
  const problems: string[] = [];
  const parts = spec.palette ?? [];
  const goals = spec.goals ?? [];
  if (parts.length === 0) return ["a build lab needs a palette"];
  if (goals.length === 0) problems.push("a build lab needs goals");

  const ids = new Set<string>();
  for (const part of parts) {
    if (ids.has(part.id)) problems.push(`palette id "${part.id}" is used twice`);
    ids.add(part.id);
    if (!/^[a-z][a-z0-9-]*$/.test(part.id)) problems.push(`palette id "${part.id}" must be lower case letters, digits and dashes (it becomes the shell prompt)`);
    if (!KINDS.has(part.kind)) problems.push(`palette "${part.id}" has unknown kind "${part.kind}"`);
    if (!Number.isInteger(part.max) || part.max < 1 || part.max > 8) problems.push(`palette "${part.id}" needs a max from 1 to 8`);
    if (part.label.trim().length === 0) problems.push(`palette "${part.id}" needs a label`);
  }

  // A goal can only name a part that is placed at most once.
  const roles = new Set(parts.filter((p) => p.max === 1).map((p) => p.id));
  const shells = new Set(parts.filter((p) => p.max === 1 && p.kind !== "switch").map((p) => p.id));
  const known = (ref: string) => roles.has(ref) || parseIp(ref) !== null;
  const goalIds = new Set<string>();
  for (const goal of goals) {
    if (goalIds.has(goal.id)) problems.push(`goal id "${goal.id}" is used twice`);
    goalIds.add(goal.id);
    if (goal.label.trim().length === 0) problems.push(`goal "${goal.id}" needs a label`);
    if (goal.kind === "address") {
      if (!shells.has(goal.device)) problems.push(`goal "${goal.id}" names "${goal.device}", which is not a single host or router in the palette`);
      if (!parseCidr(goal.block)) problems.push(`goal "${goal.id}" block "${goal.block}" is not a block`);
      continue;
    }
    if (!shells.has(goal.from)) problems.push(`goal "${goal.id}" starts from "${goal.from}", which is not a single host or router in the palette`);
    if (!known(goal.to)) problems.push(`goal "${goal.id}" target "${goal.to}" is neither a palette id placed once nor an address`);
    if (goal.kind === "path") {
      if (goal.hops.length === 0) problems.push(`goal "${goal.id}" needs at least one hop`);
      for (const hop of goal.hops) if (!known(hop)) problems.push(`goal "${goal.id}" hop "${hop}" is neither a palette id placed once nor an address`);
    }
  }
  for (const part of parts) {
    for (const s of part.sockets ?? []) {
      if (parseIp(s.addr) === null) problems.push(`palette "${part.id}" socket address "${s.addr}" is not an address`);
    }
  }

  const solution = spec.solution;
  if (!solution) return [...problems, "a build lab needs a solution"];
  if (solution.summary.trim().length === 0) problems.push("a solution needs a summary");
  const build = solution.build;
  if (!build) return [...problems, "a build lab's solution needs a finished canvas (solution.build)"];
  if (build.steps.length === 0) problems.push("a build solution needs steps");
  build.steps.forEach((step, i) => {
    if (!step.text.trim() || !step.why.trim()) problems.push(`solution step ${i + 1} needs a text and a why`);
  });
  problems.push(...validateSeed(build.seed, parts));
  if (problems.length > 0) return problems;

  const state = seedToState(build.seed, parts);
  const world = buildWorld(toTopology(state, parts));
  const names = Object.fromEntries(parts.map((p) => [p.id, p.label]));
  evaluateGoals(world, goals, names).forEach((r, i) => {
    if (!r.pass) problems.push(`after the solution, goal "${goals[i].id}" still fails: ${r.reason}`);
  });
  return problems;
}

function validateSeed(seed: BuildSeed, parts: BuildPart[]): string[] {
  const problems: string[] = [];
  for (const s of seed.devices) {
    if (!partById(parts, s.part)) problems.push(`the solution places "${s.part}", which is not in the palette`);
  }
  if (problems.length > 0) return problems;
  const state = seedToState(seed, parts);
  if (state.devices.length !== seed.devices.length) problems.push("the solution places more of a part than its max allows");
  for (const d of state.devices) {
    for (const [iface, text] of Object.entries(d.addrs)) {
      const bad = checkAddress(text);
      if (bad) problems.push(`${d.id}.${iface} address "${text}": ${bad}`);
    }
    const gw = checkGateway(d, d.gateway);
    if (gw) problems.push(`${d.id} gateway "${d.gateway}": ${gw}`);
    d.routes.forEach((r, i) => {
      const bad = checkRoute(d, i);
      if (bad) problems.push(`${d.id} route "${r.dst}": ${bad}`);
    });
  }
  // The topology check also catches a cable end that names no device or interface.
  problems.push(...validateTopology(toTopology(state, parts)));
  return problems;
}
