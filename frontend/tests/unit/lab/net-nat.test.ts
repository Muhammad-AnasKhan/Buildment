import { describe, expect, it } from "vitest";
import { runChecks } from "@buildment/learning-ui/labs/net/checks";
import { runCommand } from "@buildment/learning-ui/labs/net/commands";
import type { NetTopology } from "@buildment/learning-ui/labs/net/model";
import { buildWorld } from "@buildment/learning-ui/labs/net/model";
import { validateTopology } from "@buildment/learning-ui/labs/net/validate";

// Laptop and phone behind a home router, a server outside (the masquerade
// challenge's numbers).
function home(opts: { nat?: boolean; dnat?: boolean; forwarding?: boolean } = {}): NetTopology {
  const nat = opts.nat ?? true;
  return {
    devices: [
      {
        id: "laptop",
        kind: "host",
        label: "Laptop",
        x: 0,
        y: 0,
        ifaces: [{ name: "eth0", addr: "192.168.1.23/24" }],
        routes: [{ dst: "default", via: "192.168.1.1" }],
        sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 80, process: "busybox", reply: "laptop page" }],
      },
      { id: "phone", kind: "host", label: "Phone", x: 0, y: 0, ifaces: [{ name: "eth0", addr: "192.168.1.24/24" }], routes: [{ dst: "default", via: "192.168.1.1" }] },
      { id: "sw", kind: "switch", label: "Switch", x: 0, y: 0, ports: 4 },
      {
        id: "router",
        kind: "router",
        label: "Router",
        x: 0,
        y: 0,
        forwarding: opts.forwarding ?? true,
        ifaces: [
          { name: "lan", addr: "192.168.1.1/24" },
          { name: "wan", addr: "203.0.113.1/24" },
        ],
        nat: nat ? { masquerade: ["wan"], dnat: opts.dnat ? [{ in: "wan", proto: "tcp", port: 8080, to: "192.168.1.23:80" }] : [] } : undefined,
      },
      {
        id: "server",
        kind: "host",
        label: "Server",
        x: 0,
        y: 0,
        ifaces: [{ name: "eth0", addr: "203.0.113.80/24" }],
        sockets: [{ proto: "tcp", addr: "0.0.0.0", port: 8080, process: "busybox", reply: "the server sees you as {client}" }],
      },
    ],
    links: [
      { a: "laptop.eth0", b: "sw.p1" },
      { a: "phone.eth0", b: "sw.p2" },
      { a: "router.lan", b: "sw.p3" },
      { a: "router.wan", b: "server.eth0" },
    ],
  };
}

const run = (world: ReturnType<typeof buildWorld>, dev: string, line: string) => runCommand(world, dev, line).output;

describe("masquerade", () => {
  it("rewrites the source address and keeps the port when nothing clashes", () => {
    const world = buildWorld(home());
    expect(run(world, "laptop", "curl --local-port 41000 http://203.0.113.80:8080/")).toBe("the server sees you as 203.0.113.1:41000");
  });

  it("gives the second client a new port when both used the same one", () => {
    const world = buildWorld(home());
    run(world, "laptop", "curl --local-port 41000 http://203.0.113.80:8080/");
    const seen = run(world, "phone", "curl --local-port 41000 http://203.0.113.80:8080/");
    expect(seen).toMatch(/^the server sees you as 203\.0\.113\.1:\d+$/);
    const port = Number(seen.split(":")[1]);
    expect(port).not.toBe(41000);
    const table = run(world, "router", "conntrack -L 2>/dev/null").split("\n");
    expect(table).toHaveLength(2);
    // the phone's line ends with the port the server saw, as in the recorded run
    expect(table[1]).toBe(
      `tcp      6 119 TIME_WAIT src=192.168.1.24 dst=203.0.113.80 sport=41000 dport=8080 src=203.0.113.80 dst=203.0.113.1 sport=8080 dport=${port} [ASSURED] mark=0 use=1`,
    );
  });

  it("without masquerade the server has no way back to a private address", () => {
    const world = buildWorld(home({ nat: false }));
    expect(run(world, "laptop", "ping -c 1 203.0.113.80")).toContain("1 packets transmitted, 0 received, 100% packet loss");
  });

  it("an nft masquerade rule typed on the router fixes it, and the ruleset prints as nft prints it", () => {
    const world = buildWorld(home({ nat: false }));
    expect(run(world, "router", "nft add table ip nat")).toBe("");
    expect(run(world, "router", "nft add chain ip nat postrouting { type nat hook postrouting priority srcnat \\; }")).toBe("");
    expect(run(world, "router", 'nft add rule ip nat postrouting oifname "wan" masquerade')).toBe("");
    expect(run(world, "router", "nft list ruleset")).toBe(
      ["table ip nat {", "\tchain postrouting {", "\t\ttype nat hook postrouting priority srcnat; policy accept;", '\t\toifname "wan" masquerade', "\t}", "}"].join("\n"),
    );
    expect(run(world, "laptop", "ping -c 1 203.0.113.80")).toContain("1 packets transmitted, 1 received");
  });

  it("tracks ping by its id and shows the icmp line", () => {
    const world = buildWorld(home());
    run(world, "laptop", "ping -c 1 203.0.113.80");
    const line = run(world, "router", "conntrack -L 2>/dev/null");
    expect(line).toMatch(/^icmp {5}1 29 src=192\.168\.1\.23 dst=203\.0\.113\.80 type=8 code=0 id=\d+ src=203\.0\.113\.80 dst=203\.0\.113\.1 type=0 code=0 id=\d+ mark=0 use=1$/);
  });

  it("a traceroute through the router still names each hop", () => {
    const world = buildWorld(home());
    const hops = run(world, "laptop", "traceroute -n 203.0.113.80").split("\n").slice(1).map((l) => l.trim().split(/\s+/)[1]);
    expect(hops).toEqual(["192.168.1.1", "203.0.113.80"]);
  });
});

