// nftables state for a device: building the tables a lab author asked for,
// printing them the way `nft list ruleset` does, and the `nft` command itself.
// The ruleset text follows the course's recorded lab runs (the masquerade,
// forward-guest and capstone sessions): tab indents, chains separated by a
// blank line, `-100` printed as dstnat, `100` as srcnat and `0` as filter.

import type { DeviceState, NetDeviceSpec, NftChain, NftHook, NftRule, NftTable } from "./model";
import { contains, formatIp, networkOf, parseCidr, parseIp } from "./ip";
import type { Cidr } from "./ip";

const PRIORITY_NAMES: Record<number, string> = { [-100]: "dstnat", 100: "srcnat", 0: "filter" };
const PRIORITY_BY_NAME: Record<string, number> = { dstnat: -100, srcnat: 100, filter: 0 };
const HOOKS: NftHook[] = ["prerouting", "postrouting", "forward", "input", "output"];

export function addTable(device: DeviceState, name: string): NftTable {
  const existing = device.nft.find((t) => t.name === name);
  if (existing) return existing;
  const table: NftTable = { family: "ip", name, handle: device.nextTableHandle, nextHandle: 1, chains: [] };
  device.nextTableHandle += 1;
  device.nft.push(table);
  return table;
}

export function addChain(table: NftTable, name: string, type: "nat" | "filter", hook: NftHook, priority: number, policy: "accept" | "drop" = "accept"): NftChain {
  const existing = table.chains.find((c) => c.name === name);
  if (existing) return existing;
  const chain: NftChain = { name, handle: table.nextHandle, type, hook, priority, policy, rules: [] };
  table.nextHandle += 1;
  table.chains.push(chain);
  return chain;
}

export function addRule(table: NftTable, chain: NftChain, rule: Omit<NftRule, "handle">, at: "end" | "start" = "end"): NftRule {
  const full: NftRule = { ...rule, handle: table.nextHandle };
  table.nextHandle += 1;
  if (at === "start") chain.rules.unshift(full);
  else chain.rules.push(full);
  return full;
}

const cidrOf = (text: string): Cidr | null => parseCidr(text.includes("/") ? text : `${text}/32`);

// The nat and filter tables a lab author described in the device spec.
export function buildNftState(device: DeviceState, spec: NetDeviceSpec) {
  if (spec.nat) {
    const table = addTable(device, "nat");
    const post = addChain(table, "postrouting", "nat", "postrouting", 100);
    for (const oif of spec.nat.masquerade ?? []) addRule(table, post, { oif, action: "masquerade" });
    const pre = addChain(table, "prerouting", "nat", "prerouting", -100);
    for (const d of spec.nat.dnat ?? []) {
      const [ipText, portText] = d.to.split(":");
      addRule(table, pre, { iif: d.in, proto: d.proto, dport: d.port, action: "dnat", to: { ip: parseIp(ipText) ?? 0, port: portText ? Number(portText) : undefined } });
    }
  }
  if (spec.filter) {
    const table = addTable(device, "filter");
    const forward = addChain(table, "forward", "filter", "forward", 0);
    for (const r of spec.filter) {
      addRule(table, forward, {
        iif: r.in,
        oif: r.out,
        saddr: r.src ? cidrOf(r.src) ?? undefined : undefined,
        daddr: r.dst ? cidrOf(r.dst) ?? undefined : undefined,
        action: r.action,
      });
    }
  }
}

// A router tracks connections once it has any nat chain, as the kernel does
// when the nat tables are loaded.
export function tracksFlows(device: DeviceState): boolean {
  return device.nft.some((t) => t.chains.some((c) => c.type === "nat"));
}

export function chainsAt(device: DeviceState, hook: NftHook, type: "nat" | "filter"): { table: NftTable; chain: NftChain }[] {
  const out: { table: NftTable; chain: NftChain }[] = [];
  for (const table of device.nft) {
    for (const chain of table.chains) if (chain.hook === hook && chain.type === type) out.push({ table, chain });
  }
  return out.sort((a, b) => a.chain.priority - b.chain.priority);
}

