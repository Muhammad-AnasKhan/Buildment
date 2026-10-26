import { describe, expect, it } from "vitest";
import { runChecks } from "@buildment/learning-ui/labs/net/checks";
import { runCommand } from "@buildment/learning-ui/labs/net/commands";
import type { NetTopology } from "@buildment/learning-ui/labs/net/model";
import { buildWorld } from "@buildment/learning-ui/labs/net/model";
import { validateSolution, validateTopology } from "@buildment/learning-ui/labs/net/validate";
import { netLabHomeRouter } from "@buildment/learning-ui/labs/net-lab-home-router/data";
import { netLabNoInternet } from "@buildment/learning-ui/labs/net-lab-no-internet/data";
import { validateLabSpec } from "@buildment/learning-ui/labs/types";

// A laptop and a phone that ask for addresses, a router running dnsmasq, and a
// server outside (the dhcp-dns challenge's numbers).
function lan(opts: { running?: boolean; taken?: string[]; end?: string; unknown?: "nxdomain" | "refused" } = {}): NetTopology {
  return {
    devices: [
      { id: "laptop", kind: "host", label: "Laptop", x: 0, y: 0, ifaces: [{ name: "eth0" }] },
      { id: "phone", kind: "host", label: "Phone", x: 0, y: 0, ifaces: [{ name: "eth0" }] },
      { id: "sw", kind: "switch", label: "Switch", x: 0, y: 0, ports: 4 },
      {
        id: "router",
        kind: "router",
        label: "Router",
        x: 0,
        y: 0,
        ifaces: [
          { name: "lan", addr: "192.168.1.1/24" },
          { name: "wan", addr: "203.0.113.1/24" },
        ],
        nat: { masquerade: ["wan"] },
        dnsmasq: {
          running: opts.running,
          dhcp: { iface: "lan", start: "192.168.1.100", end: opts.end ?? "192.168.1.150", lease: 3600, taken: opts.taken },
          dns: { iface: "lan", records: { "web.test": "203.0.113.80" }, unknown: opts.unknown },
        },
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

describe("udhcpc", () => {
  it("prints the recorded lines and applies address, default route and resolver", () => {
    const world = buildWorld(lan());
    const out = run(world, "laptop", "udhcpc -i eth0").split("\n");
    expect(out[0]).toBe("udhcpc: started, v1.36.1");
    expect(out[1]).toBe("udhcpc: broadcasting discover");
    const m = /^udhcpc: broadcasting select for (192\.168\.1\.\d+), server 192\.168\.1\.1$/.exec(out[2]);
    expect(m).not.toBeNull();
    const address = m?.[1] as string;
    const last = Number(address.split(".")[3]);
    expect(last).toBeGreaterThanOrEqual(100);
    expect(last).toBeLessThanOrEqual(150);
    expect(out[3]).toBe(`udhcpc: lease of ${address} obtained from 192.168.1.1, lease time 3600`);
    expect(out[4]).toBe(`lease applied: ${address}/24 router=192.168.1.1 dns=192.168.1.1 lease=3600s`);
    expect(run(world, "laptop", "ip route")).toBe(["default via 192.168.1.1 dev eth0", `192.168.1.0/24 dev eth0 proto kernel scope link src ${address}`].join("\n"));
    expect(run(world, "laptop", "cat /etc/resolv.conf")).toBe("nameserver 192.168.1.1");
    expect(run(world, "laptop", "ping -c 1 203.0.113.80")).toContain("1 packets transmitted, 1 received");
  });

  it("gives two devices different addresses, and the same device the same address again", () => {
    const world = buildWorld(lan());
    const first = run(world, "laptop", "udhcpc -i eth0").match(/obtained from/) && run(world, "laptop", "ip addr show eth0").match(/inet (\S+)\/24/)?.[1];
    const phone = run(world, "phone", "udhcpc -i eth0") && run(world, "phone", "ip addr show eth0").match(/inet (\S+)\/24/)?.[1];
    expect(phone).not.toBe(first);
    run(world, "laptop", "udhcpc -i eth0");
    expect(run(world, "laptop", "ip addr show eth0").match(/inet (\S+)\/24/)?.[1]).toBe(first);
  });

  it("with no DHCP server the client discovers three times and ends with no address", () => {
    const world = buildWorld(lan({ running: false }));
    const out = run(world, "laptop", "udhcpc -i eth0").split("\n");
    expect(out).toEqual(["udhcpc: started, v1.36.1", "udhcpc: broadcasting discover", "udhcpc: broadcasting discover", "udhcpc: broadcasting discover", "udhcpc: no lease, forking to background"]);
    expect(run(world, "laptop", "ip addr show eth0")).not.toContain("inet ");
    expect(run(world, "laptop", "udhcpc -i eth0 -n").split("\n").pop()).toBe("udhcpc: no lease, failing");
  });

  it("an empty pool gives no lease either", () => {
    const world = buildWorld(lan({ end: "192.168.1.101", taken: ["192.168.1.100", "192.168.1.101"] }));
    expect(run(world, "laptop", "udhcpc -i eth0")).toContain("no lease");
    expect(run(world, "laptop", "ip addr show eth0")).not.toContain("inet ");
  });

  it("starting dnsmasq on the router makes the next attempt work", () => {
    const world = buildWorld(lan({ running: false }));
    expect(run(world, "router", "systemctl status dnsmasq")).toContain("inactive (dead)");
    expect(run(world, "router", "systemctl start dnsmasq")).toBe("");
    expect(run(world, "router", "systemctl status dnsmasq")).toContain("active (running)");
    expect(run(world, "laptop", "udhcpc -i eth0")).toContain("lease of");
  });

  it("a cable that is not plugged in gets no lease and a missing interface is reported", () => {
    const world = buildWorld(lan());
    run(world, "router", "ip link set lan down");
    expect(run(world, "laptop", "udhcpc -i eth0")).toContain("no lease");
    expect(run(world, "laptop", "udhcpc -i wlan9")).toBe("udhcpc: SIOCGIFINDEX: No such device");
  });
});

describe("dig", () => {
  it("answers a name the router knows, NOERROR with an answer section", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    const out = run(world, "laptop", "dig @192.168.1.1 web.test");
    expect(out).toContain(";; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: ");
    expect(out).toContain(";; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1");
    expect(out).toContain(";; ANSWER SECTION:\nweb.test.\t\t0\tIN\tA\t203.0.113.80");
    expect(out).toContain(";web.test.\t\t\tIN\tA");
    expect(out).toContain(";; SERVER: 192.168.1.1#53(192.168.1.1) (UDP)");
    expect(out).toContain(";; MSG SIZE  rcvd: 53");
    expect(run(world, "laptop", "dig +short @192.168.1.1 web.test")).toBe("203.0.113.80");
  });

  it("uses the resolver file when no server is given", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    const out = run(world, "laptop", "dig web.test");
    expect(out).toContain("status: NOERROR");
    expect(out).not.toContain("server found");
  });

  it("answers NXDOMAIN for an unknown name, with no answer section", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    const out = run(world, "laptop", "dig @192.168.1.1 nosuch.test");
    expect(out).toContain("status: NXDOMAIN");
    expect(out).toContain("ANSWER: 0");
    expect(out).not.toContain("ANSWER SECTION");
    expect(run(world, "laptop", "dig +short @192.168.1.1 nosuch.test")).toBe("");
  });

  it("answers REFUSED when the server has no upstream, as the recorded run did", () => {
    const world = buildWorld(lan({ unknown: "refused" }));
    run(world, "laptop", "udhcpc -i eth0");
    expect(run(world, "laptop", "dig @192.168.1.1 nosuch.test")).toContain("status: REFUSED");
  });

  it("times out three times when port 53 is blocked, then says no servers could be reached", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    run(world, "router", "nft add table ip filter");
    run(world, "router", "nft add chain ip filter input { type filter hook input priority filter \\; }");
    run(world, "router", "nft add rule ip filter input udp dport 53 drop");
    const out = run(world, "laptop", "dig @192.168.1.1 web.test");
    expect(out.split("\n").slice(0, 3)).toEqual(Array(3).fill(";; communications error to 192.168.1.1#53: timed out"));
    expect(out).toContain("; <<>> DiG 9.18.28-0ubuntu0.24.04.1-Ubuntu <<>> @192.168.1.1 web.test");
    expect(out).toContain(";; no servers could be reached");
    expect(run(world, "laptop", "dig +tries=1 @192.168.1.1 web.test").match(/communications error/g)).toHaveLength(1);
  });

  it("times out when nobody owns the server address", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    expect(run(world, "laptop", "dig +tries=1 @192.168.1.53 web.test")).toContain(";; communications error to 192.168.1.53#53: timed out");
  });

  it("is refused at once by an address that has no DNS server on it", () => {
    const world = buildWorld(lan());
    run(world, "server", "ip route add default via 203.0.113.1");
    expect(run(world, "server", "dig +tries=1 @203.0.113.1 web.test")).toContain(";; communications error to 203.0.113.1#53: connection refused");
  });

  it("a stopped dnsmasq does not answer DNS either", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    run(world, "router", "systemctl stop dnsmasq");
    expect(run(world, "laptop", "dig +tries=1 @192.168.1.1 web.test")).toContain("connection refused");
  });
});

