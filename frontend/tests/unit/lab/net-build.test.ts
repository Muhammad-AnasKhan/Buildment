import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { labView } from "@buildment/learning-ui/labs/Lab";
import { BuildBoard } from "@buildment/learning-ui/labs/net/BuildBoard";
import { evaluateGoals } from "@buildment/learning-ui/labs/net/build-goals";
import { cableLabels, cardRect, overlaps } from "@buildment/learning-ui/labs/net/build-layout";
import type { BuildState } from "@buildment/learning-ui/labs/net/build-model";
import {
  addCable,
  addDevice,
  checkAddress,
  checkGateway,
  checkRoute,
  emptyBuild,
  freeIface,
  moveDevice,
  removeCable,
  removeDevice,
  seedToState,
  toTopology,
  updateDevice,
} from "@buildment/learning-ui/labs/net/build-model";
import { runCommand } from "@buildment/learning-ui/labs/net/commands";
import { buildWorld } from "@buildment/learning-ui/labs/net/model";
import { validateTopology } from "@buildment/learning-ui/labs/net/validate";
import { netLabBuildTwoSubnets as lab } from "@buildment/learning-ui/labs/net-lab-build-two-subnets/data";
import { validateLabSpec } from "@buildment/learning-ui/labs/types";
import type { BuildPart } from "@buildment/learning-ui/labs/net/build-model";

const parts = lab.palette as BuildPart[];
const goals = lab.goals ?? [];
const names = Object.fromEntries(parts.map((p) => [p.id, p.label]));
const part = (id: string) => parts.find((p) => p.id === id) as BuildPart;

function place(state: BuildState, id: string, x = 100, y = 100): BuildState {
  const added = addDevice(state, part(id), x, y);
  if (!added) throw new Error(`could not place ${id}`);
  return added.state;
}

function cable(state: BuildState, from: string, to: string): BuildState {
  const made = addCable(state, from, to);
  if ("error" in made) throw new Error(made.error);
  return made.state;
}

const score = (state: BuildState) => evaluateGoals(buildWorld(toTopology(state, parts)), goals, names);