export interface RuleContext {
  iif?: string;
  oif?: string;
  src: number;
  dst: number;
  proto: "tcp" | "udp" | "icmp" | null;
  dport?: number;
}

export function ruleMatches(rule: NftRule, ctx: RuleContext): boolean {
  if (rule.iif && rule.iif !== ctx.iif) return false;
  if (rule.oif && rule.oif !== ctx.oif) return false;
  if (rule.saddr && !contains(rule.saddr, ctx.src)) return false;
  if (rule.daddr && !contains(rule.daddr, ctx.dst)) return false;
  if (rule.proto && (rule.proto !== ctx.proto || (rule.dport !== undefined && rule.dport !== ctx.dport))) return false;
  return true;
}

// The verdict of every filter chain on a hook: the first drop wins, and a
// chain with policy drop drops whatever none of its rules accepted.
export function filterVerdict(device: DeviceState, hook: NftHook, ctx: RuleContext): "accept" | "drop" {
  for (const { chain } of chainsAt(device, hook, "filter")) {
    let verdict: "accept" | "drop" = chain.policy;
    for (const rule of chain.rules) {
      if ((rule.action === "drop" || rule.action === "accept") && ruleMatches(rule, ctx)) {
        verdict = rule.action;
        break;
      }
    }
    if (verdict === "drop") return "drop";
  }
  return "accept";
}

// ---- printing ------------------------------------------------------------

const priorityText = (n: number) => PRIORITY_NAMES[n] ?? String(n);
const cidrText = (c: Cidr) => (c.prefix === 32 ? formatIp(c.addr) : `${formatIp(networkOf(c))}/${c.prefix}`);

export function ruleText(rule: NftRule): string {
  const parts: string[] = [];
  if (rule.iif) parts.push(`iifname "${rule.iif}"`);
  if (rule.oif) parts.push(`oifname "${rule.oif}"`);
  if (rule.saddr) parts.push(`ip saddr ${cidrText(rule.saddr)}`);
  if (rule.daddr) parts.push(`ip daddr ${cidrText(rule.daddr)}`);
  if (rule.proto) parts.push(rule.dport !== undefined ? `${rule.proto} dport ${rule.dport}` : `meta l4proto ${rule.proto}`);
  if (rule.action === "dnat") parts.push(`dnat to ${formatIp(rule.to?.ip ?? 0)}${rule.to?.port !== undefined ? `:${rule.to.port}` : ""}`);
  else parts.push(rule.action);
  return parts.join(" ");
}

