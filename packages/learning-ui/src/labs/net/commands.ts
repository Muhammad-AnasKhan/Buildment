// The network lab terminal. Each command reads or changes the World and prints
// what the real tool prints on Ubuntu 24.04 (iproute2, iputils ping,
// traceroute, ss, curl, nft, conntrack, dig, udhcpc), generated from the
// model's state. Times are made up but stable, so a recorded answer always
// matches what the learner sees.

import type { Run } from "./engine";
import { newRun, sendIp, sourceAddress } from "./engine";
import type { DeviceState, IfaceState, RouteState, World } from "./model";
import {
  DEFAULT_CIDR,
  dropOrphanRoutes,
  hasCarrier,
  ifaceOf,
  isLocalAddress,
  lookupRoute,
  nextEphemeralPort,
  onLinkIface,
  routesOf,
  socketsOf,
  sourceFor,
} from "./model";
import { nftCommand } from "./nft";
import { resolveName } from "./resolve";
import { conntrackList, dig, systemctl, udhcpc } from "./services";
import { broadcastOf, formatCidr, formatIp, networkOf, parseCidr, parseIp } from "./ip";

export interface CommandResult {
  output: string;
  // True when the command changed the World (an address, a route, a link).
  changed: boolean;
  // The first packet's run, for the step view and the inspector.
  run?: Run;
}

const ip = formatIp;
const ok = (output = ""): CommandResult => ({ output, changed: false });
const changed = (output = ""): CommandResult => ({ output, changed: true });

// A stable round-trip time for a packet that crossed `hops` routers.
function rtt(hops: number, seq: number): number {
  return 0.045 + 0.031 * hops + 0.004 * ((seq * 7) % 5);
}

const ms = (value: number) => value.toFixed(3);

export const HELP = [
  "Commands in this lab (Ubuntu 24.04 output):",
  "  ip addr | ip link | ip route | ip route get ADDRESS | ip neigh",
  "  ip addr add|del ADDRESS/PREFIX dev IFACE",
  "  ip route add|del DEST [via GATEWAY] [dev IFACE] [metric N]",
  "  ip link set IFACE up|down     ip neigh flush all",
  "  ping [-c N] [-t TTL] ADDRESS   (4 probes unless you give -c)",
  "  traceroute [-n] [-m HOPS] ADDRESS",
  "  arp -a | ss -tlnp | ss -ulnp | curl [--local-port N] http://NAME-OR-ADDRESS:PORT/",
  "  sysctl net.ipv4.ip_forward | sysctl -w net.ipv4.ip_forward=1",
  "  nft list ruleset | nft -a list ruleset | nft add rule ip TABLE CHAIN ... | nft delete rule ... handle N",
  "  conntrack -L      (the router's table of translated connections)",
  "  udhcpc -i IFACE   (ask for an address)     cat /etc/resolv.conf",
  "  dig [@SERVER] NAME | systemctl status|start|stop dnsmasq",
  "  any command | grep [-v] TEXT",
  "  hostname | clear | help",
].join("\n");

export function prompt(device: DeviceState): string {
  return `root@${device.id}:~# `;
}

interface Raw extends CommandResult {
  // What the tool prints on stderr: a pipe does not carry it, 2>/dev/null hides it.
  stderr?: string;
}

// Runs a command line: one command, optionally piped through grep, optionally
// with 2>/dev/null.
export function runCommand(world: World, deviceId: string, line: string): CommandResult {
  const device = world.devices[deviceId];
  if (!device) return ok("No such device.");
  const quiet = /\s2>\s*\/dev\/null(\s|$)/.test(line);
  const stages = line.replace(/\s2>\s*\/dev\/null(?=\s|$)/g, "").split("|");
  const first = dispatch(world, device, stages[0]);
  let stdout = first.output;
  for (const stage of stages.slice(1)) stdout = pipeStage(stage.trim(), stdout);
  const stderr = quiet ? "" : first.stderr ?? "";
  return { output: [stdout, stderr].filter((part) => part !== "").join("\n"), changed: first.changed, run: first.run };
}

