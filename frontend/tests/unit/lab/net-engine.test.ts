import { describe, expect, it } from "vitest";
import { newRun, sendIp, sourceAddress } from "@/lab/net/engine";
import type { NetTopology, World } from "@/lab/net/model";
import { buildWorld, lookupRoute } from "@/lab/net/model";
import { formatIp, parseIp } from "@/lab/net/ip";

const a = (text: string) => parseIp(text) as number;

function probe(world: World, from: string, dst: string, kind: "echo-request" | "tcp-syn" = "echo-request", ttl = 64, dport?: number) {
  const run = newRun();
  const src = sourceAddress(world.devices[from], a(dst)) ?? 0;
  const ok = sendIp(world, run, from, { src, dst: a(dst), ttl, kind, seq: 1, sport: 40000, dport });
  const back = run.arrivals.filter((x) => x.device === from && x.packet.dst === src && x.packet.kind !== kind);
  return { run, ok, back };
}

// Laptop and phone on one switch (dossier 5.6 numbers).
const lan: NetTopology = {
  devices: [
    { id: "laptop", kind: "host", label: "Laptop", x: 0, y: 0, ifaces: [{ name: "eth0", addr: "192.168.1.23/24" }], routes: [{ dst: "default", via: "192.168.1.1" }] },
    { id: "phone", kind: "host", label: "Phone", x: 0, y: 0, ifaces: [{ name: "eth0", addr: "192.168.1.24/24" }] },
    { id: "sw", kind: "switch", label: "Switch", x: 0, y: 0, ports: 4 },
  ],
  links: [
    { a: "laptop.eth0", b: "sw.p1" },
    { a: "phone.eth0", b: "sw.p2" },
  ],
};

// Office, router 1, router 2, server (dossier 5.8 numbers).
function office(overrides: { r2Routes?: boolean; r2Silent?: boolean; filter?: boolean } = {}): NetTopology {
  return {
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
        filter: overrides.filter ? [{ action: "drop", src: "10.1.0.0/24", dst: "10.2.0.10" }] : [],
      },
      {
        id: "r2",
        kind: "router",
        label: "R2",
        x: 0,
        y: 0,
        silent: overrides.r2Silent,
        ifaces: [
          { name: "r2a", addr: "10.0.0.2/30" },
          { name: "r2b", addr: "10.2.0.1/24" },
        ],
        routes: overrides.r2Routes === false ? [] : [{ dst: "10.1.0.0/24", via: "10.0.0.1" }],
      },
      { id: "b", kind: "host", label: "B", x: 0, y: 0, ifaces: [{ name: "b0", addr: "10.2.0.10/24" }], routes: [{ dst: "default", via: "10.2.0.1" }] },
    ],
    links: [
      { a: "a.a0", b: "r1.r1a" },
      { a: "r1.r1b", b: "r2.r2a" },
      { a: "r2.r2b", b: "b.b0" },
    ],
  };
}

describe("net engine on one segment", () => {
  it("asks by ARP, gets one answer, and the switch learns both MACs", () => {
    const world = buildWorld(lan);
    const { run, back } = probe(world, "laptop", "192.168.1.24");
    expect(back.map((x) => x.packet.kind)).toEqual(["echo-reply"]);
    expect(run.events.some((e) => e.kind === "arp-request")).toBe(true);
    expect(run.events.some((e) => e.kind === "switch-flood")).toBe(true);
    expect(world.devices.laptop.neigh[0]).toMatchObject({ ip: a("192.168.1.24"), state: "REACHABLE" });
    expect(Object.values(world.devices.sw.macTable).sort()).toEqual(["p1", "p2"]);
  });

  it("loses the ping silently when nobody owns the address", () => {
    const world = buildWorld(lan);
    const { ok, back, run } = probe(world, "laptop", "192.168.1.99");
    expect(ok).toBe(true);
    expect(back).toEqual([]);
    expect(run.events.at(-1)?.kind).toBe("arp-failed");
    expect(world.devices.laptop.neigh[0]).toMatchObject({ ip: a("192.168.1.99"), state: "FAILED", mac: null });
  });

  it("with masks that disagree: one side loses silently, the other refuses at once", () => {
    const world = buildWorld({
      devices: [
        { id: "a", kind: "host", label: "A", x: 0, y: 0, ifaces: [{ name: "eth0", addr: "192.168.1.10/24" }] },
        { id: "b", kind: "host", label: "B", x: 0, y: 0, ifaces: [{ name: "eth0", addr: "192.168.1.20/28" }] },
      ],
      links: [{ a: "a.eth0", b: "b.eth0" }],
    });
    const aToB = probe(world, "a", "192.168.1.20");
    expect(aToB.ok).toBe(true);
    expect(aToB.back).toEqual([]);
    expect(aToB.run.events.some((e) => e.kind === "arp-ignored" && e.device === "b")).toBe(true);
    const bToA = probe(world, "b", "192.168.1.10");
    expect(bToA.ok).toBe(false);
    expect(bToA.run.events.at(-1)?.kind).toBe("local-error");
  });
});