describe("canvas to topology", () => {
  it("names devices by part and numbers the parts that can be placed more than once", () => {
    let s = place(emptyBuild(), "switch");
    s = place(s, "switch");
    s = place(s, "laptop");
    expect(s.devices.map((d) => d.id)).toEqual(["switch1", "switch2", "laptop"]);
    expect(s.devices.map((d) => d.label)).toEqual(["Switch 1", "Switch 2", "Laptop"]);
  });

  it("refuses a part past its limit and reuses a freed number", () => {
    let s = place(emptyBuild(), "laptop");
    expect(addDevice(s, part("laptop"), 10, 10)).toBeNull();
    s = place(place(s, "switch"), "switch");
    s = removeDevice(s, "switch1");
    s = place(s, "switch");
    expect(s.devices.map((d) => d.id)).toEqual(["laptop", "switch2", "switch1"]);
  });

  it("plugs each cable into the next free interface or port", () => {
    let s = place(place(place(emptyBuild(), "laptop"), "router"), "server");
    s = cable(s, "laptop", "router");
    s = cable(s, "router", "server");
    expect(s.cables).toEqual([
      { a: "laptop.eth0", b: "router.eth0" },
      { a: "router.eth1", b: "server.eth0" },
    ]);
    let sw = place(place(place(emptyBuild(), "switch"), "laptop"), "router");
    sw = cable(sw, "laptop", "switch1");
    sw = cable(sw, "router", "switch1");
    expect(sw.cables).toEqual([
      { a: "laptop.eth0", b: "switch1.p1" },
      { a: "router.eth0", b: "switch1.p2" },
    ]);
  });

  it("frees an interface when its cable goes, and takes its cables when a device goes", () => {
    let s = place(place(place(emptyBuild(), "laptop"), "router"), "server");
    s = cable(cable(s, "laptop", "router"), "router", "server");
    s = removeCable(s, "laptop.eth0");
    expect(freeIface(s, s.devices[1])).toBe("eth0");
    s = removeDevice(s, "router");
    expect(s.cables).toEqual([]);
  });

  it("says why a cable cannot be drawn", () => {
    let s = place(place(emptyBuild(), "laptop"), "router");
    expect(addCable(s, "laptop", "laptop")).toEqual({ error: "A cable joins two different devices." });
    s = cable(s, "laptop", "router");
    expect(addCable(s, "router", "laptop")).toEqual({ error: "Router and Laptop are already cabled together." });
    let full = place(place(place(place(emptyBuild(), "switch"), "laptop"), "router"), "server");
    full = cable(cable(full, "laptop", "switch1"), "laptop", "router");
    expect(addCable(full, "laptop", "server")).toEqual({ error: "Laptop has no free interface." });
    expect(addCable(full, "server", "laptop")).toEqual({ error: "Laptop has no free interface." });
    expect(addCable(full, "server", "ghost")).toEqual({ error: "A cable needs two devices on the canvas." });
  });

  it("clamps a device inside the canvas", () => {
    const s = moveDevice(place(emptyBuild(), "laptop"), "laptop", -500, 9000);
    expect(s.devices[0].x).toBeGreaterThan(0);
    expect(s.devices[0].y).toBeLessThan(360);
  });

  it("builds a valid topology with a name per interface, links and the part's services", () => {
    const s = seedToState(lab.solution!.build!.seed, parts);
    const topology = toTopology(s, parts);
    expect(validateTopology(topology)).toEqual([]);
    expect(topology.links).toEqual([
      { a: "laptop.eth0", b: "router.eth0" },
      { a: "router.eth1", b: "server.eth0" },
    ]);
    const router = topology.devices.find((d) => d.id === "router");
    expect(router?.ifaces).toEqual([
      { name: "eth0", addr: "192.168.1.1/24" },
      { name: "eth1", addr: "203.0.113.1/24" },
    ]);
    expect(router?.forwarding).toBe(true);
    expect(topology.devices.find((d) => d.id === "laptop")?.routes).toEqual([{ dst: "default", via: "192.168.1.1" }]);
    expect(topology.devices.find((d) => d.id === "server")?.sockets?.[0].port).toBe(80);
  });

  it("gives a switch enough ports for its cables and leaves it without interfaces", () => {
    let s = place(emptyBuild(), "switch");
    s = updateDevice(s, "switch1", (d) => ({ ...d, ports: 2 }));
    s = cable(place(s, "laptop"), "laptop", "switch1");
    const sw = toTopology(s, parts).devices[0];
    expect(sw.ports).toBe(2);
    expect(sw.ifaces).toBeUndefined();
  });

  it("keeps an address on an unplugged interface and drops one the kernel would refuse", () => {
    let s = place(emptyBuild(), "laptop");
    s = updateDevice(s, "laptop", (d) => ({ ...d, addrs: { eth0: "192.168.1.23/24", eth1: "192.168.1.999/24" } }));
    const laptop = toTopology(s, parts).devices[0];
    expect(laptop.ifaces).toEqual([{ name: "eth0", addr: "192.168.1.23/24" }]);
  });

  it("ignores a gateway that is not on a connected network, as the kernel does", () => {
    let s = place(emptyBuild(), "laptop");
    s = updateDevice(s, "laptop", (d) => ({ ...d, addrs: { eth0: "192.168.1.23/24" }, gateway: "10.9.9.9" }));
    expect(toTopology(s, parts).devices[0].routes).toEqual([]);
    expect(checkGateway(s.devices[0], "10.9.9.9")).toBe("Error: Nexthop has invalid gateway.");
  });
});

describe("what the learner types", () => {
  it("reports kernel-style errors", () => {
    expect(checkAddress("")).toBeNull();
    expect(checkAddress("192.168.1.23/24")).toBeNull();
    expect(checkAddress("192.168.1.300/24")).toBe('Error: inet prefix is expected rather than "192.168.1.300/24".');
    expect(checkAddress("192.168.1.5")).toBe('Error: inet prefix is expected rather than "192.168.1.5".');
    expect(checkAddress("8.8.8.8/24")).toMatch(/only uses private/);
  });

  it("checks gateways and routes against the device's own networks", () => {
    let s = place(emptyBuild(), "router");
    s = updateDevice(s, "router", (d) => ({
      ...d,
      addrs: { eth0: "10.0.0.1/30" },
      gateway: "10.0.0.2",
      routes: [
        { dst: "10.2.0.0/24", via: "10.0.0.2" },
        { dst: "10.2.0.0/24", via: "10.0.0.2" },
        { dst: "nonsense", via: "10.0.0.2" },
        { dst: "10.3.0.0/24", via: "" },
        { dst: "default", via: "10.0.0.2" },
      ],
    }));
    const d = s.devices[0];
    expect(checkGateway(d, "abc")).toBe('Error: inet address is expected rather than "abc".');
    expect(checkRoute(d, 0)).toBeNull();
    expect(checkRoute(d, 1)).toBe("RTNETLINK answers: File exists");
    expect(checkRoute(d, 2)).toBe('Error: inet prefix is expected rather than "nonsense".');
    expect(checkRoute(d, 3)).toBe('Error: either "dev" is required, or "via" is missing.');
    expect(checkRoute(d, 4)).toBe("RTNETLINK answers: File exists");
    expect(toTopology(s, parts).devices[0].routes).toEqual([
      { dst: "default", via: "10.0.0.2" },
      { dst: "10.2.0.0/24", via: "10.0.0.2" },
    ]);
  });
});

