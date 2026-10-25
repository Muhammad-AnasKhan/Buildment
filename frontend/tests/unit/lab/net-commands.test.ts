import { describe, expect, it } from "vitest";
import { runCommand } from "@/lab/net/commands";
import type { NetTopology } from "@/lab/net/model";
import { buildWorld } from "@/lab/net/model";

// Host A, router 1, router 2, host B (networking dossier 5.8).
const office: NetTopology = {
  devices: [
    { id: "a", kind: "host", label: "A", x: 0, y: 0, ifaces: [{ name: "a0", addr: "10.1.0.10/24" }], routes: [{ dst: "default", via: "10.1.0.1" }] },
    {
      id: "r1",
      kind: "router",
      label: "R1",
      x: 0,
      y: 0,
      ifaces: [
        { name: "r1a", addr: "10.1.0.1/24" },
        { name: "r1b", addr: "10.0.0.1/30" },
      ],
      routes: [{ dst: "10.2.0.0/24", via: "10.0.0.2" }],
    },
    {
      id: "r2",
      kind: "router",
      label: "R2",
      x: 0,
      y: 0,
      ifaces: [
        { name: "r2a", addr: "10.0.0.2/30" },
        { name: "r2b", addr: "10.2.0.1/24" },
      ],
      routes: [{ dst: "10.1.0.0/24", via: "10.0.0.1" }],
    },
    {
      id: "b",
      kind: "host",
      label: "B",
      x: 0,
      y: 0,
      ifaces: [{ name: "b0", addr: "10.2.0.10/24" }],
      routes: [{ dst: "default", via: "10.2.0.1" }],
      sockets: [
        { proto: "tcp", addr: "127.0.0.1", port: 8000, process: "python3" },
        { proto: "tcp", addr: "0.0.0.0", port: 8001, process: "python3", reply: "hello from B" },
      ],
    },
  ],
  links: [
    { a: "a.a0", b: "r1.r1a" },
    { a: "r1.r1b", b: "r2.r2a" },
    { a: "r2.r2b", b: "b.b0" },
  ],
};

const out = (world: ReturnType<typeof buildWorld>, dev: string, line: string) => runCommand(world, dev, line).output;

describe("net commands: reading state", () => {
  it("prints ip route like iproute2", () => {
    const world = buildWorld(office);
    expect(out(world, "a", "ip route")).toBe(["default via 10.1.0.1 dev a0", "10.1.0.0/24 dev a0 proto kernel scope link src 10.1.0.10"].join("\n"));
    expect(out(world, "r1", "ip r")).toBe(
      ["10.0.0.0/30 dev r1b proto kernel scope link src 10.0.0.1", "10.1.0.0/24 dev r1a proto kernel scope link src 10.1.0.1", "10.2.0.0/24 via 10.0.0.2 dev r1b"].join("\n"),
    );
  });

  it("prints ip route get as recorded in the lab", () => {
    const world = buildWorld(office);
    expect(out(world, "a", "ip route get 10.2.0.10")).toMatch(/^10\.2\.0\.10 via 10\.1\.0\.1 dev a0 src 10\.1\.0\.10 uid 0/);
    expect(out(world, "r1", "ip route get 10.2.0.10")).toMatch(/^10\.2\.0\.10 via 10\.0\.0\.2 dev r1b src 10\.0\.0\.1/);
    expect(out(world, "a", "ip route get 127.0.0.1")).toMatch(/^local 127\.0\.0\.1 dev lo/);
  });

  it("prints ip addr with the broadcast address and scope", () => {
    const world = buildWorld(office);
    const text = out(world, "a", "ip addr");
    expect(text).toContain("inet 10.1.0.10/24 brd 10.1.0.255 scope global a0");
    expect(text).toContain("2: a0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500");
  });

  it("fills the neighbour table after a ping", () => {
    const world = buildWorld(office);
    expect(out(world, "a", "ip neigh")).toBe("");
    runCommand(world, "a", "ping -c 1 10.2.0.10");
    expect(out(world, "a", "ip neigh")).toMatch(/^10\.1\.0\.1 dev a0 lladdr 02:00:00:00:02:01 REACHABLE$/);
    expect(out(world, "a", "arp -a")).toBe("? (10.1.0.1) at 02:00:00:00:02:01 [ether] on a0");
  });

  it("shows both listening addresses in ss -tlnp", () => {
    const text = out(buildWorld(office), "b", "ss -tlnp");
    expect(text).toMatch(/LISTEN .* 127\.0\.0\.1:8000 .*python3/);
    expect(text).toMatch(/LISTEN .* 0\.0\.0\.0:8001 /);
  });
});