describe("conntrack -L", () => {
  it("prints the flow count on stderr, which 2>/dev/null hides and a pipe does not carry", () => {
    const world = buildWorld(home());
    run(world, "laptop", "curl http://203.0.113.80:8080/");
    expect(run(world, "router", "conntrack -L")).toContain("conntrack v1.4.8 (conntrack-tools): 1 flow entries have been shown.");
    expect(run(world, "router", "conntrack -L 2>/dev/null")).not.toContain("conntrack v1");
    const filtered = run(world, "router", "conntrack -L | grep 'dport=8080'");
    expect(filtered.split("\n")[0]).toMatch(/^tcp {6}6 119 TIME_WAIT src=192\.168\.1\.23 /);
    expect(run(world, "router", "conntrack -L 2>/dev/null | grep -c dport=9999")).toBe("0");
  });

  it("a refused connection leaves its entry CLOSE", () => {
    const world = buildWorld(home());
    // nothing listens on the server's port 9, so a reset comes back
    run(world, "laptop", "curl http://203.0.113.80:9/");
    expect(run(world, "router", "conntrack -L 2>/dev/null")).toContain(" CLOSE src=192.168.1.23 ");
  });
});

describe("port forwarding", () => {
  it("sends outside traffic for the forwarded port to the inside host and translates the answer back", () => {
    const world = buildWorld(home({ dnat: true }));
    expect(run(world, "server", "curl http://203.0.113.1:8080/")).toBe("laptop page");
    const line = run(world, "router", "conntrack -L 2>/dev/null");
    expect(line).toMatch(/src=203\.0\.113\.80 dst=203\.0\.113\.1 sport=\d+ dport=8080 src=192\.168\.1\.23 dst=203\.0\.113\.80 sport=80 dport=\d+ \[ASSURED\]/);
  });

  it("refuses an unforwarded port at once", () => {
    const world = buildWorld(home({ dnat: true }));
    expect(run(world, "server", "curl http://203.0.113.1:22/")).toBe("curl: (7) Failed to connect to 203.0.113.1 port 22 after 0 ms: Couldn't connect to server");
  });

  it("a private address is not reachable from outside directly", () => {
    const world = buildWorld(home({ dnat: true }));
    expect(run(world, "server", "curl http://192.168.1.23/")).toMatch(/^curl: \(7\)/);
  });

  it("prints the ruleset the way nft does, with handles on request", () => {
    const world = buildWorld(home({ dnat: true }));
    run(world, "router", "nft add table ip filter");
    run(world, "router", "nft add chain ip filter forward { type filter hook forward priority filter \\; }");
    run(world, "router", "nft add rule ip filter forward ip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop");
    expect(run(world, "router", "nft list ruleset")).toBe(
      [
        "table ip nat {",
        "\tchain postrouting {",
        "\t\ttype nat hook postrouting priority srcnat; policy accept;",
        '\t\toifname "wan" masquerade',
        "\t}",
        "",
        "\tchain prerouting {",
        "\t\ttype nat hook prerouting priority dstnat; policy accept;",
        '\t\tiifname "wan" tcp dport 8080 dnat to 192.168.1.23:80',
        "\t}",
        "}",
        "table ip filter {",
        "\tchain forward {",
        "\t\ttype filter hook forward priority filter; policy accept;",
        "\t\tip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop",
        "\t}",
        "}",
      ].join("\n"),
    );
    expect(run(world, "router", "nft -a list table ip nat")).toContain('iifname "wan" tcp dport 8080 dnat to 192.168.1.23:80 # handle 4');
  });

  it("replace and delete rule work on a handle", () => {
    const world = buildWorld(home({ dnat: true }));
    expect(run(world, "router", 'nft replace rule ip nat prerouting handle 4 iifname "wan" tcp dport 8080 dnat to 192.168.1.24:80')).toBe("");
    expect(run(world, "router", "nft list ruleset")).toContain("dnat to 192.168.1.24:80");
    expect(run(world, "router", "nft delete rule ip nat prerouting handle 4")).toBe("");
    expect(run(world, "router", "nft list ruleset")).not.toContain("dnat");
    expect(run(world, "server", "curl http://203.0.113.1:8080/")).toMatch(/^curl: \(7\)/);
  });
});