describe("names in curl and ping", () => {
  it("curl resolves through the resolver file and the server sees the router", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    expect(run(world, "laptop", "curl http://web.test:8080/")).toMatch(/^the server sees you as 203\.0\.113\.1:\d+$/);
  });

  it("curl says Could not resolve host for an unknown name", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    expect(run(world, "laptop", "curl http://nosuch.test:8080/")).toBe("curl: (6) Could not resolve host: nosuch.test");
  });

  it("curl by name with a dead resolver says Could not resolve host, or times out at the -m limit as recorded", () => {
    const world = buildWorld(lan());
    run(world, "laptop", 'echo "nameserver 192.168.1.53" > /etc/resolv.conf');
    expect(run(world, "laptop", "ip addr add 192.168.1.9/24 dev eth0")).toBe("");
    expect(run(world, "laptop", "curl http://web.test:8080/")).toBe("curl: (6) Could not resolve host: web.test");
    expect(run(world, "laptop", "curl -m 3 http://web.test:8080/")).toBe("curl: (28) Resolving timed out after 3000 milliseconds");
  });

  it("curl names the host as typed when the connection is refused", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    expect(run(world, "laptop", "curl http://web.test:9/")).toBe("curl: (7) Failed to connect to web.test port 9 after 0 ms: Couldn't connect to server");
  });

  it("ping resolves a name and reports a failure like iputils", () => {
    const world = buildWorld(lan());
    run(world, "laptop", "udhcpc -i eth0");
    expect(run(world, "laptop", "ping -c 1 web.test").split("\n")[0]).toBe("PING web.test (203.0.113.80) 56(84) bytes of data.");
    expect(run(world, "laptop", "ping -c 1 nosuch.test")).toBe("ping: nosuch.test: Name or service not known");
  });

  it("a host with no resolver file has nothing to cat and cannot resolve", () => {
    const world = buildWorld(lan());
    expect(run(world, "laptop", "cat /etc/resolv.conf")).toBe("cat: /etc/resolv.conf: No such file or directory");
    expect(run(world, "laptop", "curl http://web.test:8080/")).toBe("curl: (6) Could not resolve host: web.test");
  });

  it("echo can set and extend the resolver file", () => {
    const world = buildWorld(lan());
    run(world, "laptop", 'echo "nameserver 192.168.1.1" > /etc/resolv.conf');
    run(world, "laptop", "echo nameserver 203.0.113.1 >> /etc/resolv.conf");
    expect(run(world, "laptop", "cat /etc/resolv.conf")).toBe("nameserver 192.168.1.1\nnameserver 203.0.113.1");
  });

  it("ss lists dnsmasq on the router while it runs", () => {
    const world = buildWorld(lan());
    expect(run(world, "router", "ss -ulnp")).toContain('users:(("dnsmasq"');
    run(world, "router", "systemctl stop dnsmasq");
    expect(run(world, "router", "ss -ulnp")).not.toContain("dnsmasq");
  });
});