describe("net commands: sending packets", () => {
  it("ping across two routers shows ttl=62", () => {
    const text = out(buildWorld(office), "a", "ping -c 2 10.2.0.10");
    expect(text).toContain("64 bytes from 10.2.0.10: icmp_seq=1 ttl=62");
    expect(text).toContain("2 packets transmitted, 2 received, 0% packet loss");
  });

  it("traceroute -n prints both routers, then the host", () => {
    const lines = out(buildWorld(office), "a", "traceroute -n 10.2.0.10").split("\n");
    expect(lines[0]).toBe("traceroute to 10.2.0.10 (10.2.0.10), 30 hops max, 60 byte packets");
    expect(lines.slice(1).map((l) => l.trim().split(/\s+/)[1])).toEqual(["10.1.0.1", "10.0.0.2", "10.2.0.10"]);
  });

  it("ping with no route at all fails at once", () => {
    const world = buildWorld(office);
    runCommand(world, "a", "ip route del default");
    expect(out(world, "a", "ping 10.2.0.10")).toBe("ping: connect: Network is unreachable");
  });

  it("a router with no route answers Destination Net Unreachable", () => {
    const text = out(buildWorld(office), "a", "ping -c 1 10.9.9.9");
    expect(text).toContain("From 10.1.0.1 icmp_seq=1 Destination Net Unreachable");
    expect(text).toContain("1 packets transmitted, 0 received, +1 errors, 100% packet loss");
  });

  it("curl reaches 0.0.0.0 and is refused by 127.0.0.1", () => {
    const world = buildWorld(office);
    expect(out(world, "a", "curl http://10.2.0.10:8001/")).toBe("hello from B");
    expect(out(world, "a", "curl http://10.2.0.10:8000/")).toBe("curl: (7) Failed to connect to 10.2.0.10 port 8000 after 0 ms: Couldn't connect to server");
    expect(out(world, "b", "curl http://127.0.0.1:8000/")).toBe("Hello from B");
  });
});

describe("net commands: changing state", () => {
  it("refuses a gateway that is not on a connected block", () => {
    const world = buildWorld(office);
    runCommand(world, "a", "ip route del default");
    expect(out(world, "a", "ip route add default via 10.9.0.1")).toBe("Error: Nexthop has invalid gateway.");
    expect(runCommand(world, "a", "ip route add default via 10.1.0.1").changed).toBe(true);
    expect(out(world, "a", "ping -c 1 10.2.0.10")).toContain("1 received");
  });

  it("fixing a wrong mask: remove, add, then the default route can come back", () => {
    const world = buildWorld(office);
    runCommand(world, "a", "ip addr del 10.1.0.10/24 dev a0");
    expect(out(world, "a", "ip route")).toBe("");
    runCommand(world, "a", "ip addr add 10.1.0.10/29 dev a0");
    expect(out(world, "a", "ip route add default via 10.1.0.1")).toBe("Error: Nexthop has invalid gateway.");
    runCommand(world, "a", "ip addr del 10.1.0.10/29 dev a0");
    runCommand(world, "a", "ip addr add 10.1.0.10/24 dev a0");
    runCommand(world, "a", "ip route add default via 10.1.0.1");
    expect(out(world, "a", "ping -c 1 10.2.0.10")).toContain("1 received");
  });

  it("a router with forwarding off drops the packet silently", () => {
    const world = buildWorld(office);
    expect(out(world, "r1", "sysctl -w net.ipv4.ip_forward=0")).toBe("net.ipv4.ip_forward = 0");
    expect(out(world, "a", "ping -c 1 10.2.0.10")).toContain("0 received, 100% packet loss");
    runCommand(world, "r1", "sysctl -w net.ipv4.ip_forward=1");
    expect(out(world, "a", "ping -c 1 10.2.0.10")).toContain("1 received");
  });

  it("a cable unplugged shows NO-CARRIER on the far side", () => {
    const world = buildWorld(office);
    runCommand(world, "r1", "ip link set r1a down");
    expect(out(world, "a", "ip link")).toContain("a0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN");
  });
});