describe("nft errors", () => {
  it("a rule in a table that does not exist is refused with nft's message", () => {
    const world = buildWorld(home({ nat: false }));
    const out = run(world, "router", 'nft add rule ip nat postrouting oifname "wan" masquerade');
    expect(out.split("\n")[0]).toBe("Error: Could not process rule: No such file or directory");
  });

  it("a word nft does not know points at itself", () => {
    const world = buildWorld(home());
    const out = run(world, "router", "nft add rule ip nat postrouting oifname wan nonsense");
    expect(out.split("\n")[0]).toBe("Error: syntax error, unexpected nonsense");
    expect(out.split("\n")[2]).toContain("^^^^^^^^");
  });

  it("flush ruleset empties the router's tables", () => {
    const world = buildWorld(home());
    run(world, "router", "nft flush ruleset");
    expect(run(world, "router", "nft list ruleset")).toBe("");
  });
});

describe("forwarding and the forward chain", () => {
  it("sysctl -w turns forwarding on and the laptop gets out", () => {
    const world = buildWorld(home({ forwarding: false }));
    expect(run(world, "laptop", "curl http://203.0.113.80:8080/")).toMatch(/^curl: \(28\)/);
    expect(run(world, "router", "sysctl -w net.ipv4.ip_forward=1")).toBe("net.ipv4.ip_forward = 1");
    expect(run(world, "laptop", "curl http://203.0.113.80:8080/")).toMatch(/^the server sees you as 203\.0\.113\.1:\d+$/);
  });

  it("a drop rule in the forward chain blocks the flow silently, and an input drop blocks the router itself", () => {
    const world = buildWorld(home());
    run(world, "router", "nft add table ip filter");
    run(world, "router", "nft add chain ip filter forward { type filter hook forward priority filter \\; }");
    run(world, "router", "nft add rule ip filter forward ip saddr 192.168.1.24 drop");
    expect(run(world, "phone", "curl http://203.0.113.80:8080/")).toMatch(/^curl: \(28\)/);
    expect(run(world, "laptop", "curl http://203.0.113.80:8080/")).toMatch(/^the server sees you/);
    run(world, "router", "nft add chain ip filter input { type filter hook input priority filter \\; }");
    run(world, "router", "nft add rule ip filter input ip saddr 192.168.1.23 drop");
    expect(run(world, "laptop", "ping -c 1 192.168.1.1")).toContain("100% packet loss");
  });
});

describe("home router checks", () => {
  const checks = [
    { id: "out", label: "", from: "laptop", to: "203.0.113.80", kind: "tcp" as const, port: 8080, expect: "reach" as const, seenAs: "203.0.113.1" },
    { id: "in", label: "", from: "server", to: "203.0.113.1", kind: "tcp" as const, port: 8080, expect: "reach" as const, seenBy: "laptop" },
    { id: "refused", label: "", from: "server", to: "203.0.113.1", kind: "tcp" as const, port: 22, expect: "refused" as const },
  ];

  it("passes with masquerade and the forward; without them only the refusal still holds", () => {
    expect(runChecks(buildWorld(home({ dnat: true })), checks).map((r) => r.pass)).toEqual([true, true, true]);
    expect(runChecks(buildWorld(home({ nat: false })), checks).map((r) => r.pass)).toEqual([false, false, true]);
  });

  it("seenBy catches a forward that lands on the wrong host", () => {
    const wrong = home({ dnat: true });
    const router = wrong.devices.find((d) => d.id === "router");
    if (router?.nat?.dnat) router.nat.dnat[0].to = "192.168.1.24:80";
    expect(runChecks(buildWorld(wrong), checks)[1].pass).toBe(false);
  });

  it("the validator accepts the topology and refuses a nat rule on an interface that does not exist", () => {
    expect(validateTopology(home({ dnat: true }))).toEqual([]);
    const bad = home();
    const router = bad.devices.find((d) => d.id === "router");
    if (router?.nat) router.nat.masquerade = ["wan9"];
    expect(validateTopology(bad).join("\n")).toContain('masquerades out of "wan9"');
  });
});