describe("net-lab-home-router", () => {
  const topology = netLabHomeRouter.topology as NetTopology;
  const checks = netLabHomeRouter.checks ?? [];
  const fixes: Record<string, [string, string][]> = {
    forwarding: [["hrouter", "sysctl -w net.ipv4.ip_forward=1"]],
    dnat: [["hrouter", 'nft replace rule ip nat prerouting handle 4 iifname "wan" tcp dport 8080 dnat to 192.168.1.20:80']],
    isolation: [["hrouter", "nft add rule ip filter forward ip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop"]],
  };
  const passes = (world: ReturnType<typeof buildWorld>) => Object.fromEntries(runChecks(world, checks).map((r) => [r.id, r.pass]));
  const fixedWorld = (skip?: string) => {
    const world = buildWorld(topology);
    for (const [name, steps] of Object.entries(fixes)) {
      if (name === skip) continue;
      for (const [dev, cmd] of steps) expect(runCommand(world, dev, cmd).output).not.toMatch(/^(Error|RTNETLINK)/);
    }
    return world;
  };

  it("is valid, and its solution replays and passes every check", () => {
    expect(validateTopology(topology)).toEqual([]);
    expect(validateLabSpec(netLabHomeRouter)).toEqual([]);
    expect(validateSolution(netLabHomeRouter.solution!, { topology, checks })).toEqual([]);
    expect(Object.values(passes(fixedWorld())).every(Boolean)).toBe(true);
  });

  it("starts broken: the laptop and the forward fail, and the refusal already holds", () => {
    expect(passes(buildWorld(topology))).toMatchObject({ "laptop-out": false, "server-forward": false, "guest-out": false, "port-22-refused": true });
  });

  it("each fault breaks its own check once the other two are fixed", () => {
    expect(passes(fixedWorld("forwarding"))["laptop-out"]).toBe(false);
    expect(passes(fixedWorld("dnat"))).toMatchObject({ "server-forward": false, "laptop-out": true });
    expect(passes(fixedWorld("isolation"))).toMatchObject({ "guest-home": false, "laptop-out": true });
  });

  it("shows the symptoms a learner would read", () => {
    const world = buildWorld(topology);
    expect(runCommand(world, "hrouter", "sysctl net.ipv4.ip_forward").output).toBe("net.ipv4.ip_forward = 0");
    expect(runCommand(world, "hrouter", "nft -a list ruleset").output).toContain('iifname "wan" tcp dport 8080 dnat to 192.168.1.21:80 # handle 4');
    runCommand(world, "hrouter", "sysctl -w net.ipv4.ip_forward=1");
    expect(runCommand(world, "server", "curl http://203.0.113.1:8080/").output).toMatch(/^curl: \(28\)/);
    expect(runCommand(world, "guest", "curl http://192.168.1.20/").output).toBe("home web server");
  });

  it("the forwarded page and the masqueraded visit read as in the recorded run", () => {
    const world = fixedWorld();
    expect(runCommand(world, "server", "curl http://203.0.113.1:8080/").output).toBe("home web server");
    expect(runCommand(world, "laptop", "curl http://203.0.113.80:8080/").output).toMatch(/^the server sees you as 203\.0\.113\.1:\d+$/);
    expect(runCommand(world, "server", "curl http://203.0.113.1:22/").output).toMatch(/^curl: \(7\) Failed to connect to 203\.0\.113\.1 port 22 after 0 ms/);
    expect(runCommand(world, "guest", "curl http://192.168.1.20/").output).toMatch(/^curl: \(28\)/);
    expect(runCommand(world, "hrouter", "nft list ruleset").output).toContain("ip saddr 192.168.50.0/24 ip daddr 192.168.1.0/24 drop");
  });
});

