"use client";

// The network lab board. The learner picks a device on the map, types real
// commands into its terminal, and steps through the last packet one hop at a
// time with its headers in the inspector. In fault mode the checks re-run
// after every command that changes the network.

import { useMemo, useRef, useState } from "react";
import type { NetLabSpec } from "../types";
import type { NetCheck, NetCheckResult } from "./checks";
import { describeTarget, runChecks } from "./checks";
import type { CommandResult } from "./commands";
import { prompt, runCommand } from "./commands";
import type { Frame, NetEvent, Run } from "./engine";
import type { DeviceState, NetDeviceSpec, NetTopology, World } from "./model";
import { buildWorld, cloneWorld } from "./model";
import { FaultSolution } from "./NetSolution";
import { formatCidr, formatIp } from "./ip";

interface LogEntry {
  device: string;
  command: string;
  output: string;
}

interface Stepper {
  title: string;
  events: NetEvent[];
  index: number;
}

const NODE_W = 140;
const NODE_H = 60;

const KIND_TONE: Record<NetDeviceSpec["kind"], { box: string; tag: string }> = {
  host: { box: "fill-sky-50 stroke-sky-500 dark:fill-sky-950/60 dark:stroke-sky-400", tag: "fill-sky-700 dark:fill-sky-300" },
  router: { box: "fill-amber-50 stroke-amber-500 dark:fill-amber-950/50 dark:stroke-amber-400", tag: "fill-amber-700 dark:fill-amber-300" },
  switch: { box: "fill-slate-100 stroke-slate-400 dark:fill-slate-800/70 dark:stroke-slate-500", tag: "fill-slate-600 dark:fill-slate-300" },
};

function kindLine(device: DeviceState): string {
  if (device.kind === "switch") return "switch";
  if (device.kind === "router") return device.forwarding ? (device.silent ? "router, quiet" : "router") : "router, forwarding off";
  return device.forwarding ? "host, forwarding on" : "host";
}

function shortEvent(e: NetEvent): string {
  switch (e.kind) {
    case "arp-request":
      return "ARP who has?";
    case "arp-reply":
      return "ARP reply";
    case "arp-ignored":
      return "stays quiet";
    case "arp-failed":
      return "no answer";
    case "switch-learn":
      return "learns MAC";
    case "switch-flood":
      return "floods";
    case "switch-forward":
      return "forwards";
    case "forward":
      return "sends";
    case "frame":
      return "receives";
    case "ttl-expired":
      return "TTL 0";
    case "filtered":
      return "filter drop";
    case "no-route":
    case "no-route-back":
      return "no route";
    case "not-forwarding":
      return "drops";
    case "deliver":
      return "arrived";
    case "local-error":
      return "refuses";
  }
}

