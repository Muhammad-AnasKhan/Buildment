// Commands for the things a home router runs and its clients ask of it: dig
// (DNS), udhcpc (DHCP), systemctl for dnsmasq and conntrack -L. Formats come
// from the course's recorded lab runs (dhcp-dns and capstone sessions) where
// they were recorded; the rest follow each tool's documented layout, and a
// comment says so.

import type { CommandResult } from "./commands";
import { dhcpDiscover } from "./dnsmasq";
import type { DeviceState, RouteState, World } from "./model";
import { DEFAULT_CIDR, dropOrphanRoutes, ifaceOf } from "./model";
import { conntrackLine } from "./nat";
import { dnsQuery, nameServersOf } from "./resolve";
import { contains, formatIp, parseIp } from "./ip";

const ip = formatIp;

// ---- dig -----------------------------------------------------------------

// The version Ubuntu 24.04 ships (bind9 9.18). Documented, not recorded.
const DIG_VERSION = "9.18.28-0ubuntu0.24.04.1-Ubuntu";

// dig lines pad a name to a tab stop: answers to column 24, the question to 32.
function padTo(text: string, width: number): string {
  const tabs = Math.max(1, Math.ceil((width - text.length) / 8));
  return text + "\t".repeat(tabs);
}

// A stable query id, so a recorded answer matches what the learner sees.
function queryId(name: string): number {
  return 1000 + ([...name].reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7) % 60000);
}

function digArgs(args: string[]) {
  let server: string | undefined;
  let name: string | undefined;
  let short = false;
  let tries = 3;
  for (const a of args) {
    if (a.startsWith("@")) server = a.slice(1);
    else if (a === "+short") short = true;
    else if (a.startsWith("+tries=")) tries = Math.max(1, Math.min(5, Number(a.slice(7)) || 3));
    else if (a.startsWith("+")) continue;
    else if (/^(A|AAAA|MX|NS|TXT|ANY|SOA|CNAME|PTR)$/i.test(a) && name) continue;
    else if (!name) name = a;
  }
  return { server, name, short, tries };
}

export function dig(world: World, device: DeviceState, args: string[]): CommandResult {
  const { server, name, short, tries } = digArgs(args);
  if (!name) return { output: "dig: give a name to look up, as in: dig web.test   or   dig @192.168.1.1 web.test", changed: false };
  const explicit = server !== undefined;
  const servers = explicit ? [parseIp(server) ?? 0] : nameServersOf(device);
  if (explicit && parseIp(server) === null) return { output: `;; couldn't get address for '${server}': not found`, changed: false };
  const errors: string[] = [];
  for (let attempt = 0; attempt < tries; attempt += 1) {
    for (const s of servers) {
      const outcome = dnsQuery(world, device, s, name);
      if (outcome.kind === "answer") {
        return { output: [...errors, digAnswer(name, s, outcome.status, outcome.answer, short, explicit)].filter((l) => l !== "").join("\n"), changed: false, run: outcome.run };
      }
      const why = outcome.kind === "timeout" ? "timed out" : outcome.kind === "refused" ? "connection refused" : "network unreachable";
      errors.push(`;; communications error to ${ip(s)}#53: ${why}`);
    }
  }
  const head = [
    "",
    `; <<>> DiG ${DIG_VERSION} <<>> ${explicit ? `@${server} ` : ""}${name}`,
    ...(explicit ? ["; (1 server found)"] : []),
    ";; global options: +cmd",
    ";; no servers could be reached",
  ];
  return { output: [...errors, ...(short ? [";; no servers could be reached"] : head)].join("\n"), changed: false };
}

function digAnswer(name: string, server: number, status: string, answer: number | undefined, short: boolean, explicit: boolean): string {
  if (short) return status === "NOERROR" && answer !== undefined ? ip(answer) : "";
  const fqdn = name.endsWith(".") ? name : `${name}.`;
  const hasAnswer = status === "NOERROR" && answer !== undefined;
  // dnsmasq answers a name it holds as authoritative; a refusal carries no aa.
  const flags = status === "REFUSED" ? "qr rd" : "qr aa rd ra";
  const size = fqdn.length - 1 + (hasAnswer ? 45 : 29);
  const lines = [
    "",
    `; <<>> DiG ${DIG_VERSION} <<>> ${explicit ? `@${ip(server)} ` : ""}${name}`,
    ...(explicit ? ["; (1 server found)"] : []),
    ";; global options: +cmd",
    ";; Got answer:",
    `;; ->>HEADER<<- opcode: QUERY, status: ${status}, id: ${queryId(name)}`,
    `;; flags: ${flags}; QUERY: 1, ANSWER: ${hasAnswer ? 1 : 0}, AUTHORITY: 0, ADDITIONAL: 1`,
    "",
    ";; OPT PSEUDOSECTION:",
    "; EDNS: version: 0, flags:; udp: 1232",
    ";; QUESTION SECTION:",
    `${padTo(`;${fqdn}`, 32)}IN\tA`,
    "",
  ];
  if (hasAnswer) lines.push(";; ANSWER SECTION:", `${padTo(fqdn, 24)}0\tIN\tA\t${ip(answer as number)}`, "");
  lines.push(
    ";; Query time: 0 msec",
    `;; SERVER: ${ip(server)}#53(${ip(server)}) (UDP)`,
    ";; WHEN: Mon Oct 26 20:08:27 UTC 2026",
    `;; MSG SIZE  rcvd: ${size}`,
    "",
  );
  return lines.join("\n");
}

