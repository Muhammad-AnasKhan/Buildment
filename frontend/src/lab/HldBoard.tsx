"use client";

// The interactive HLD lab board: a small architecture editor. Drag components
// from the drawer onto the canvas, link them by dragging from one node's bottom
// dot to another's top dot (only links the catalog allows), delete nodes or
// links, double-click a component to take it down, and the tiered-architecture
// model routes the load along your links and scores utilisation, p99,
// availability and cost against the lab's targets.

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  ConnectionMode,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ComponentKind } from "./catalog";
import { COMPONENT_CATALOG, SIZE_CATALOG, canConnect, isComponentKind } from "./catalog";
import type { Board, HldLabSpec } from "./types";
import { initialControls, type BoardControls, type NodeConfig } from "./hld-board-model";
import { runTieredModel, type ModelResult, type TierLoad } from "@/lab/tiered-architecture";

const ICON: Partial<Record<ComponentKind, string>> = {
  client: "○", dns: "◈", cdn: "☁", "load-balancer": "⇉",
  "api-gateway": "‖", "app-server": "▣", cache: "⚡", database: "▽",
  queue: "☰", worker: "⚙", "object-storage": "▦",
};
const TYPE_LABEL: Partial<Record<ComponentKind, string>> = {
  client: "User", cdn: "Edge cache", "load-balancer": "LB", "api-gateway": "Gateway",
  "app-server": "Compute", cache: "Redis", database: "PostgreSQL", queue: "Broker",
  worker: "Worker", "object-storage": "S3",
};
// One color per kind of component. A component's chip, top bar and dots use it,
// and so does every link that leaves it, so a violet line always means "from a
// load balancer". Red is kept for trouble: down, unreachable or overloaded.
const KIND_COLOR: Record<ComponentKind, string> = {
  client: "#64748b",
  dns: "#78716c",
  cdn: "#0ea5e9",
  "load-balancer": "#8b5cf6",
  "api-gateway": "#c026d3",
  "app-server": "#3b82f6",
  worker: "#6366f1",
  cache: "#f59e0b",
  queue: "#14b8a6",
  database: "#10b981",
  "object-storage": "#84cc16",
};
const chipStyle = (kind: ComponentKind) => ({ backgroundColor: `${KIND_COLOR[kind]}22`, color: KIND_COLOR[kind] });
const PALETTE: { group: string; kinds: ComponentKind[] }[] = [
  { group: "Edge", kinds: ["client", "cdn", "load-balancer", "api-gateway"] },
  { group: "Compute", kinds: ["app-server", "worker"] },
  { group: "Data", kinds: ["cache", "database", "queue", "object-storage"] },
];

const DRAG_TYPE = "application/x-lab-kind";
const RED = "#ef4444";
const NODE_W = 158;
const NODE_H = 92;

const utilBar = (u: number) => (u < 0.7 ? "bg-emerald-500" : u < 0.9 ? "bg-amber-500" : "bg-red-500");
const utilText = (u: number) =>
  u < 0.7 ? "text-emerald-600 dark:text-emerald-400" : u < 0.9 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