function Topology({
  spec,
  world,
  selected,
  focus,
  onSelect,
}: {
  spec: NetTopology;
  world: World;
  selected: string;
  focus?: NetEvent;
  onSelect: (id: string) => void;
}) {
  const pos = new Map(spec.devices.map((d) => [d.id, { x: d.x, y: d.y }]));
  const xs = spec.devices.map((d) => d.x);
  const ys = spec.devices.map((d) => d.y);
  const pad = 90;
  const minX = Math.min(...xs) - NODE_W / 2 - pad;
  const minY = Math.min(...ys) - NODE_H / 2 - pad / 2;
  const width = Math.max(...xs) - Math.min(...xs) + NODE_W + pad * 2;
  const height = Math.max(...ys) - Math.min(...ys) + NODE_H + pad;

  return (
    <svg viewBox={`${minX} ${minY} ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Network map">
      {world.links.map((link, i) => {
        const a = pos.get(link.a.dev);
        const b = pos.get(link.b.dev);
        if (!a || !b) return null;
        const aUp = world.devices[link.a.dev]?.ifaces.find((f) => f.name === link.a.iface)?.up ?? false;
        const bUp = world.devices[link.b.dev]?.ifaces.find((f) => f.name === link.b.iface)?.up ?? false;
        const live = focus?.link === i;
        return (
          <line
            key={`l${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            strokeWidth={live ? 5 : 2.5}
            strokeDasharray={aUp && bUp ? undefined : "6 6"}
            className={live ? "stroke-violet-500" : aUp && bUp ? "stroke-slate-400 dark:stroke-slate-500" : "stroke-red-400"}
          />
        );
      })}
      {world.links.flatMap((link, i) =>
        [link.a, link.b].map((end, side) => {
          const self = pos.get(end.dev);
          const other = pos.get((side === 0 ? link.b : link.a).dev);
          const device = world.devices[end.dev];
          if (!self || !other || !device || device.kind === "switch") return null;
          const iface = device.ifaces.find((f) => f.name === end.iface);
          const dx = other.x - self.x;
          const dy = other.y - self.y;
          const len = Math.hypot(dx, dy) || 1;
          const reach = Math.min(len / 2, Math.abs(dx) / len > 0.6 ? NODE_W / 2 + 66 : NODE_H / 2 + 34);
          // Offset each label to the left of the line as seen from its own
          // device, so the two ends of one cable sit on opposite sides and
          // never collide on a short link.
          const nx = dy / len;
          const ny = -dx / len;
          const x = self.x + (dx / len) * reach + nx * 20;
          const y = self.y + (dy / len) * reach + ny * 20;
          return (
            <g key={`i${i}-${side}`} className="pointer-events-none">
              <text x={x} y={y - 6} textAnchor="middle" className="fill-muted-foreground font-mono text-[12px]">
                {end.iface}
              </text>
              <text x={x} y={y + 9} textAnchor="middle" className="fill-foreground font-mono text-[14px] font-medium">
                {iface?.addrs[0] ? formatCidr(iface.addrs[0]) : "no address"}
              </text>
            </g>
          );
        }),
      )}
      {spec.devices.map((d) => {
        const device = world.devices[d.id];
        const tone = KIND_TONE[d.kind];
        const isFocus = focus?.device === d.id;
        const isSelected = selected === d.id;
        return (
          <g
            key={d.id}
            role="button"
            tabIndex={0}
            aria-label={d.kind === "switch" ? `${d.label} (no terminal)` : `${d.label}, open its terminal`}
            onClick={() => onSelect(d.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(d.id)}
            className="cursor-pointer outline-none"
          >
            {isFocus && (
              <rect x={d.x - NODE_W / 2 - 6} y={d.y - NODE_H / 2 - 6} width={NODE_W + 12} height={NODE_H + 12} rx={16} className="fill-violet-500/15 stroke-violet-500" strokeWidth={2} />
            )}
            <rect
              x={d.x - NODE_W / 2}
              y={d.y - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx={12}
              strokeWidth={isSelected ? 3 : 1.5}
              className={tone.box}
            />
            <text x={d.x} y={d.y - 3} textAnchor="middle" className="fill-foreground text-[16px] font-semibold">
              {d.label}
            </text>
            <text x={d.x} y={d.y + 16} textAnchor="middle" className={`${tone.tag} text-[11px] uppercase tracking-wide`}>
              {device ? kindLine(device) : d.kind}
            </text>
            {isFocus && focus && (
              <g>
                <rect x={d.x - 48} y={d.y - NODE_H / 2 - 30} width={96} height={20} rx={10} className="fill-violet-600" />
                <text x={d.x} y={d.y - NODE_H / 2 - 16} textAnchor="middle" className="fill-white text-[10px] font-semibold">
                  {shortEvent(focus)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Inspector({ frame }: { frame?: Frame }) {
  if (!frame) return <p className="text-xs text-muted-foreground">Step to a frame on a cable to see its headers.</p>;
  const rows: Array<[string, string]> = [
    ["Destination MAC", frame.dstMac === "ff:ff:ff:ff:ff:ff" ? "ff:ff:ff:ff:ff:ff (everyone)" : frame.dstMac],
    ["Source MAC", frame.srcMac],
  ];
  if (frame.arp) {
    rows.push(["Type", `ARP ${frame.arp.op}`], ["Sender", `${formatIp(frame.arp.senderIp)} at ${frame.arp.senderMac}`], ["Asking for", formatIp(frame.arp.targetIp)]);
  }
  if (frame.ip) {
    rows.push(["Type", `IPv4, ${frame.ip.kind}`], ["Source IP", formatIp(frame.ip.src)], ["Destination IP", formatIp(frame.ip.dst)], ["TTL", String(frame.ip.ttl)]);
    if (frame.ip.dport) rows.push(["Ports", `${frame.ip.sport ?? "?"} to ${frame.ip.dport}`]);
  }
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="break-all">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Checks({ checks, results }: { checks: NetCheck[]; results: NetCheckResult[] }) {
  const passed = results.filter((r) => r.pass).length;
  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Checks</h3>
        <span className={`text-xs font-semibold ${passed === checks.length ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {passed} of {checks.length} pass
        </span>
      </div>
      <ul className="space-y-1.5">
        {checks.map((c, i) => {
          const r = results[i];
          return (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <span
                aria-label={r?.pass ? "passes" : "fails"}
                className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${r?.pass ? "bg-emerald-500" : "bg-red-500"}`}
              >
                {r?.pass ? "✓" : "✗"}
              </span>
              <span>
                {c.label}
                <span className="block font-mono text-[11px] text-muted-foreground">
                  {c.from} {c.kind === "tcp" ? "connects to" : "pings"} {describeTarget(c)}: {r?.reached ? "reached" : "not reached"}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function NetBoard({ spec }: { spec: NetLabSpec }) {
  const topology = spec.topology as NetTopology;
  const shells = topology.devices.filter((d) => d.kind !== "switch");
  const [world, setWorld] = useState<World>(() => buildWorld(topology));
  const [selected, setSelected] = useState<string>(spec.startDevice ?? shells[0]?.id ?? "");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [line, setLine] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyAt, setHistoryAt] = useState(-1);
  const [stepper, setStepper] = useState<Stepper | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const results = useMemo(() => (spec.checks ? runChecks(world, spec.checks) : []), [world, spec.checks]);
  const allPass = spec.checks ? results.every((r) => r.pass) : false;
  const focus = stepper ? stepper.events[stepper.index] : undefined;
  const device = world.devices[selected];

  function run(command: string) {
    const text = command.trim();
    if (!text) return;
    if (text === "clear") {
      setLog((l) => l.filter((e) => e.device !== selected));
      return;
    }
    const next = cloneWorld(world);
    const result: CommandResult = runCommand(next, selected, text);
    setWorld(next);
    setLog((l) => [...l, { device: selected, command: text, output: result.output }]);
    setHistory((h) => [...h, text]);
    setHistoryAt(-1);
    if (result.run && result.run.events.length > 0) setStepper(stepperFor(text, result.run));
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight }));
  }

  function applySolution() {
    const steps = spec.solution?.steps ?? [];
    const next = cloneWorld(world);
    const entries = steps.map((s) => ({ device: s.device, command: s.command, output: runCommand(next, s.device, s.command).output }));
    setWorld(next);
    setLog((l) => [...l, ...entries]);
    setStepper(null);
  }

  function stepperFor(title: string, r: Run): Stepper {
    return { title, events: r.events, index: 0 };
  }

  function reset() {
    setWorld(buildWorld(topology));
    setLog([]);
    setStepper(null);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(line);
      setLine("");
    } else if (e.key === "ArrowUp" && history.length > 0) {
      e.preventDefault();
      const at = historyAt < 0 ? history.length - 1 : Math.max(0, historyAt - 1);
      setHistoryAt(at);
      setLine(history[at]);
    } else if (e.key === "ArrowDown" && historyAt >= 0) {
      e.preventDefault();
      const at = historyAt + 1;
      setHistoryAt(at >= history.length ? -1 : at);
      setLine(at >= history.length ? "" : history[at]);
    }
  }

  const mine = log.filter((e) => e.device === selected);

  return (
    <div className="@container w-full rounded-2xl border border-border bg-background p-3">
      {spec.tasks && spec.tasks.length > 0 && (
        <ol className="mb-3 list-decimal space-y-1 rounded-xl bg-muted/50 px-8 py-2 text-sm">
          {spec.tasks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      )}
      {spec.mode === "fault" && allPass && (
        <div role="status" className="mb-3 rounded-xl border border-emerald-500 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          Every check passes. The network works.
        </div>
      )}
      <div className="mb-3 overflow-x-auto rounded-xl border border-border bg-card p-2">
        <div className="min-w-[36rem]">
          <Topology spec={topology} world={world} selected={selected} focus={focus} onSelect={(id) => world.devices[id]?.kind !== "switch" && setSelected(id)} />
        </div>
      </div>
      <div className="grid gap-3 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          {stepper && (
            <section className="rounded-xl border border-border bg-card p-3" aria-label="Packet steps">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">
                  Step through <code className="font-mono text-xs">{stepper.title}</code>
                </h3>
                <span className="text-xs text-muted-foreground">
                  first packet, step {stepper.index + 1} of {stepper.events.length}
                </span>
                <div className="ml-auto flex gap-1">
                  <button
                    type="button"
                    className="rounded-lg border border-border px-2 py-1 text-xs disabled:opacity-40"
                    disabled={stepper.index === 0}
                    onClick={() => setStepper({ ...stepper, index: stepper.index - 1 })}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-violet-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-40"
                    disabled={stepper.index >= stepper.events.length - 1}
                    onClick={() => setStepper({ ...stepper, index: stepper.index + 1 })}
                  >
                    Next hop
                  </button>
                </div>
              </div>
              <p className="mb-3 text-sm">{focus?.text}</p>
              <Inspector frame={focus?.frame} />
            </section>
          )}
          {spec.checks && <Checks checks={spec.checks} results={results} />}
          {spec.solution?.steps && <FaultSolution solution={spec.solution} onApply={applySolution} />}
        </div>
        <div className="flex min-h-[22rem] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100">
          <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 px-2 py-1.5">
            {shells.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelected(d.id)}
                className={`rounded-md px-2 py-0.5 font-mono text-xs ${d.id === selected ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-800"}`}
              >
                {d.id}
              </button>
            ))}
            <button type="button" onClick={reset} className="ml-auto rounded-md px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800">
              Reset network
            </button>
          </div>
          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-relaxed" aria-live="polite">
            {mine.length === 0 && <p className="text-zinc-500">Type a command, for example ip addr, then press Enter. Type help for the list.</p>}
            {mine.map((e, i) => (
              <div key={i} className="mb-2">
                <div>
                  <span className="text-emerald-400">{device ? prompt(device) : ""}</span>
                  {e.command}
                </div>
                {e.output && <pre className="whitespace-pre-wrap break-words text-zinc-200">{e.output}</pre>}
              </div>
            ))}
          </div>
          {spec.suggested && spec.suggested.length > 0 && (
            <div className="flex flex-wrap gap-1 border-t border-zinc-800 px-2 py-1.5">
              {spec.suggested.map((s) => (
                <button key={s} type="button" onClick={() => run(s)} className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-200 hover:bg-zinc-700">
                  {s}
                </button>
              ))}
            </div>
          )}
          <label className="flex items-center gap-1 border-t border-zinc-800 px-3 py-2 font-mono text-[12px]">
            <span className="text-emerald-400">{device ? prompt(device) : ""}</span>
            <input
              value={line}
              onChange={(e) => setLine(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label={`Command for ${selected}`}
              className="min-w-0 flex-1 bg-transparent text-zinc-100 outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