describe("net engine across routers", () => {
  it("delivers across two routers and the reply arrives with TTL 62", () => {
    const world = buildWorld(office());
    const { back, run } = probe(world, "a", "10.2.0.10");
    expect(back).toHaveLength(1);
    expect(back[0].packet).toMatchObject({ kind: "echo-reply", ttl: 62 });
    const atB = run.arrivals.find((x) => x.device === "b");
    expect(atB?.packet.ttl).toBe(62);
  });

  it("loses the reply silently when router 2 has no route back", () => {
    const world = buildWorld(office({ r2Routes: false }));
    const { back, run } = probe(world, "a", "10.2.0.10");
    expect(back).toEqual([]);
    expect(run.arrivals.some((x) => x.device === "b")).toBe(true);
  });

  it("sends Time Exceeded from the address that faces the sender", () => {
    const world = buildWorld(office());
    const first = probe(world, "a", "10.2.0.10", "echo-request", 1);
    expect(first.back[0].packet.kind).toBe("time-exceeded");
    expect(formatIp(first.back[0].packet.src)).toBe("10.1.0.1");
    const second = probe(world, "a", "10.2.0.10", "echo-request", 2);
    expect(formatIp(second.back[0].packet.src)).toBe("10.0.0.2");
  });

  it("a quiet router drops the expired probe without a word", () => {
    const world = buildWorld(office({ r2Silent: true }));
    const second = probe(world, "a", "10.2.0.10", "echo-request", 2);
    expect(second.back).toEqual([]);
    expect(second.run.events.some((e) => e.kind === "ttl-expired" && e.device === "r2")).toBe(true);
  });

  it("answers Destination Net Unreachable from the router when it has no route", () => {
    const world = buildWorld(office());
    const { back } = probe(world, "a", "10.9.0.1");
    expect(back[0].packet).toMatchObject({ kind: "unreachable", code: "net" });
    expect(formatIp(back[0].packet.src)).toBe("10.1.0.1");
  });

  it("drops silently on a filter rule", () => {
    const world = buildWorld(office({ filter: true }));
    const { back, run } = probe(world, "a", "10.2.0.10");
    expect(back).toEqual([]);
    expect(run.events.some((e) => e.kind === "filtered" && e.device === "r1")).toBe(true);
  });
});

describe("route lookup", () => {
  const world = buildWorld({
    devices: [
      {
        id: "h",
        kind: "host",
        label: "H",
        x: 0,
        y: 0,
        ifaces: [
          { name: "eth0", addr: "10.0.0.5/24" },
          { name: "eth1", addr: "10.0.1.5/24" },
        ],
        routes: [
          { dst: "default", via: "10.0.0.1" },
          { dst: "10.0.0.0/8", via: "10.0.0.2" },
          { dst: "10.1.0.0/16", via: "10.0.1.3", metric: 200 },
          { dst: "10.1.0.0/16", via: "10.0.1.2", metric: 100 },
        ],
      },
    ],
    links: [],
  });
  const pick = (dst: string) => lookupRoute(world.devices.h, a(dst));

  it("picks the longest prefix, whatever the order", () => {
    expect(pick("10.1.2.3")?.dst.prefix).toBe(16);
    expect(pick("10.7.0.1")?.dst.prefix).toBe(8);
    expect(pick("203.0.113.80")?.dst.prefix).toBe(0);
    expect(pick("10.0.1.9")?.connected).toBe(true);
  });

  it("breaks a tie on prefix with the lower metric", () => {
    expect(formatIp(pick("10.1.2.3")?.via ?? 0)).toBe("10.0.1.2");
  });
});

describe("sockets", () => {
  const withServer = (addr: string): NetTopology => ({
    ...lan,
    devices: lan.devices.map((d) => (d.id === "laptop" ? { ...d, sockets: [{ proto: "tcp" as const, addr, port: 8000, process: "python3" }] } : d)),
  });

  it("a server on 127.0.0.1 answers itself and turns the phone away", () => {
    const world = buildWorld(withServer("127.0.0.1"));
    expect(probe(world, "laptop", "127.0.0.1", "tcp-syn", 64, 8000).back[0].packet.kind).toBe("tcp-syn-ack");
    expect(probe(world, "phone", "192.168.1.23", "tcp-syn", 64, 8000).back[0].packet.kind).toBe("tcp-rst");
  });

  it("a server on 0.0.0.0 answers both", () => {
    const world = buildWorld(withServer("0.0.0.0"));
    expect(probe(world, "phone", "192.168.1.23", "tcp-syn", 64, 8000).back[0].packet.kind).toBe("tcp-syn-ack");
  });
});