describe("net-lab-build-two-subnets", () => {
  const solution = lab.solution?.build;

  it("passes the lab data guard", () => {
    expect(validateLabSpec(lab)).toEqual([]);
    expect(labView(lab)).toBe("net-build");
  });

  it("passes every goal when the solution is built, with a reason for each", () => {
    const s = seedToState(solution!.seed, parts);
    const results = score(s);
    expect(results.map((r) => r.pass)).toEqual(goals.map(() => true));
    expect(results.find((r) => r.id === "laptop-trace")?.reason).toBe("traceroute lists 192.168.1.1, then 203.0.113.80.");
  });

  it("runs the same network in the terminal", () => {
    const world = buildWorld(toTopology(seedToState(solution!.seed, parts), parts));
    expect(runCommand(world, "laptop", "ping -c 1 203.0.113.80").output).toContain("1 received");
    expect(runCommand(world, "laptop", "traceroute -n 203.0.113.80").output).toContain("192.168.1.1");
    expect(runCommand(world, "laptop", "curl http://203.0.113.80/").output).toBe("<h1>Hello from the server</h1>");
  });

  it("has a why for every solution step", () => {
    expect(solution!.steps.length).toBeGreaterThan(3);
    for (const step of solution!.steps) {
      expect(step.text.trim()).not.toBe("");
      expect(step.why.trim()).not.toBe("");
    }
  });

  it("fails every goal on an empty canvas, and says what to add", () => {
    const results = score(emptyBuild());
    expect(results.every((r) => !r.pass)).toBe(true);
    expect(results.find((r) => r.id === "laptop-server")?.reason).toBe("Add the Laptop to the canvas.");
    expect(results.find((r) => r.id === "server-laptop")?.reason).toBe("Add the Server to the canvas.");
    expect(results.find((r) => r.id === "laptop-subnet")?.reason).toBe("Add the Laptop to the canvas.");
  });

  it("explains each gap on the way to a working network", () => {
    let s = place(place(place(emptyBuild(), "laptop"), "router"), "server");
    // No addresses yet.
    expect(score(s).find((r) => r.id === "laptop-server")?.reason).toBe("The Laptop has no address yet. Select it and set one on its interface.");
    expect(score(s).find((r) => r.id === "server-laptop")?.reason).toBe("The Laptop has no address yet.");

    // Addressed but not cabled.
    s = updateDevice(s, "laptop", (d) => ({ ...d, addrs: { eth0: "192.168.1.23/24" }, gateway: "" }));
    s = updateDevice(s, "server", (d) => ({ ...d, addrs: { eth0: "203.0.113.80/24" } }));
    expect(score(s).find((r) => r.id === "laptop-server")?.reason).toBe("The Laptop has no route to 203.0.113.80. Give it an address on the same network, or a default gateway.");

    // A gateway, but the cable is missing.
    s = updateDevice(s, "laptop", (d) => ({ ...d, addrs: { eth0: "192.168.1.23/24" } }));
    s = updateDevice(s, "router", (d) => ({ ...d, addrs: { eth0: "192.168.1.1/24", eth1: "203.0.113.1/24" } }));
    s = updateDevice(s, "laptop", (d) => ({ ...d, gateway: "192.168.1.1" }));
    expect(score(s).find((r) => r.id === "laptop-server")?.reason).toBe("The Laptop sends 203.0.113.80 out of eth0, but nothing is plugged into eth0. Draw a cable from it.");

    // Cabled, but the server cannot answer.
    s = cable(cable(s, "laptop", "router"), "router", "server");
    let results = score(s);
    expect(results.find((r) => r.id === "laptop-server")?.pass).toBe(false);
    expect(results.find((r) => r.id === "laptop-server")?.reason).toMatch(/Server has no route that matches 192\.168\.1\.23/);
    expect(results.find((r) => r.id === "laptop-subnet")?.pass).toBe(true);

    // The router drops what it should forward.
    s = updateDevice(s, "server", (d) => ({ ...d, gateway: "203.0.113.1" }));
    expect(score(s).every((r) => r.pass)).toBe(true);
    s = updateDevice(s, "router", (d) => ({ ...d, forwarding: false }));
    results = score(s);
    expect(results.find((r) => r.id === "laptop-server")?.reason).toMatch(/Router is not 203\.0\.113\.80 and does not forward/);
    expect(results.find((r) => r.id === "laptop-trace")?.pass).toBe(false);
  });

  it("fails the traceroute goal when the server is on the laptop's own subnet", () => {
    let s = place(place(emptyBuild(), "laptop"), "server");
    s = updateDevice(s, "laptop", (d) => ({ ...d, addrs: { eth0: "203.0.113.5/24" } }));
    s = updateDevice(s, "server", (d) => ({ ...d, addrs: { eth0: "203.0.113.80/24" } }));
    s = cable(s, "laptop", "server");
    const results = score(s);
    expect(results.find((r) => r.id === "laptop-server")?.pass).toBe(true);
    const trace = results.find((r) => r.id === "laptop-trace");
    expect(trace?.pass).toBe(false);
    expect(trace?.reason).toBe("traceroute -n 203.0.113.80 lists 203.0.113.80, but this goal wants the Router, then 203.0.113.80.");
    expect(results.find((r) => r.id === "laptop-subnet")?.reason).toBe("The Laptop is 203.0.113.5, which is outside 192.168.1.0/24.");
  });

  it("names a wrong server address", () => {
    let s = seedToState(solution!.seed, parts);
    s = updateDevice(s, "server", (d) => ({ ...d, addrs: { eth0: "203.0.113.81/24" } }));
    const results = score(s);
    expect(results.find((r) => r.id === "laptop-server")?.reason).toBe("Nothing on the canvas has the address 203.0.113.80.");
    expect(results.find((r) => r.id === "server-subnet")?.pass).toBe(false);
  });

  it("guards its own data", () => {
    const broken = { ...lab, goals: [{ id: "x", label: "x", kind: "ping" as const, from: "switch", to: "nobody" }] };
    const problems = validateLabSpec(broken);
    expect(problems.some((p) => p.includes('starts from "switch"'))).toBe(true);
    expect(problems.some((p) => p.includes('target "nobody"'))).toBe(true);
    const noSolution = { ...lab, solution: undefined };
    expect(validateLabSpec(noSolution)).toContain("a build lab needs a solution");
  });
});

