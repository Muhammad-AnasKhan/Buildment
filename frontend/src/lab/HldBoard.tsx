"use client";

// The interactive HLD lab board. Three panels, like the products that do this
// well: a component drawer, a React Flow canvas of the request path, and a live
// score panel. Add components, pick each one's size and count, change the load,
// and the tiered-architecture model recomputes utilisation, p99, availability
// and cost and scores them against the lab's targets. The static board stays as
// the no-JS fallback; this hydrates over it.

import { useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ComponentKind } from "./catalog";
import { COMPONENT_CATALOG, SIZE_CATALOG } from "./catalog";
import type { Board, BoardNode, HldLabSpec } from "./types";
import { applied, initialControls, type BoardControls } from "./hld-board-model";
import { runTieredModel, type ModelResult } from "@/lab/tiered-architecture";

const ICON: Partial<Record<ComponentKind, string>> = {
  client: "○",
  dns: "◈",
  cdn: "☁",
  "load-balancer": "⇉",
  "api-gateway": "‖",
  "app-server": "▣",
  cache: "⚡",
  database: "▽",
  queue: "☰",
  worker: "⚙",
  "object-storage": "▦",
};

const TYPE_LABEL: Partial<Record<ComponentKind, string>> = {
  client: "User",
  cdn: "Edge cache",
  "load-balancer": "LB",
  "api-gateway": "Gateway",
  "app-server": "Compute",
  cache: "Redis",
  database: "PostgreSQL",
  queue: "Broker",
  worker: "Worker",
  "object-storage": "S3",
};

const PALETTE: { group: string; kinds: ComponentKind[] }[] = [
  { group: "Edge", kinds: ["client", "cdn", "load-balancer", "api-gateway"] },
  { group: "Compute", kinds: ["app-server", "worker"] },
  { group: "Data", kinds: ["cache", "database", "queue", "object-storage"] },
];