export function formatTable(table: NftTable, handles: boolean): string {
  const h = (n: number) => (handles ? ` # handle ${n}` : "");
  const lines = [`table ${table.family} ${table.name} {${handles ? ` # handle ${table.handle}` : ""}`];
  table.chains.forEach((chain, i) => {
    if (i > 0) lines.push("");
    lines.push(`\tchain ${chain.name} {${handles ? ` # handle ${chain.handle}` : ""}`);
    lines.push(`\t\ttype ${chain.type} hook ${chain.hook} priority ${priorityText(chain.priority)}; policy ${chain.policy};`);
    for (const rule of chain.rules) lines.push(`\t\t${ruleText(rule)}${h(rule.handle)}`);
    lines.push("\t}");
  });
  lines.push("}");
  return lines.join("\n");
}

export function formatRuleset(device: DeviceState, handles = false): string {
  return device.nft.map((t) => formatTable(t, handles)).join("\n");
}

// ---- the nft command -----------------------------------------------------

export interface NftResult {
  output: string;
  changed: boolean;
}

const fail = (output: string): NftResult => ({ output, changed: false });
const done = (): NftResult => ({ output: "", changed: true });

// nft draws the command back with carets under the part it did not like.
// These layouts are nft's documented error form; they are not in the recorded
// runs.
function pointAt(line: string, from: number, to: number): string {
  return `${line}\n${" ".repeat(from)}${"^".repeat(Math.max(1, to - from))}`;
}

function tokenize(args: string[]): string[] {
  return args
    .join(" ")
    .replace(/\\;/g, ";")
    .replace(/'/g, "")
    .replace(/([{};])/g, " $1 ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/^"(.*)"$/, "$1"));
}

function parseChainSpec(tokens: string[]): { type: "nat" | "filter"; hook: NftHook; priority: number; policy: "accept" | "drop" } | string {
  const text = tokens.join(" ");
  const m = /type\s+(\w+)\s+hook\s+(\w+)\s+priority\s+(-?\w+)/.exec(text);
  if (!m) return "Error: a base chain needs { type TYPE hook HOOK priority PRIORITY; }";
  const type = m[1];
  if (type !== "nat" && type !== "filter") return `Error: chain type "${type}" is not part of this lab (use nat or filter)`;
  if (!HOOKS.includes(m[2] as NftHook)) return `Error: unknown hook "${m[2]}"`;
  const priority = m[3] in PRIORITY_BY_NAME ? PRIORITY_BY_NAME[m[3]] : Number(m[3]);
  if (Number.isNaN(priority)) return `Error: unknown priority "${m[3]}"`;
  const policy = /policy\s+drop/.test(text) ? "drop" : "accept";
  return { type, hook: m[2] as NftHook, priority, policy };
}

// Reads the match and action words of a rule. Returns the rule or an error
// naming the word nft would stop at.
function parseRule(tokens: string[], chain: NftChain): Omit<NftRule, "handle"> | { bad: string } {
  const rule: Omit<NftRule, "handle"> = { action: "accept" };
  let i = 0;
  const next = () => tokens[i++];
  while (i < tokens.length) {
    const word = next();
    if (word === "iifname" || word === "iif") rule.iif = next();
    else if (word === "oifname" || word === "oif") rule.oif = next();
    else if (word === "ip") {
      const field = next();
      const value = next();
      const c = value ? cidrOf(value) : null;
      if ((field !== "saddr" && field !== "daddr") || !c) return { bad: field === "saddr" || field === "daddr" ? (value ?? "") : field ?? "" };
      if (field === "saddr") rule.saddr = c;
      else rule.daddr = c;
    } else if (word === "tcp" || word === "udp") {
      if (next() !== "dport") return { bad: tokens[i - 1] ?? word };
      const port = Number(next());
      if (!Number.isInteger(port) || port < 1 || port > 65535) return { bad: tokens[i - 1] ?? "" };
      rule.proto = word;
      rule.dport = port;
    } else if (word === "counter") {
      // counters are accepted and not shown
    } else if (word === "masquerade") {
      if (chain.hook !== "postrouting" || chain.type !== "nat") return { bad: word };
      rule.action = "masquerade";
    } else if (word === "dnat") {
      if (tokens[i] === "ip") i += 1;
      if (next() !== "to") return { bad: tokens[i - 1] ?? word };
      const target = next() ?? "";
      const [addr, portText] = target.split(":");
      const ip = parseIp(addr);
      if (ip === null) return { bad: target };
      if (chain.hook !== "prerouting" && chain.hook !== "output") return { bad: word };
      rule.action = "dnat";
      rule.to = { ip, port: portText ? Number(portText) : undefined };
    } else if (word === "drop" || word === "accept") {
      rule.action = word;
    } else {
      return { bad: word };
    }
  }
  return rule;
}

function syntaxError(line: string, bad: string): NftResult {
  const at = bad ? line.lastIndexOf(bad) : line.length;
  return fail(`Error: syntax error, unexpected ${bad || "end of file"}\n${pointAt(line, Math.max(0, at), Math.max(0, at) + Math.max(1, bad.length))}`);
}

export function nftCommand(device: DeviceState, args: string[]): NftResult {
  const handles = args.includes("-a");
  const rest = args.filter((a) => a !== "-a" && a !== "-n");
  const tokens = tokenize(rest);
  const [verb, object, ...more] = tokens;
  const line = rest.join(" ").replace(/\\;/g, ";");
  if (!verb) return fail("nft: missing command. Try: nft list ruleset");

  if (verb === "list") {
    if (object === "ruleset") return { output: formatRuleset(device, handles), changed: false };
    const at = more[0] === "ip" ? 1 : 0;
    if (object === "table") {
      const table = device.nft.find((t) => t.name === more[at]);
      return table ? { output: formatTable(table, handles), changed: false } : fail(`Error: No such file or directory\n${pointAt(line, 0, line.length)}`);
    }
    return fail(`Error: syntax error, unexpected ${object ?? "end of file"}`);
  }

  if (verb === "flush" && object === "ruleset") {
    device.nft = [];
    return done();
  }

  // Everything else names a table, and rules and chains a chain too.
  const family = more[0] === "ip" ? 1 : 0;
  const tableName = more[family];
  if (!tableName) return syntaxError(line, "");
  const table = device.nft.find((t) => t.name === tableName);
  const missing = () => fail(`Error: Could not process rule: No such file or directory\n${pointAt(line, 0, line.length)}`);

  if (object === "table") {
    if (verb === "add" || verb === "create") {
      addTable(device, tableName);
      return done();
    }
    if (verb === "delete") {
      if (!table) return missing();
      device.nft = device.nft.filter((t) => t !== table);
      return done();
    }
    if (verb === "flush") {
      if (!table) return missing();
      for (const c of table.chains) c.rules = [];
      return done();
    }
  }

  const chainName = more[family + 1];
  if (object === "chain") {
    if (verb === "add" || verb === "create") {
      if (!table) return missing();
      const braceAt = more.indexOf("{");
      if (braceAt < 0) return fail("Error: this lab adds base chains only: nft add chain ip TABLE CHAIN { type filter hook forward priority filter; }");
      const spec = parseChainSpec(more.slice(braceAt));
      if (typeof spec === "string") return fail(spec);
      addChain(table, chainName, spec.type, spec.hook, spec.priority, spec.policy);
      return done();
    }
    const chain = table?.chains.find((c) => c.name === chainName);
    if (!table || !chain) return missing();
    if (verb === "flush") {
      chain.rules = [];
      return done();
    }
    if (verb === "delete") {
      table.chains = table.chains.filter((c) => c !== chain);
      return done();
    }
  }

  if (object === "rule" && (verb === "add" || verb === "insert" || verb === "delete" || verb === "replace")) {
    const chain = table?.chains.find((c) => c.name === chainName);
    if (!table || !chain) return missing();
    const body = more.slice(family + 2);
    if (verb === "delete" || verb === "replace") {
      if (body[0] !== "handle" || body[1] === undefined) return syntaxError(line, body[0] ?? "");
      const at = chain.rules.findIndex((r) => r.handle === Number(body[1]));
      if (at < 0) return fail(`Error: Could not process rule: No such file or directory\n${pointAt(line, 0, line.length)}`);
      if (verb === "delete") {
        chain.rules.splice(at, 1);
        return done();
      }
      const parsed = parseRule(body.slice(2), chain);
      if ("bad" in parsed) return syntaxError(line, parsed.bad);
      chain.rules[at] = { ...parsed, handle: chain.rules[at].handle };
      return done();
    }
    const parsed = parseRule(body, chain);
    if ("bad" in parsed) return syntaxError(line, parsed.bad);
    addRule(table, chain, parsed, verb === "insert" ? "start" : "end");
    return done();
  }

  return fail(`Error: syntax error, unexpected ${object ?? "end of file"}`);
}