describe("net-lab-no-internet", () => {
  const topology = netLabNoInternet.topology as NetTopology;
  const checks = netLabNoInternet.checks ?? [];
  const ids = checks.map((c) => c.id);

  it("is valid, and its solution replays and passes every check", () => {
    expect(ids).toEqual(["link", "address", "gateway", "route-out", "name", "page"]);
    expect(validateTopology(topology)).toEqual([]);
    expect(validateLabSpec(netLabNoInternet)).toEqual([]);
    expect(validateSolution(netLabNoInternet.solution!, { topology, checks })).toEqual([]);
  });

  it("starts with only the cable layer passing", () => {
    expect(runChecks(buildWorld(topology), checks).map((r) => r.pass)).toEqual([true, false, false, false, false, false]);
  });

  it("walks up the layers as each fault is fixed", () => {
    const world = buildWorld(topology);
    const pass = () => runChecks(world, checks).map((r) => r.pass);
    runCommand(world, "router", "systemctl start dnsmasq");
    runCommand(world, "laptop", "udhcpc -i eth0");
    expect(pass()).toEqual([true, true, true, false, false, false]);
    expect(runCommand(world, "laptop", "ping -c 1 203.0.113.80").output).toContain("From 192.168.1.1 icmp_seq=1 Destination Net Unreachable");
    runCommand(world, "router", "ip route add default via 198.51.100.1");
    expect(pass()).toEqual([true, true, true, true, false, false]);
    expect(runCommand(world, "laptop", "cat /etc/resolv.conf").output).toBe("nameserver 192.168.1.53");
    expect(runCommand(world, "laptop", "dig +tries=1 web.test").output).toContain("communications error to 192.168.1.53#53: timed out");
    expect(runCommand(world, "laptop", "dig +short @192.168.1.1 web.test").output).toBe("203.0.113.80");
    runCommand(world, "laptop", 'echo "nameserver 192.168.1.1" > /etc/resolv.conf');
    expect(pass()).toEqual([true, true, true, true, true, true]);
    expect(runCommand(world, "laptop", "curl http://web.test:8080/").output).toMatch(/^the server sees you as 198\.51\.100\.2:\d+$/);
  });

  it("the address check wants a lease, not a hand-set address", () => {
    const world = buildWorld(topology);
    runCommand(world, "laptop", "ip addr add 192.168.1.50/24 dev eth0");
    expect(runChecks(world, checks)[1].pass).toBe(false);
  });
});