describe("cable address labels", () => {
  const solved = seedToState(lab.solution!.build!.seed, parts);

  function expectClear(state: BuildState) {
    const labels = cableLabels(state);
    expect(labels).toHaveLength(state.cables.length * 2);
    for (const l of labels) {
      for (const d of state.devices) expect(overlaps(l, cardRect(d)), `${l.end} label over ${d.id}`).toBe(false);
      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.x + l.w).toBeLessThanOrEqual(640);
    }
    labels.forEach((l, i) => labels.slice(i + 1).forEach((m) => expect(overlaps(l, m), `${l.end} over ${m.end}`).toBe(false)));
    return labels;
  }

  it("keeps every label of the solution clear of every card, with its address", () => {
    const labels = expectClear(solved);
    expect(labels.map((l) => l.addr)).toEqual(["192.168.1.23/24", "192.168.1.1/24", "203.0.113.1/24", "203.0.113.80/24"]);
  });

  it("stays clear when the devices are stacked, close together or crowded", () => {
    const moved = (a: [number, number], b: [number, number], c: [number, number]) => {
      let s = moveDevice(solved, "laptop", ...a);
      s = moveDevice(s, "router", ...b);
      return moveDevice(s, "server", ...c);
    };
    expectClear(moved([90, 60], [90, 290], [300, 180]));
    expectClear(moved([90, 180], [250, 180], [410, 180]));
    expectClear(moved([90, 180], [210, 230], [330, 280]));
  });

  it("moves labels off the cable, clear of the cards, when the cards nearly touch", () => {
    const tight = moveDevice(moveDevice(solved, "laptop", 200, 180), "router", 330, 180);
    const labels = expectClear(tight);
    expect(labels.every((l) => l.iface.startsWith("eth"))).toBe(true);
  });
});

describe("BuildBoard server render", () => {
  const html = renderToString(createElement(BuildBoard, { spec: lab }));

  it("renders the palette, the canvas, the goals and the run button", () => {
    for (const label of ["Laptop", "Server", "Router", "Switch"]) expect(html).toContain(label);
    expect(html).toContain("0 of 1 placed");
    expect(html).toContain("0 of 2 placed");
    expect(html).toContain("Network canvas");
    expect(html).toContain("Run the network");
    expect(html).toContain("Press Run to check");
    expect(html).toContain("The laptop pings the server");
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("undefined");
  });

  it("offers the solution behind a button, not up front", () => {
    expect(html).toContain("Show a solution");
    expect(html).not.toContain("Put this on the canvas");
  });

  it("labels every part button and tells keyboard users how to place", () => {
    expect(html).toContain("Laptop, host, 0 of 1 placed");
    expect(html).toContain("Press Enter to pick it up");
  });
});