// ---- udhcpc --------------------------------------------------------------

function flagValue(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  if (i >= 0) return args[i + 1];
  const joined = args.find((a) => a.startsWith(name) && a.length > name.length);
  return joined?.slice(name.length);
}

// The busybox client. The recorded runs used a hook script that clears the
// interface when the client starts and applies the lease when it is bound, then
// prints "lease applied: ..."; this does the same. The no-lease wording is
// busybox's documented text and is not in the recordings.
export function udhcpc(world: World, device: DeviceState, args: string[]): CommandResult {
  const rest = args[0] === "udhcpc" ? args.slice(1) : args;
  const name = flagValue(rest, "-i") ?? "eth0";
  const iface = ifaceOf(device, name);
  if (!iface) return { output: "udhcpc: SIOCGIFINDEX: No such device", changed: false };
  const lines = ["udhcpc: started, v1.36.1"];
  iface.addrs = [];
  iface.lease = undefined;
  iface.up = true;
  dropOrphanRoutes(device);
  const offer = dhcpDiscover(world, { dev: device.id, iface: name }, iface.mac);
  if (!offer) {
    const tries = Math.max(1, Math.min(5, Number(flagValue(rest, "-t")) || 3));
    for (let n = 0; n < tries; n += 1) lines.push("udhcpc: broadcasting discover");
    lines.push(rest.includes("-n") ? "udhcpc: no lease, failing" : "udhcpc: no lease, forking to background");
    return { output: lines.join("\n"), changed: true };
  }
  lines.push(
    "udhcpc: broadcasting discover",
    `udhcpc: broadcasting select for ${ip(offer.ip)}, server ${ip(offer.serverAddr)}`,
    `udhcpc: lease of ${ip(offer.ip)} obtained from ${ip(offer.serverAddr)}, lease time ${offer.lease}`,
  );
  iface.addrs = [{ addr: offer.ip, prefix: offer.prefix }];
  iface.lease = { server: offer.serverAddr, seconds: offer.lease };
  device.routes = device.routes.filter((r) => !(r.dst.prefix === 0 && r.metric === 0));
  if (iface.addrs.some((a) => contains(a, offer.router))) {
    const route: RouteState = { dst: DEFAULT_CIDR, via: offer.router, dev: name, metric: 0 };
    device.routes.push(route);
  }
  device.resolver = [offer.dns];
  lines.push(`lease applied: ${ip(offer.ip)}/${offer.prefix} router=${ip(offer.router)} dns=${ip(offer.dns)} lease=${offer.lease}s`);
  return { output: lines.join("\n"), changed: true };
}

// ---- systemctl -----------------------------------------------------------

// systemd's status layout, trimmed to the lines that matter here. Documented,
// not recorded.
export function systemctl(device: DeviceState, args: string[]): CommandResult {
  const [verb, unitRaw] = args.filter((a) => !a.startsWith("-"));
  const unit = (unitRaw ?? "").replace(/\.service$/, "");
  if (!verb || !unit) return { output: "systemctl: give a command and a unit, as in: systemctl status dnsmasq", changed: false };
  const d = device.dnsmasq;
  if (unit !== "dnsmasq" || !d) {
    return { output: verb === "status" ? `Unit ${unit}.service could not be found.` : `Failed to ${verb} ${unit}.service: Unit ${unit}.service not found.`, changed: false };
  }
  switch (verb) {
    case "status": {
      const title = "dnsmasq.service - dnsmasq - A lightweight DHCP and caching DNS server";
      const loaded = "     Loaded: loaded (/usr/lib/systemd/system/dnsmasq.service; enabled; preset: enabled)";
      return d.running
        ? { output: [`● ${title}`, loaded, "     Active: active (running) since Mon 2026-10-26 09:00:00 UTC; 2h 3min ago", "   Main PID: 412 (dnsmasq)"].join("\n"), changed: false }
        : { output: [`○ ${title}`, loaded, "     Active: inactive (dead) since Mon 2026-10-26 09:00:00 UTC; 2h 3min ago"].join("\n"), changed: false };
    }
    case "start":
    case "restart":
      d.running = true;
      return { output: "", changed: true };
    case "stop":
      d.running = false;
      return { output: "", changed: true };
    default:
      return { output: `Unknown command verb '${verb}'.`, changed: false };
  }
}

// ---- conntrack -----------------------------------------------------------

export interface Streams {
  stdout: string;
  stderr: string;
}

// conntrack prints its note on stderr, which the recorded scripts hide with
// 2>/dev/null.
export function conntrackList(device: DeviceState, args: string[]): Streams {
  const entries = device.conntrack;
  if (args.includes("-C")) return { stdout: String(entries.length), stderr: "" };
  if (!args.includes("-L") && !args.includes("--dump")) return { stdout: "", stderr: "conntrack v1.4.8 (conntrack-tools): Illegal command: try conntrack -L" };
  const proto = (() => {
    const i = args.indexOf("-p");
    return i >= 0 ? args[i + 1] : undefined;
  })();
  const shown = proto ? entries.filter((e) => e.proto === proto) : entries;
  return {
    stdout: shown.map(conntrackLine).join("\n"),
    stderr: `conntrack v1.4.8 (conntrack-tools): ${shown.length} flow entries have been shown.`,
  };
}