// grep is the one filter the lab offers: -v inverts, -i ignores case, -c counts.
function pipeStage(stage: string, input: string): string {
  const [cmd, ...args] = stage.split(/\s+/).filter(Boolean);
  if (cmd !== "grep") return `${cmd ?? ""}: command not found. Type help to see what this lab can run.`;
  const flags = args.filter((a) => a.startsWith("-")).join("");
  const pattern = args.find((a) => !a.startsWith("-"))?.replace(/^['"]|['"]$/g, "") ?? "";
  let test: (l: string) => boolean;
  try {
    const re = new RegExp(pattern, flags.includes("i") ? "i" : "");
    test = (l) => re.test(l);
  } catch {
    test = (l) => l.includes(pattern);
  }
  const kept = input.split("\n").filter((l) => test(l) !== flags.includes("v"));
  const lines = kept.length === 1 && kept[0] === "" ? [] : kept;
  return flags.includes("c") ? String(lines.length) : lines.join("\n");
}

function dispatch(world: World, device: DeviceState, line: string): Raw {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return ok();
  if (device.kind === "switch") return ok("This switch has no command line in the lab. Pick a host or a router.");
  const [cmd, ...args] = words;
  switch (cmd) {
    case "help":
      return ok(HELP);
    case "hostname":
      return ok(device.id);
    case "ip":
      return ipCommand(world, device, args);
    case "ping":
      return ping(world, device, args);
    case "traceroute":
      return traceroute(world, device, args);
    case "arp":
      return ok(arpTable(device));
    case "ss":
      return ok(ss(device, args));
    case "curl":
      return curl(world, device, args);
    case "sysctl":
      return sysctl(device, args);
    case "nft":
      return nftCommand(device, args);
    case "conntrack": {
      const streams = conntrackList(device, args);
      return { output: streams.stdout, stderr: streams.stderr, changed: false };
    }
    case "udhcpc":
      return udhcpc(world, device, args);
    case "busybox":
      return args[0] === "udhcpc" ? udhcpc(world, device, args) : ok(`busybox: applet not found: ${args[0] ?? ""}`);
    case "dig":
      return dig(world, device, args);
    case "systemctl":
      return systemctl(device, args);
    case "cat":
      return cat(device, args);
    case "echo":
      return echo(device, args);
    default:
      return ok(`${cmd}: command not found. Type help to see what this lab can run.`);
  }
}

// ---- reading state -------------------------------------------------------

function linkLines(world: World, device: DeviceState, iface: IfaceState, index: number): string[] {
  const carrier = hasCarrier(world, device, iface);
  const flags = !iface.up ? "BROADCAST,MULTICAST" : carrier ? "BROADCAST,MULTICAST,UP,LOWER_UP" : "NO-CARRIER,BROADCAST,MULTICAST,UP";
  const state = iface.up && carrier ? "UP" : "DOWN";
  return [
    `${index}: ${iface.name}: <${flags}> mtu 1500 qdisc noqueue state ${state} group default qlen 1000`,
    `    link/ether ${iface.mac} brd ff:ff:ff:ff:ff:ff`,
  ];
}

const LO_LINK = [
  "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000",
  "    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00",
];

function ipAddr(world: World, device: DeviceState, only?: string): string {
  const out: string[] = [];
  if (!only || only === "lo") {
    out.push(...LO_LINK, "    inet 127.0.0.1/8 scope host lo", "       valid_lft forever preferred_lft forever");
  }
  device.ifaces.forEach((iface, i) => {
    if (only && only !== iface.name) return;
    out.push(...linkLines(world, device, iface, i + 2));
    for (const a of iface.addrs) {
      out.push(`    inet ${formatCidr(a)} brd ${ip(broadcastOf(a))} scope global ${iface.name}`, "       valid_lft forever preferred_lft forever");
    }
  });
  if (only && out.length === 0) return `Device "${only}" does not exist.`;
  return out.join("\n");
}

function ipLink(world: World, device: DeviceState): string {
  return [...LO_LINK, ...device.ifaces.flatMap((iface, i) => linkLines(world, device, iface, i + 2))].join("\n");
}

function routeLine(r: RouteState): string {
  const dst = r.dst.prefix === 0 ? "default" : `${ip(r.dst.addr)}/${r.dst.prefix}`;
  if (r.connected) return `${dst} dev ${r.dev} proto kernel scope link src ${ip(r.src ?? 0)}`;
  const via = r.via !== undefined ? ` via ${ip(r.via)}` : "";
  const scope = r.via === undefined ? " scope link" : "";
  const metric = r.metric > 0 ? ` metric ${r.metric}` : "";
  return `${dst}${via} dev ${r.dev}${scope}${metric}`;
}

export function ipRoute(device: DeviceState): string {
  const routes = [...routesOf(device)].sort((a, b) => a.dst.addr - b.dst.addr || a.dst.prefix - b.dst.prefix || a.metric - b.metric);
  return routes.map(routeLine).join("\n");
}

function ipRouteGet(device: DeviceState, target?: string): string {
  const dst = target ? parseIp(target) : null;
  if (dst === null) return `Error: inet prefix is expected rather than "${target ?? ""}".`;
  if (isLocalAddress(device, dst)) return `local ${ip(dst)} dev lo src ${ip(dst)} uid 0 \n    cache <local> `;
  const route = lookupRoute(device, dst);
  if (!route) return "RTNETLINK answers: Network is unreachable";
  const src = sourceFor(device, route);
  const via = route.via !== undefined ? ` via ${ip(route.via)}` : "";
  return `${ip(dst)}${via} dev ${route.dev} src ${ip(src ?? 0)} uid 0 \n    cache `;
}

function ipNeigh(device: DeviceState): string {
  return device.neigh.map((n) => (n.mac ? `${ip(n.ip)} dev ${n.dev} lladdr ${n.mac} ${n.state}` : `${ip(n.ip)} dev ${n.dev} FAILED`)).join("\n");
}

function arpTable(device: DeviceState): string {
  return device.neigh.map((n) => (n.mac ? `? (${ip(n.ip)}) at ${n.mac} [ether] on ${n.dev}` : `? (${ip(n.ip)}) at <incomplete> on ${n.dev}`)).join("\n");
}

function ss(device: DeviceState, args: string[]): string {
  const flags = args.filter((a) => a.startsWith("-")).join("").replace(/-/g, "");
  const wantTcp = flags.includes("t") || !flags.includes("u");
  const wantUdp = flags.includes("u");
  const listening = flags.includes("l");
  const showProc = flags.includes("p");
  const rows = listening
    ? socketsOf(device).filter((s) => (s.proto === "tcp" && wantTcp) || (s.proto === "udp" && wantUdp))
    : [];
  const head = `State  Recv-Q Send-Q Local Address:Port  Peer Address:Port${showProc ? "Process" : ""}`;
  const lines = rows.map((s) => {
    const state = s.proto === "tcp" ? "LISTEN" : "UNCONN";
    const backlog = s.proto === "tcp" ? "5" : "0";
    const local = `${ip(s.addr)}:${s.port}`.padStart(18);
    const peer = "0.0.0.0:*".padStart(15);
    const proc = showProc ? `    users:(("${s.process}",pid=${s.pid},fd=3))` : "";
    return `${state.padEnd(6)} ${"0".padEnd(6)} ${backlog.padEnd(6)} ${local} ${peer}${proc}`;
  });
  return [head, ...lines].join("\n");
}

// ---- changing state ------------------------------------------------------

function devArg(args: string[]): string | undefined {
  const i = args.indexOf("dev");
  return i >= 0 ? args[i + 1] : undefined;
}

function ipAddrChange(device: DeviceState, verb: string, args: string[]): CommandResult {
  const name = devArg(args);
  const iface = name ? ifaceOf(device, name) : undefined;
  if (verb === "flush") {
    if (!iface) return ok(`Device "${name ?? ""}" does not exist.`);
    iface.addrs = [];
    iface.lease = undefined;
    dropOrphanRoutes(device);
    return changed();
  }
  const c = args[0] ? parseCidr(args[0].includes("/") ? args[0] : `${args[0]}/32`) : null;
  if (!c) return ok(`Error: inet prefix is expected rather than "${args[0] ?? ""}".`);
  if (!iface) return ok(`Cannot find device "${name ?? ""}"`);
  const existing = iface.addrs.findIndex((a) => a.addr === c.addr && a.prefix === c.prefix);
  if (verb === "add") {
    if (existing >= 0) return ok("Error: ipv4: Address already assigned.");
    iface.addrs.push(c);
    return changed();
  }
  if (existing < 0) return ok("Error: ipv4: Address not found.");
  iface.addrs.splice(existing, 1);
  if (iface.addrs.length === 0) iface.lease = undefined;
  dropOrphanRoutes(device);
  return changed();
}

function parseRouteArgs(args: string[]) {
  const dstText = args[0];
  const dst = dstText === "default" ? DEFAULT_CIDR : dstText ? parseCidr(dstText.includes("/") ? dstText : `${dstText}/32`) : null;
  const vi = args.indexOf("via");
  const via = vi >= 0 ? parseIp(args[vi + 1] ?? "") : undefined;
  const mi = args.indexOf("metric");
  const metric = mi >= 0 ? Number(args[mi + 1]) : undefined;
  return { dst: dst ? { addr: networkOf(dst), prefix: dst.prefix } : null, via, dev: devArg(args), metric };
}

function ipRouteChange(device: DeviceState, verb: string, args: string[]): CommandResult {
  const { dst, via, dev, metric } = parseRouteArgs(args);
  if (!dst) return ok(`Error: inet prefix is expected rather than "${args[0] ?? ""}".`);
  if (via === null) return ok("Error: inet address is expected rather than the gateway you gave.");
  const same = (r: RouteState) =>
    r.dst.addr === dst.addr && r.dst.prefix === dst.prefix && (via === undefined || r.via === via) && (metric === undefined || r.metric === metric);
  if (verb === "del" || verb === "delete") {
    const i = device.routes.findIndex(same);
    if (i < 0) return ok("RTNETLINK answers: No such process");
    device.routes.splice(i, 1);
    return changed();
  }
  let outDev = dev;
  if (via !== undefined) {
    const link = onLinkIface(device, via);
    if (!link || (dev && link.name !== dev)) return ok("Error: Nexthop has invalid gateway.");
    outDev = link.name;
  }
  if (!outDev) return ok("Error: Device for nexthop is not up.");
  const iface = ifaceOf(device, outDev);
  if (!iface) return ok(`Cannot find device "${outDev}"`);
  if (!iface.up) return ok("Error: Nexthop device is not up.");
  // add refuses a duplicate, replace overwrites or creates, change needs one
  // to exist. The kernel matches on destination and metric (0 when unspecified).
  const at = device.routes.findIndex((r) => r.dst.addr === dst.addr && r.dst.prefix === dst.prefix && r.metric === (metric ?? 0));
  const route = { dst, via: via ?? undefined, dev: outDev, metric: metric ?? 0 };
  if (verb === "add" && at >= 0) return ok("RTNETLINK answers: File exists");
  if (verb === "change" && at < 0) return ok("RTNETLINK answers: No such file or directory");
  if (at >= 0) device.routes[at] = route;
  else device.routes.push(route);
  return changed();
}

function ipLinkSet(device: DeviceState, args: string[]): CommandResult {
  const rest = args[0] === "dev" ? args.slice(1) : args;
  const iface = ifaceOf(device, rest[0] ?? "");
  if (!iface) return ok(`Cannot find device "${rest[0] ?? ""}"`);
  if (rest[1] !== "up" && rest[1] !== "down") return ok('Error: either "dev" is duplicate, or "up|down" is missing.');
  iface.up = rest[1] === "up";
  return changed();
}

function ipCommand(world: World, device: DeviceState, args: string[]): CommandResult {
  const rest = args.filter((a) => a !== "-4");
  const [object = "", verb, ...more] = rest;
  const is = (names: string[]) => names.includes(object);
  if (is(["a", "addr", "address"])) {
    if (verb === "add" || verb === "del" || verb === "delete" || verb === "flush") return ipAddrChange(device, verb === "delete" ? "del" : verb, more);
    const name = devArg(rest) ?? (verb === "show" || verb === "s" ? more[0] : undefined);
    return ok(ipAddr(world, device, name));
  }
  if (is(["l", "link"])) {
    if (verb === "set") return ipLinkSet(device, more);
    return ok(ipLink(world, device));
  }
  if (is(["r", "route", "ro"])) {
    if (verb === "get") return ok(ipRouteGet(device, more[0]));
    if (verb === "add" || verb === "del" || verb === "delete" || verb === "replace" || verb === "change") return ipRouteChange(device, verb, more);
    if (verb !== undefined && !["show", "list", "ls", "s", "lst", "dev"].includes(verb)) {
      return ok(`Command "${verb}" is unknown, try "ip route help".`);
    }
    return ok(ipRoute(device));
  }
  if (is(["n", "neigh", "neighbour", "neighbor"])) {
    if (verb === "flush") {
      const name = devArg(more);
      device.neigh = name ? device.neigh.filter((n) => n.dev !== name) : [];
      return changed();
    }
    return ok(ipNeigh(device));
  }
  return ok(`Object "${object}" is unknown, try "ip help".`);
}

function sysctl(device: DeviceState, args: string[]): CommandResult {
  const setting = args.find((a) => a.startsWith("net.ipv4.ip_forward"));
  if (!setting) return ok("This lab knows one setting: net.ipv4.ip_forward");
  const [, value] = setting.split("=");
  if (value === undefined) return ok(`net.ipv4.ip_forward = ${device.forwarding ? 1 : 0}`);
  if (value !== "0" && value !== "1") return ok(`sysctl: setting key "net.ipv4.ip_forward": Invalid argument`);
  device.forwarding = value === "1";
  return changed(`net.ipv4.ip_forward = ${value}`);
}

// ---- sending packets -----------------------------------------------------

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function target(args: string[], valued: string[]): string | undefined {
  for (let i = 0; i < args.length; i += 1) {
    if (valued.includes(args[i])) {
      i += 1;
      continue;
    }
    if (!args[i].startsWith("-")) return args[i];
  }
  return undefined;
}

interface Probe {
  run: Run;
  refused: boolean;
  reply?: { kind: string; from: number; ttl: number; code?: string; device: string };
}

function probe(world: World, device: DeviceState, dst: number, kind: "echo-request" | "udp" | "tcp-syn", ttl: number, seq: number, dport?: number, sport?: number, id?: number): Probe {
  const run = newRun();
  const src = sourceAddress(device, dst);
  if (src === null) {
    sendIp(world, run, device.id, { src: 0, dst, ttl, kind, seq, dport });
    return { run, refused: true };
  }
  const sent = sendIp(world, run, device.id, { src, dst, ttl, kind, seq, sport: sport ?? 40000 + seq, dport, id });
  if (!sent) return { run, refused: true };
  const back = run.arrivals.find(
    (a) => a.device === device.id && a.packet.dst === src && a.packet.kind !== kind && (a.packet.seq === seq || a.packet.about?.seq === seq),
  );
  return {
    run,
    refused: false,
    reply: back && { kind: back.packet.kind, from: back.packet.src, ttl: back.packet.ttl, code: back.packet.code, device: back.device },
  };
}

function ping(world: World, device: DeviceState, args: string[]): CommandResult {
  const host = target(args, ["-c", "-t", "-W", "-i", "-s"]);
  if (!host) return ok("ping: usage error: Destination address required");
  const named = resolveName(world, device, host);
  if (!named.ok) return ok(named.why === "nxdomain" ? `ping: ${host}: Name or service not known` : `ping: ${host}: Temporary failure in name resolution`);
  const dst = named.ip;
  const id = 4000 + ([...device.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 13) % 50000;
  const count = Math.max(1, Math.min(10, Number(flag(args, "-c") ?? 4) || 4));
  const ttl = Math.max(1, Math.min(255, Number(flag(args, "-t") ?? 64) || 64));
  const lines = [`PING ${host} (${ip(dst)}) 56(84) bytes of data.`];
  const times: number[] = [];
  let errors = 0;
  let firstRun: Run | undefined;
  for (let seq = 1; seq <= count; seq += 1) {
    const p = probe(world, device, dst, "echo-request", ttl, seq, undefined, undefined, id);
    firstRun ??= p.run;
    if (p.refused) return { output: "ping: connect: Network is unreachable", changed: false, run: p.run };
    if (!p.reply) continue;
    if (p.reply.kind === "echo-reply") {
      const t = rtt(64 - p.reply.ttl, seq);
      times.push(t);
      lines.push(`64 bytes from ${ip(p.reply.from)}: icmp_seq=${seq} ttl=${p.reply.ttl} time=${ms(t)} ms`);
    } else if (p.reply.kind === "time-exceeded") {
      errors += 1;
      lines.push(`From ${ip(p.reply.from)} icmp_seq=${seq} Time to live exceeded`);
    } else if (p.reply.kind === "unreachable") {
      errors += 1;
      lines.push(`From ${ip(p.reply.from)} icmp_seq=${seq} ${p.reply.code === "port" ? "Destination Port Unreachable" : "Destination Net Unreachable"}`);
    }
  }
  const received = times.length;
  const loss = Math.floor(((count - received) * 100) / count);
  lines.push(
    "",
    `--- ${host} ping statistics ---`,
    `${count} packets transmitted, ${received} received, ${errors ? `+${errors} errors, ` : ""}${loss}% packet loss, time ${(count - 1) * 1000 + count}ms`,
  );
  if (received > 0) {
    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = times.reduce((s, t) => s + t, 0) / received;
    const mdev = Math.sqrt(times.reduce((s, t) => s + (t - avg) ** 2, 0) / received);
    lines.push(`rtt min/avg/max/mdev = ${ms(min)}/${ms(avg)}/${ms(max)}/${ms(mdev)} ms`);
  }
  return { output: lines.join("\n"), changed: false, run: firstRun };
}

function traceroute(world: World, device: DeviceState, args: string[]): CommandResult {
  const host = target(args, ["-m", "-q", "-w"]);
  const dst = host ? parseIp(host) : null;
  if (!host) return ok("Usage: traceroute [-n] [-m max_ttl] host");
  if (dst === null) return ok(`${host}: Name or service not known`);
  const numeric = args.includes("-n");
  const maxHops = Math.max(1, Math.min(30, Number(flag(args, "-m") ?? 30) || 30));
  const lines = [`traceroute to ${ip(dst)} (${ip(dst)}), ${maxHops} hops max, 60 byte packets`];
  let firstRun: Run | undefined;
  for (let ttl = 1; ttl <= maxHops; ttl += 1) {
    const replies: Probe["reply"][] = [];
    for (let n = 0; n < 3; n += 1) {
      const seq = ttl * 3 + n;
      const p = probe(world, device, dst, "udp", ttl, seq, 33434 + (ttl - 1) * 3 + n);
      firstRun ??= p.run;
      if (p.refused) return { output: `${lines[0]}\nconnect: Network is unreachable`, changed: false, run: p.run };
      replies.push(p.reply);
    }
    const parts: string[] = [];
    let last: number | undefined;
    let done = false;
    replies.forEach((r, n) => {
      if (!r) {
        parts.push("*");
        return;
      }
      if (r.from !== last) {
        parts.push(numeric ? ip(r.from) : `${ip(r.from)} (${ip(r.from)})`);
        last = r.from;
      }
      const mark = r.kind === "unreachable" && r.code === "net" ? " !N" : "";
      parts.push(`${ms(rtt(ttl, ttl * 3 + n))} ms${mark}`);
      if (r.kind === "unreachable") done = true;
    });
    lines.push(`${String(ttl).padStart(2)}  ${parts.join(parts.every((p) => p === "*") ? " " : "  ")}`);
    if (done) break;
  }
  return { output: lines.join("\n"), changed: false, run: firstRun };
}

// Flags that take a value, so the value is not mistaken for the URL.
const CURL_VALUED = ["-m", "--max-time", "--connect-timeout", "--local-port", "-o", "-H", "-X", "-w", "--resolve"];

function curl(world: World, device: DeviceState, args: string[]): CommandResult {
  const url = target(args, CURL_VALUED);
  if (!url) return ok("curl: try 'curl --help' for more information");
  const flags = args.filter((a) => /^-[a-zA-Z]+$/.test(a)).join("");
  // -s hides the error message unless -S asks for it again.
  const say = (text: string, run?: Run): CommandResult => ({ output: flags.includes("s") && !flags.includes("S") ? "" : text, changed: false, run });
  const m = /^(?:http:\/\/)?([^/:]+)(?::(\d+))?(\/.*)?$/.exec(url);
  if (!m) return say(`curl: (3) URL rejected: Bad hostname`);
  const host = m[1];
  const maxTime = flag(args, "-m") ?? flag(args, "--max-time");
  const named = resolveName(world, device, host);
  if (!named.ok) {
    // A lookup that gets no answer ends in "Could not resolve host" after the
    // C library gives up; with -m it ends at the time limit instead, as the
    // recorded run shows.
    if (named.why === "timeout" && maxTime) return say(`curl: (28) Resolving timed out after ${Math.round(Number(maxTime) * 1000)} milliseconds`);
    return say(`curl: (6) Could not resolve host: ${host}`);
  }
  const dst = named.ip;
  const port = Number(m[2] ?? 80);
  const wantedPort = Number((flag(args, "--local-port") ?? "").split("-")[0]);
  const sport = wantedPort > 0 ? wantedPort : nextEphemeralPort(device);
  const p = probe(world, device, dst, "tcp-syn", 64, 1, port, sport);
  const fail = `curl: (7) Failed to connect to ${host} port ${port} after 0 ms: Couldn't connect to server`;
  if (p.refused || p.reply?.kind === "tcp-rst" || p.reply?.kind === "unreachable") return say(fail, p.run);
  if (p.reply?.kind !== "tcp-syn-ack") {
    return say(`curl: (28) Failed to connect to ${host} port ${port} after 3002 ms: Timeout was reached`, p.run);
  }
  // The device that took the connection may not be the address asked for:
  // a port forward sends it on to another host and another port.
  const syn = p.run.arrivals.find((a) => a.packet.kind === "tcp-syn");
  const server = syn ? world.devices[syn.device] : undefined;
  const socket = server && socketsOf(server).find((s) => s.proto === "tcp" && s.port === (syn?.packet.dport ?? port) && (s.addr === 0 || s.addr === syn?.packet.dst));
  const client = syn ? `${ip(syn.packet.src)}:${syn.packet.sport ?? sport}` : "";
  const page = socket?.reply ?? `Hello from ${server?.label ?? ip(dst)}`;
  return { output: page.replace("{client}", client), changed: false, run: p.run };
}

// ---- files ---------------------------------------------------------------

const RESOLV = "/etc/resolv.conf";

function cat(device: DeviceState, args: string[]): CommandResult {
  const file = args.find((a) => !a.startsWith("-"));
  if (file !== RESOLV) return ok(`cat: ${file ?? ""}: No such file or directory`);
  if (!device.resolver) return ok(`cat: ${RESOLV}: No such file or directory`);
  return ok(device.resolver.map((r) => `nameserver ${ip(r)}`).join("\n"));
}

// echo, plus the two redirections the lab uses: the resolver file and the
// forwarding switch in /proc.
function echo(device: DeviceState, args: string[]): CommandResult {
  const at = args.findIndex((a) => a === ">" || a === ">>");
  if (at < 0) return ok(args.join(" "));
  const text = args.slice(0, at).join(" ").replace(/^["']|["']$/g, "");
  const file = args[at + 1];
  if (file === "/proc/sys/net/ipv4/ip_forward" && (text === "1" || text === "0")) {
    device.forwarding = text === "1";
    return changed();
  }
  if (file === RESOLV) {
    const servers = text.split("\\n").flatMap((line) => {
      const m = /^\s*nameserver\s+(\S+)\s*$/.exec(line);
      const addr = m ? parseIp(m[1]) : null;
      return addr === null ? [] : [addr];
    });
    device.resolver = args[at] === ">>" ? [...(device.resolver ?? []), ...servers] : servers;
    return changed();
  }
  return ok(`bash: ${file ?? ""}: Permission denied`);
}