function utilClass(u: number): string {
  if (u < 0.7) return "bg-emerald-500";
  if (u < 0.9) return "bg-amber-500";
  return "bg-red-500";
}
function utilText(u: number): string {
  if (u < 0.7) return "text-emerald-600 dark:text-emerald-400";
  if (u < 0.9) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

type TierData = { kind: ComponentKind; size?: string; count: number; util: number | null; selected: boolean };

function TierNode({ data }: NodeProps<Node<TierData>>) {
  const def = COMPONENT_CATALOG[data.kind];
  const u = data.util;
  return (
    <div
      className={`w-[150px] rounded-xl border bg-card px-3 py-2 text-card-foreground shadow-sm ${
        data.selected ? "border-blue-500 ring-1 ring-blue-500/40" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-border" />
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-base text-muted-foreground">{ICON[data.kind]}</span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium leading-tight">{def.label}</div>
          <div className="truncate text-[10px] text-muted-foreground">{TYPE_LABEL[data.kind]}</div>
        </div>
      </div>
      {data.size ? (
        <div className="mt-1 text-[10px] text-muted-foreground">
          {data.size.replace("compute-", "").replace("memory-", "").replace("general-", "")} &middot; x{data.count}
        </div>
      ) : null}
      {u != null ? (
        <>
          <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${utilClass(u)}`} style={{ width: `${Math.min(Math.round(u * 100), 100)}%` }} />
          </div>
          <div className={`mt-1 text-[10px] font-medium ${utilText(u)}`}>{Math.round(u * 100)}% busy</div>
        </>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-border" />
    </div>
  );
}

const nodeTypes = { tier: TierNode };

export function HldBoard({ spec }: { spec: HldLabSpec }) {
  const start: Board = spec.startingBoard ?? { nodes: [], edges: [] };
  const targets = spec.levels[0]?.targets ?? {};

  const [order, setOrder] = useState<BoardNode[]>(() => start.nodes.map((n) => ({ ...n })));
  const [controls, setControls] = useState<BoardControls>(() => initialControls(start, spec.levels[0]?.load ?? 1000));
  const [selected, setSelected] = useState<string | null>(
    () => start.nodes.find((n) => COMPONENT_CATALOG[n.kind].properties.some((p) => p.type === "size"))?.id ?? start.nodes[0]?.id ?? null,
  );

  const board: Board = useMemo(
    () => ({ nodes: order, edges: order.slice(1).map((n, i) => ({ from: order[i].id, to: n.id })) }),
    [order],
  );
  const result: ModelResult = useMemo(
    () => runTieredModel(applied(board, controls), controls.load, targets),
    [board, controls, targets],
  );

  const rfNodes: Node<TierData>[] = order.map((n, i) => {
    const tier = result.tiers.find((t) => t.id === n.id);
    const cfg = controls.perNode[n.id] ?? {};
    return {
      id: n.id,
      type: "tier",
      position: { x: 0, y: i * 112 },
      width: 150,
      height: 96,
      data: {
        kind: n.kind,
        size: typeof cfg.size === "string" ? cfg.size : undefined,
        count: typeof cfg.count === "number" ? cfg.count : typeof cfg.replicas === "number" ? cfg.replicas : 1,
        util: tier ? tier.utilisation : null,
        selected: selected === n.id,
      },
      draggable: false,
    };
  });
  const rfEdges: Edge[] = board.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    animated: true,
    style: { stroke: "var(--color-blue-500, #3b82f6)" },
  }));

  function addKind(kind: ComponentKind) {
    const id = `${kind}-${Date.now().toString(36)}`;
    const cfg: Record<string, number | string> = {};
    for (const p of COMPONENT_CATALOG[kind].properties) cfg[p.id] = p.default;
    const insertAt = Math.max(1, order.findIndex((n) => n.kind === "database"));
    const at = insertAt < 0 ? order.length : insertAt;
    const next = [...order];
    next.splice(at, 0, { id, kind, x: 0, y: 0 });
    setOrder(next);
    setControls((c) => ({ ...c, perNode: { ...c.perNode, [id]: cfg } }));
    setSelected(id);
  }
  function removeNode(id: string) {
    setOrder((o) => o.filter((n) => n.id !== id));
    setSelected(null);
  }
  function setProp(id: string, key: string, value: number | string) {
    setControls((c) => ({ ...c, perNode: { ...c.perNode, [id]: { ...c.perNode[id], [key]: value } } }));
  }

  const sel = selected ? order.find((n) => n.id === selected) : null;
  const selDef = sel ? COMPONENT_CATALOG[sel.kind] : null;
  const selCfg = selected ? controls.perNode[selected] ?? {} : {};

  const Stat = ({ label, value, ok, hint }: { label: string; value: string; ok: boolean; hint: string }) => (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold leading-tight ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-border bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[168px_minmax(0,1fr)_252px]">
        {/* Drawer */}
        <div className="border-b border-border p-3 lg:border-b-0 lg:border-r">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Components</div>
          {PALETTE.map((grp) => (
            <div key={grp.group} className="mb-2">
              <div className="mb-1 text-[10px] font-medium text-muted-foreground">{grp.group}</div>
              {grp.kinds.map((k) => {
                const price = SIZE_CATALOG.find((s) => s.id === COMPONENT_CATALOG[k].properties.find((p) => p.type === "size")?.default);
                return (
                  <button
                    key={k}
                    onClick={() => addKind(k)}
                    className="mb-1 flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left hover:border-blue-400"
                  >
                    <span aria-hidden className="text-sm text-muted-foreground">{ICON[k]}</span>
                    <span className="flex-1 truncate text-[12px] font-medium">{COMPONENT_CATALOG[k].label}</span>
                    {price ? <span className="text-[10px] text-muted-foreground">${price.pricePerHour}/h</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="h-[380px] bg-muted/20">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSelected(n.id)}
            onInit={(instance) => instance.fitView({ padding: 0.2 })}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            proOptions={{ hideAttribution: true }}
            nodesConnectable={false}
            nodesDraggable={false}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
          </ReactFlow>
        </div>

        {/* Score */}
        <div className="border-t border-border p-3 lg:border-l lg:border-t-0">
          <div className="text-base font-semibold">{spec.title}</div>
          <p className="mb-2 text-[12px] text-muted-foreground">{spec.scenario}</p>

          <label className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>Offered load</span>
            <span className="font-medium text-foreground">{controls.load.toLocaleString()} req/s</span>
          </label>
          <input
            type="range"
            min={500}
            max={12000}
            step={500}
            value={controls.load}
            onChange={(e) => setControls((c) => ({ ...c, load: Number(e.target.value) }))}
            className="mb-3 w-full accent-blue-600"
          />

          {sel && selDef ? (
            <div className="mb-3 rounded-lg border border-border p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[12px] font-medium">{selDef.label}</span>
                {sel.kind !== "client" ? (
                  <button onClick={() => removeNode(sel.id)} className="text-[11px] text-muted-foreground hover:text-red-600">remove</button>
                ) : null}
              </div>
              {selDef.properties.map((p) =>
                p.type === "size" ? (
                  <label key={p.id} className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-muted-foreground">{p.label}</span>
                    <select
                      value={String(selCfg[p.id] ?? p.default)}
                      onChange={(e) => setProp(sel.id, p.id, e.target.value)}
                      className="rounded border border-border bg-card px-1 py-0.5 text-[11px]"
                    >
                      {SIZE_CATALOG.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                    </select>
                  </label>
                ) : p.type === "count" ? (
                  <label key={p.id} className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-muted-foreground">{p.label}</span>
                    <input
                      type="number"
                      min={p.min}
                      max={p.max}
                      value={Number(selCfg[p.id] ?? p.default)}
                      onChange={(e) => setProp(sel.id, p.id, Number(e.target.value))}
                      className="w-14 rounded border border-border bg-card px-1 py-0.5 text-[11px]"
                    />
                  </label>
                ) : p.type === "ratio" ? (
                  <label key={p.id} className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-muted-foreground">{p.label}</span>
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={Number(selCfg[p.id] ?? p.default)}
                      onChange={(e) => setProp(sel.id, p.id, Number(e.target.value))}
                      className="w-20 accent-blue-600"
                    />
                  </label>
                ) : null,
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Capacity" value={`${result.capacityCeiling.toLocaleString()}/s`} ok={result.pass.rps} hint={targets.rps ? `need ${targets.rps.toLocaleString()}` : "no target"} />
            <Stat label="p99" value={`${result.p99Ms} ms`} ok={result.pass.p99} hint={targets.p99Ms ? `under ${targets.p99Ms}` : "no target"} />
            <Stat label="Availability" value={`${(result.availability * 100).toFixed(2)}%`} ok={result.pass.availability} hint={targets.availability ? `need ${(targets.availability * 100).toFixed(1)}%` : "no target"} />
            <Stat label="Cost" value={`$${result.costPerHour.toFixed(2)}/h`} ok={result.pass.budget} hint={targets.budgetPerHour ? `budget $${targets.budgetPerHour}` : "no target"} />
          </div>

          <p className={`mt-2 text-[12px] font-medium ${result.allPass ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {result.allPass ? "All targets green. Level passed." : verdict(result)}
          </p>
        </div>
      </div>
    </div>
  );
}

function verdict(r: ModelResult): string {
  if (!r.pass.rps) return "Capacity fails: a tier cannot serve the target load.";
  if (!r.pass.p99) return "p99 fails: a tier is past the 70% knee.";
  if (!r.pass.availability) return "Availability fails: add redundancy.";
  return "Over budget: try fewer or smaller instances.";
}