const okText = (ok: boolean) => (ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400");

type TierData = { kind: ComponentKind };
type Ctx = {
  tiers: Map<string, TierLoad>;
  cfg: Record<string, NodeConfig>;
  reachable: Set<string>;
  selected: string | null;
  pulse: string | null;
  /** While hovering, the components related to the hovered one; others dim. */
  focus: Set<string> | null;
};
const BoardCtx = createContext<Ctx | null>(null);

const HANDLE = "!h-3.5 !w-3.5 !border-2 !border-card transition-transform hover:!scale-150 after:absolute after:-inset-3 after:rounded-full after:content-['']";

function TierNode({ id, data }: NodeProps<Node<TierData>>) {
  const ctx = useContext(BoardCtx)!;
  const def = COMPONENT_CATALOG[data.kind];
  const cfg = ctx.cfg[id] ?? {};
  const tier = ctx.tiers.get(id);
  const down = Boolean(cfg.down);
  const linked = ctx.reachable.has(id);
  const size = typeof cfg.size === "string" ? cfg.size.replace(/^(compute|memory|general)-/, "") : null;
  const count = typeof cfg.count === "number" ? cfg.count : typeof cfg.replicas === "number" ? cfg.replicas : typeof cfg.zones === "number" ? cfg.zones : null;
  const u = tier && linked && !down ? tier.utilisation : null;

  const frame = down
    ? "border-red-500 bg-red-50 dark:bg-red-500/10"
    : !linked
      ? "border-dashed border-muted-foreground/40 bg-card"
      : ctx.selected === id
        ? "border-blue-500 bg-card ring-2 ring-blue-500/30"
        : "border-border bg-card";

  const color = KIND_COLOR[data.kind];
  const dimmed = ctx.focus != null && !ctx.focus.has(id);

  return (
    <div
      className={`w-[158px] rounded-xl border px-3 py-2 text-card-foreground transition-[box-shadow,opacity] duration-200 ${frame} ${
        ctx.pulse === id ? "shadow-[0_0_0_4px_rgba(59,130,246,0.4)]" : "shadow-sm"
      } ${dimmed ? "opacity-30" : ""}`}
      style={down ? undefined : { borderTopColor: color, borderTopWidth: 3 }}
    >
      <Handle type="target" position={Position.Top} className={HANDLE} style={{ backgroundColor: color }} />
      <div className="flex items-center gap-2">
        <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[13px] ${down ? "opacity-50" : ""}`} style={chipStyle(data.kind)}>{ICON[data.kind]}</span>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-[13px] font-medium leading-tight ${down ? "text-red-600 line-through dark:text-red-400" : ""}`}>{def.label}</div>
          <div className="truncate text-[10px] text-muted-foreground">
            {TYPE_LABEL[data.kind]}{size ? ` · ${size}` : ""}{count != null && size ? ` x${count}` : ""}
          </div>
        </div>
      </div>
      {down ? (
        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">DOWN</div>
      ) : !linked ? (
        <div className="mt-2 text-[10px] text-muted-foreground">Not linked: link it into the path</div>
      ) : u != null ? (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${utilBar(u)} transition-all`} style={{ width: `${Math.min(Math.round(u * 100), 100)}%` }} />
          </div>
          <span className={`text-[10px] font-semibold tabular-nums ${utilText(u)}`}>{Math.round(u * 100)}%</span>
        </div>
      ) : null}
      <Handle type="source" position={Position.Bottom} className={HANDLE} style={{ backgroundColor: color }} />
    </div>
  );
}
const nodeTypes = { tier: TierNode };

type FlowData = { color: string; state: "live" | "hot" | "dead"; flow: number; dim: boolean };

/**
 * A link drawn in the color of the component it leaves, in layers: a wide
 * invisible stroke that is easy to grab, a soft glow, the dashed line with its
 * arrowhead (marching while traffic flows), and the request rate it carries.
 */
function FlowEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected, data }: EdgeProps<Edge<FlowData>>) {
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 14 });
  const state = data?.state ?? "live";
  const color = state === "live" ? data?.color ?? "#3b82f6" : RED;
  const fade = (data?.dim ? 0.15 : 1) * (state === "dead" ? 0.6 : 1);
  return (
    <>
      <path d={path} fill="none" stroke={color} strokeWidth={selected ? 11 : 7} opacity={0.16 * fade} style={{ filter: "blur(3px)" }} aria-hidden />
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        interactionWidth={22}
        className={state === "dead" ? undefined : "lab-edge-live"}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : state === "hot" ? 2.5 : 2,
          strokeDasharray: state === "dead" ? "4 5" : "8 5",
          opacity: fade,
          transition: "opacity 0.2s ease, stroke 0.3s ease",
        }}
      />
      {state !== "dead" && data && data.flow > 0 ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute rounded-full border bg-card px-1.5 py-px text-[10px] font-semibold tabular-nums shadow-sm transition-opacity"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, color, borderColor: `${color}55`, opacity: fade }}
          >
            {Math.round(data.flow).toLocaleString()}/s
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
const edgeTypes = { flow: FlowEdge };

const EDGE_CSS = `
@keyframes lab-edge-flow { from { stroke-dashoffset: 26; } to { stroke-dashoffset: 0; } }
.lab-edge-live { animation: lab-edge-flow 0.9s linear infinite; }
@media (prefers-reduced-motion: reduce) { .lab-edge-live { animation: none; } }
`;

function Stat({ label, value, ok, hint }: { label: string; value: string; ok: boolean; hint: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-[19px] font-semibold leading-tight tabular-nums ${okText(ok)}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function defaultsFor(kind: ComponentKind): NodeConfig {
  const cfg: NodeConfig = {};
  for (const p of COMPONENT_CATALOG[kind].properties) cfg[p.id] = p.default;
  return cfg;
}

function Editor({ spec }: { spec: HldLabSpec }) {
  const start: Board = spec.startingBoard ?? { nodes: [], edges: [] };
  const targets = useMemo(() => spec.levels[0]?.targets ?? {}, [spec]);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const seq = useRef(0);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TierData>>(
    start.nodes.map((n, i) => ({ id: n.id, type: "tier", position: { x: 80, y: i * 175 }, width: NODE_W, height: NODE_H, data: { kind: n.kind } })),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    start.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to })),
  );
  const [controls, setControls] = useState<BoardControls>(() => initialControls(start, spec.levels[0]?.load ?? 1000));
  const [selected, setSelected] = useState<string | null>(
    () => start.nodes.find((n) => COMPONENT_CATALOG[n.kind].properties.some((p) => p.type === "size"))?.id ?? null,
  );
  const [pulse, setPulse] = useState<string | null>(null);

  // The model only cares about structure and config, not node positions, so key it on those.
  const nodeKey = nodes.map((n) => `${n.id}:${n.data.kind}`).join("|");
  const edgeKey = edges.map((e) => `${e.source}>${e.target}`).join("|");
  const board: Board = useMemo(
    () => ({
      nodes: nodes.map((n) => ({ id: n.id, kind: n.data.kind, x: 0, y: 0, props: controls.perNode[n.id] })),
      edges: edges.map((e) => ({ from: e.source, to: e.target })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeKey, edgeKey, controls],
  );
  const result: ModelResult = useMemo(() => runTieredModel(board, controls.load, targets), [board, controls.load, targets]);

  const reachable = useMemo(() => {
    const seen = new Set<string>();
    const next = new Map<string, string[]>();
    for (const e of board.edges) next.set(e.from, [...(next.get(e.from) ?? []), e.to]);
    const isDown = (id: string) => Boolean(controls.perNode[id]?.down);
    const queue = board.nodes.filter((n) => n.kind === "client" && !isDown(n.id)).map((n) => n.id);
    queue.forEach((id) => seen.add(id));
    while (queue.length) {
      const id = queue.shift()!;
      for (const to of next.get(id) ?? []) if (!isDown(to) && !seen.has(to)) { seen.add(to); queue.push(to); }
    }
    return seen;
  }, [board, controls.perNode]);

  // Hovering a component or link focuses it and its direct neighbours; the rest dims.
  const [hover, setHover] = useState<{ node?: string; edge?: string } | null>(null);
  const focus = useMemo(() => {
    if (!hover) return null;
    const ids = new Set<string>();
    for (const e of edges) {
      if (hover.edge === e.id || hover.node === e.source || hover.node === e.target) {
        ids.add(e.source);
        ids.add(e.target);
      }
    }
    if (hover.node) ids.add(hover.node);
    return ids;
  }, [hover, edges]);

  const ctx: Ctx = useMemo(
    () => ({ tiers: new Map(result.tiers.map((t) => [t.id, t])), cfg: controls.perNode, reachable, selected, pulse, focus }),
    [result, controls.perNode, reachable, selected, pulse, focus],
  );

  const shownEdges: Edge<FlowData>[] = edges.map((e) => {
    const live = reachable.has(e.source) && reachable.has(e.target);
    const target = result.tiers.find((t) => t.id === e.target);
    const state: FlowData["state"] = !live ? "dead" : target && target.utilisation >= 0.9 ? "hot" : "live";
    const sourceKind = nodes.find((n) => n.id === e.source)?.data.kind ?? "app-server";
    const color = state === "live" ? KIND_COLOR[sourceKind] : RED;
    const related = !hover || hover.edge === e.id || hover.node === e.source || hover.node === e.target;
    return {
      ...e,
      type: "flow",
      data: { color, state, flow: result.edgeFlows[`${e.source}>${e.target}`] ?? 0, dim: !related },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 18, height: 18 },
    };
  });
  const kindsOnBoard = [...new Set(nodes.map((n) => n.data.kind))];

  function addNode(kind: ComponentKind, position?: { x: number; y: number }) {
    seq.current += 1;
    const id = `${kind}-added-${seq.current}`;
    setNodes((ns) => [
      ...ns,
      { id, type: "tier", position: position ?? { x: 300, y: 20 + (ns.length % 4) * 110 }, width: NODE_W, height: NODE_H, data: { kind } },
    ]);
    setControls((c) => ({ ...c, perNode: { ...c.perNode, [id]: defaultsFor(kind) } }));
    setSelected(id);
  }
  function removeNode(id: string) {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    setSelected(null);
  }
  const setProp = (id: string, key: string, value: number | string) =>
    setControls((c) => ({ ...c, perNode: { ...c.perNode, [id]: { ...c.perNode[id], [key]: value } } }));
  const toggleDown = (id: string) => setProp(id, "down", controls.perNode[id]?.down ? 0 : 1);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData(DRAG_TYPE);
    if (!kind || !isComponentKind(kind)) return;
    const p = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNode(kind, { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 });
  };

  // Links can be drawn between any two dots in either direction; we orient each one
  // along the request flow the catalog allows, and refuse pairs that never talk.
  const kindOf = (id?: string | null) => nodes.find((n) => n.id === id)?.data.kind;
  const orient = (a?: string | null, b?: string | null) => {
    const ka = kindOf(a);
    const kb = kindOf(b);
    if (!a || !b || !ka || !kb || a === b) return null;
    if (canConnect(ka, kb)) return { source: a, target: b };
    if (canConnect(kb, ka)) return { source: b, target: a };
    return null;
  };
  const alreadyLinked = (s: string, t: string) =>
    edges.some((e) => (e.source === s && e.target === t) || (e.source === t && e.target === s));
  const isValidConnection = (c: Connection | Edge) => {
    const o = orient(c.source, c.target);
    return o != null && !alreadyLinked(o.source, o.target);
  };
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  };
  const connect = (c: Connection) => {
    const o = orient(c.source, c.target);
    if (!o || alreadyLinked(o.source, o.target)) return;
    setEdges((es) => [...es, { id: `${o.source}-${o.target}`, source: o.source, target: o.target }]);
  };
  const explainFailedLink = (from?: string | null, to?: string | null) => {
    const ka = kindOf(from);
    const kb = kindOf(to);
    if (!ka || !kb || from === to) return;
    const a = COMPONENT_CATALOG[ka].label;
    const b = COMPONENT_CATALOG[kb].label;
    flash(orient(from, to) ? `${a} and ${b} are already linked.` : `${a} and ${b} can't be linked: requests never flow between them.`);
  };

  const run = () => {
    const order = [...reachable].filter((id) => nodes.some((n) => n.id === id));
    let i = 0;
    setPulse(order[0] ?? null);
    const timer = setInterval(() => {
      i += 1;
      if (i >= order.length) { clearInterval(timer); setPulse(null); } else setPulse(order[i]);
    }, 260);
  };

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.2 }), 50);
    return () => clearTimeout(t);
  }, [fitView]);

  const sel = selected ? nodes.find((n) => n.id === selected) : null;
  const selDef = sel ? COMPONENT_CATALOG[sel.data.kind] : null;
  const selCfg = selected ? controls.perNode[selected] ?? {} : {};

  const missions: [string, boolean][] = [
    [`Serve ${targets.rps?.toLocaleString() ?? "the"} req/s`, result.pass.rps],
    [`p99 under ${targets.p99Ms ?? "target"} ms`, result.pass.p99],
    [`${targets.availability ? (targets.availability * 100).toFixed(1) : "99.9"}% available`, result.pass.availability],
    ["Within budget", result.pass.budget],
  ];

  return (
    <BoardCtx.Provider value={ctx}>
      <style>{EDGE_CSS}</style>
      <div className="not-prose @container my-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">LVL 1</span>
            <span className="text-[13px] font-medium">{spec.title}</span>
          </div>
          <button onClick={run} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-transform hover:bg-emerald-700 active:scale-95">
            <span aria-hidden>{"▶"}</span> Run
          </button>
        </div>

        <div className="grid grid-cols-1 @2xl:grid-cols-[172px_minmax(0,1fr)] @5xl:grid-cols-[172px_minmax(0,1fr)_260px]">
          {/* Drawer */}
          <div className="border-b border-border p-3 @2xl:border-b-0 @2xl:border-r">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Components</div>
            <div className="mb-2 text-[10px] text-muted-foreground">Drag onto the board, or click to add.</div>
            {PALETTE.map((grp) => (
              <div key={grp.group} className="mb-2.5">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{grp.group}</div>
                {grp.kinds.map((k) => {
                  const price = SIZE_CATALOG.find((s) => s.id === COMPONENT_CATALOG[k].properties.find((p) => p.type === "size")?.default);
                  return (
                    <button
                      key={k}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData(DRAG_TYPE, k); e.dataTransfer.effectAllowed = "move"; }}
                      onClick={() => addNode(k)}
                      className="mb-1 flex w-full cursor-grab items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-left transition-colors hover:border-blue-400 hover:bg-muted/40 active:cursor-grabbing"
                    >
                      <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded text-[11px]" style={chipStyle(k)}>{ICON[k]}</span>
                      <span className="flex-1 truncate text-[12px] font-medium">{COMPONENT_CATALOG[k].label}</span>
                      {price ? <span className="text-[10px] tabular-nums text-muted-foreground">${price.pricePerHour}</span> : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="flex min-w-0 flex-col">
          <div className="relative h-[460px] bg-muted/20" onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }} onDrop={onDrop}>
            <ReactFlow
              nodes={nodes}
              edges={shownEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={connect}
              onConnectEnd={(_, state) => {
                if (!state.isValid && state.fromNode && state.toNode) explainFailedLink(state.fromNode.id, state.toNode.id);
              }}
              isValidConnection={isValidConnection}
              connectionMode={ConnectionMode.Loose}
              connectionRadius={40}
              onNodeClick={(_, n) => setSelected(n.id)}
              onNodeDoubleClick={(_, n) => toggleDown(n.id)}
              onEdgeDoubleClick={(_, e) => setEdges((es) => es.filter((x) => x.id !== e.id))}
              onNodesDelete={(deleted) => { if (deleted.some((n) => n.id === selected)) setSelected(null); }}
              onPaneClick={() => setSelected(null)}
              edgeTypes={edgeTypes}
              onNodeMouseEnter={(_, n) => setHover({ node: n.id })}
              onNodeMouseLeave={() => setHover(null)}
              onEdgeMouseEnter={(_, e) => setHover({ edge: e.id })}
              onEdgeMouseLeave={() => setHover(null)}
              deleteKeyCode={["Backspace", "Delete"]}
              minZoom={0.35}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={18} size={1} className="!bg-transparent" />
              <Controls showInteractive={false} position="bottom-left" />
            </ReactFlow>
          </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              {notice ? <span className="font-medium text-red-600 dark:text-red-400">{notice}</span> : null}
              <span><span className="font-medium text-foreground">Link</span> drag from any dot to another component</span>
              <span><span className="font-medium text-foreground">Take down</span> double-click a component</span>
              <span><span className="font-medium text-foreground">Remove</span> select it, press Delete</span>
              <span><span className="font-medium text-foreground">Trace</span> hover a component or link</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              <span>Link color = the component it leaves:</span>
              {kindsOnBoard.map((k) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <span aria-hidden className="inline-block h-[3px] w-4 rounded-full" style={{ backgroundColor: KIND_COLOR[k] }} />
                  {COMPONENT_CATALOG[k].label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1">
                <span aria-hidden className="inline-block h-[3px] w-4 rounded-full" style={{ backgroundColor: RED }} />
                down, unlinked or overloaded
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="grid gap-4 border-t border-border p-3 @2xl:col-span-2 @2xl:grid-cols-3 @5xl:col-span-1 @5xl:grid-cols-1 @5xl:border-l @5xl:border-t-0">
            <div>
            <p className="mb-2 text-[12px] leading-snug text-muted-foreground">{spec.scenario}</p>
            <label className="flex items-center justify-between text-[12px] text-muted-foreground">
              <span>Offered load</span>
              <span className="font-semibold tabular-nums text-foreground">{controls.load.toLocaleString()} req/s</span>
            </label>
            <input type="range" min={500} max={12000} step={500} value={controls.load}
              onChange={(e) => setControls((c) => ({ ...c, load: Number(e.target.value) }))}
              className="mb-3 w-full accent-blue-600" />

            {sel && selDef ? (
              <div className="mb-3 rounded-xl border border-border bg-background p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12px] font-semibold">{selDef.label}</span>
                  <button onClick={() => removeNode(sel.id)} className="text-[11px] text-muted-foreground hover:text-red-600">remove</button>
                </div>
                {selDef.properties.map((p) =>
                  p.type === "size" ? (
                    <label key={p.id} className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground">{p.label}</span>
                      <select value={String(selCfg[p.id] ?? p.default)} onChange={(e) => setProp(sel.id, p.id, e.target.value)}
                        className="rounded-md border border-border bg-card px-1.5 py-1 text-[11px]">
                        {SIZE_CATALOG.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                      </select>
                    </label>
                  ) : p.type === "count" ? (
                    <label key={p.id} className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground">{p.label}</span>
                      <input type="number" min={p.min} max={p.max} value={Number(selCfg[p.id] ?? p.default)}
                        onChange={(e) => setProp(sel.id, p.id, Number(e.target.value))}
                        className="w-16 rounded-md border border-border bg-card px-1.5 py-1 text-[11px] tabular-nums" />
                    </label>
                  ) : p.type === "ratio" ? (
                    <label key={p.id} className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground">{p.label}</span>
                      <input type="range" min={0} max={1} step={0.05} value={Number(selCfg[p.id] ?? p.default)}
                        onChange={(e) => setProp(sel.id, p.id, Number(e.target.value))} className="w-20 accent-blue-600" />
                    </label>
                  ) : null,
                )}
                <button
                  onClick={() => toggleDown(sel.id)}
                  className={`mt-1 w-full rounded-md border px-2 py-1 text-[11px] font-semibold ${
                    selCfg.down
                      ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                      : "border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  }`}
                >
                  {selCfg.down ? "Restore" : "Take it down"}
                </button>
              </div>
            ) : (
              <div className="mb-3 rounded-xl border border-dashed border-border p-2.5 text-[11px] text-muted-foreground">
                Click a component to configure it or take it down.
              </div>
            )}

            </div>
            <div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Capacity" value={`${result.capacityCeiling.toLocaleString()}/s`} ok={result.pass.rps} hint={targets.rps ? `need ${targets.rps.toLocaleString()}` : "no target"} />
              <Stat label="p99" value={`${result.p99Ms} ms`} ok={result.pass.p99} hint={targets.p99Ms ? `under ${targets.p99Ms}` : "no target"} />
              <Stat label="Availability" value={`${(result.availability * 100).toFixed(2)}%`} ok={result.pass.availability} hint={targets.availability ? `need ${(targets.availability * 100).toFixed(1)}%` : "no target"} />
              <Stat label="Cost" value={`$${result.costPerHour.toFixed(2)}/h`} ok={result.pass.budget} hint={targets.budgetPerHour ? `budget $${targets.budgetPerHour}` : "no target"} />
            </div>

            <p className={`mt-2.5 text-[12px] font-semibold ${okText(result.allPass)}`}>
              {result.allPass ? "All targets green. Level passed." : result.failure ?? verdict(result)}
            </p>

            </div>
            <div className="@5xl:border-t @5xl:border-border @5xl:pt-2.5">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Missions</div>
              {missions.map(([label, done]) => (
                <div key={label} className="flex items-center gap-2 py-0.5 text-[12px]">
                  <span aria-hidden className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white ${done ? "bg-emerald-600" : "border border-border bg-transparent"}`}>{done ? "✓" : ""}</span>
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BoardCtx.Provider>
  );
}

export function HldBoard({ spec }: { spec: HldLabSpec }) {
  return (
    <ReactFlowProvider>
      <Editor spec={spec} />
    </ReactFlowProvider>
  );
}

function verdict(r: ModelResult): string {
  if (!r.pass.rps) return "Capacity fails: a tier cannot serve the target load.";
  if (!r.pass.p99) return "p99 fails: a tier is past the 70% knee.";
  if (!r.pass.availability) return "Availability fails: add redundancy.";
  return "Over budget: try fewer or smaller instances.";
}
