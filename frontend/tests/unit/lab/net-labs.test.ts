import { describe, expect, it } from "vitest";
import { runChecks } from "@buildment/learning-ui/labs/net/checks";
import { runCommand } from "@buildment/learning-ui/labs/net/commands";
import { buildWorld } from "@buildment/learning-ui/labs/net/model";
import { checkPlan } from "@buildment/learning-ui/labs/net/plan";
import { validateTopology } from "@buildment/learning-ui/labs/net/validate";
import { netExploreOffice } from "@buildment/learning-ui/labs/net-explore-office/data";
import { netLabFixOffice } from "@buildment/learning-ui/labs/net-lab-fix-office/data";
import { netLabPlanSchool } from "@buildment/learning-ui/labs/net-lab-plan-school/data";
import { labView } from "@buildment/learning-ui/labs/Lab";
import type { NetTopology } from "@buildment/learning-ui/labs/net/model";

describe("net-lab-fix-office", () => {
  const topology = netLabFixOffice.topology as NetTopology;
  const checks = netLabFixOffice.checks ?? [];

  it("starts with every check failing", () => {
    expect(runChecks(buildWorld(topology), checks).map((r) => r.pass)).toEqual([false, false, false, false]);
  });

  it("each fault shows its own symptom", () => {
    const world = buildWorld(topology);
    runCommand(world, "pc1", "ping -c 1 10.2.0.10");
    expect(runCommand(world, "pc1", "ip neigh").output).toBe("10.1.0.254 dev eth0 FAILED");
    expect(runCommand(world, "pc2", "ping -c 1 10.2.0.10").output).toBe("ping: connect: Network is unreachable");
    expect(runCommand(world, "server", "ping -c 1 10.1.0.10").output).toContain("From 10.2.0.1 icmp_seq=1 Destination Net Unreachable");
  });

  it("passes every check once the three faults are fixed with commands", () => {
    const world = buildWorld(topology);
    const fix = [
      ["pc1", "ip route del default"],
      ["pc1", "ip route add default via 10.1.0.1"],
      ["pc2", "ip addr del 10.1.0.20/29 dev eth0"],
      ["pc2", "ip addr add 10.1.0.20/24 dev eth0"],
      ["pc2", "ip route add default via 10.1.0.1"],
      ["r2", "ip route add 10.1.0.0/24 via 10.0.0.1"],
    ];
    for (const [dev, cmd] of fix) runCommand(world, dev, cmd);
    expect(runChecks(world, checks).every((r) => r.pass)).toBe(true);
    expect(runCommand(world, "pc1", "curl http://10.2.0.10/").output).toBe("<h1>Office intranet</h1>");
  });

  it("checking does not change what the learner sees", () => {
    const world = buildWorld(topology);
    runChecks(world, checks);
    expect(world.devices.pc1.neigh).toEqual([]);
  });
});

describe("net-explore-office", () => {
  const world = buildWorld(netExploreOffice.topology as NetTopology);

  it("traces through both routers to the server", () => {
    const hops = runCommand(world, "laptop", "traceroute -n 203.0.113.80").output.split("\n").slice(1).map((l) => l.trim().split(/\s+/)[1]);
    expect(hops).toEqual(["192.168.1.1", "198.51.100.1", "203.0.113.80"]);
  });

  it("the phone is refused on loopback and served on 0.0.0.0", () => {
    expect(runCommand(world, "phone", "curl http://192.168.1.23:8000/").output).toMatch(/^curl: \(7\)/);
    expect(runCommand(world, "phone", "curl http://192.168.1.23:8001/").output).toBe("dev server on every address");
  });
});

describe("net-lab-plan-school", () => {
  const plan = netLabPlanSchool.plan!;
  const solution = {
    guest: "10.20.0.0/24",
    staff: "10.20.1.0/24",
    "lab-a": "10.20.2.0/25",
    "lab-b": "10.20.2.128/25",
    "lab-c": "10.20.3.0/26",
    printers: "10.20.3.64/27",
  };

  it("accepts a plan that fits", () => {
    const result = checkPlan(plan, solution);
    expect(result.allPass).toBe(true);
    expect(result.free).toBe(160);
  });

  it("explains a block that does not start where its size starts", () => {
    const r = checkPlan(plan, { ...solution, staff: "10.20.0.128/24" }).needs.find((n) => n.id === "staff");
    expect(r?.problems[0]).toBe("10.20.0.128 is not where a /24 starts. The block that holds it starts at 10.20.0.0/24.");
  });

  it("refuses a block that is too small, outside, or overlapping", () => {
    const result = checkPlan(plan, { ...solution, "lab-c": "10.20.3.0/27", printers: "10.20.8.0/27", "lab-b": "10.20.2.0/25" });
    const by = (id: string) => result.needs.find((n) => n.id === id)?.problems.join(" ");
    expect(by("lab-c")).toContain("needs 60");
    expect(by("printers")).toContain("not inside 10.20.0.0/22");
    expect(by("lab-b")).toContain("overlaps the block for Lab A");
  });
});

describe("net validation and views", () => {
  it("rejects a real public address and a cable to nowhere", () => {
    const problems = validateTopology({
      devices: [{ id: "a", kind: "host", label: "A", x: 0, y: 0, ifaces: [{ name: "eth0", addr: "8.8.8.8/24" }] }],
      links: [{ a: "a.eth0", b: "b.eth0" }],
    });
    expect(problems.join("\n")).toMatch(/public addresses must come from/);
    expect(problems.join("\n")).toMatch(/b\.eth0" names no such device interface/);
  });

  it("maps net labs to the board or the planner", () => {
    expect(labView(netLabFixOffice)).toBe("net-board");
    expect(labView(netLabPlanSchool)).toBe("net-plan");
  });
});

describe("net lab solutions", () => {
  it("the fault and plan labs carry solutions the validator has proved", async () => {
    const { validateLabSpec } = await import("@buildment/learning-ui/labs/types");
    expect(netLabFixOffice.solution?.steps?.length).toBeGreaterThan(0);
    expect(netLabPlanSchool.solution?.blocks).toBeDefined();
    expect(validateLabSpec(netLabFixOffice)).toEqual([]);
    expect(validateLabSpec(netLabPlanSchool)).toEqual([]);
  });

  it("a solution that leaves a check failing is reported", async () => {
    const { validateSolution } = await import("@buildment/learning-ui/labs/net/validate");
    const steps = (netLabFixOffice.solution?.steps ?? []).filter((s) => s.device !== "r2");
    const problems = validateSolution({ summary: "partial", steps }, { topology: netLabFixOffice.topology, checks: netLabFixOffice.checks });
    expect(problems).toContain('after the solution, check "server-pc1" still fails');
  });

  it("a fault or plan lab without a solution is refused", async () => {
    const { validateLabSpec } = await import("@buildment/learning-ui/labs/types");
    expect(validateLabSpec({ ...netLabFixOffice, solution: undefined })).toContain("a fault lab needs a solution");
  });
});
