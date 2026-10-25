"use client";

// The interactive HLD lab board: a small architecture editor and a runner.
//
// Layout: the component palette on the left, the canvas in the middle, and the
// brief, live numbers and checks underneath. Component settings are not on the
// page: hover or focus a component and a small settings icon appears on it;
// clicking it opens one dark drawer on the right (a bottom sheet on a phone).
//
// Drag components from the palette onto the canvas, link them by dragging from a
// dot on one to a dot on another (only links the catalog allows), then press Run.
// Run plays the design through every scenario of the challenge (peak traffic,
// then each failure), shows the traffic, saturation and failures on the board,
// and lists every check as pass or fail with the value measured.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
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
import { Info, Settings } from "lucide-react";
import type { ComponentKind } from "./catalog";
import { COMPONENT_CATALOG, SIZE_CATALOG, canConnect, isComponentKind, roleOf } from "./catalog";
import type { Board, HldLabSpec } from "./types";
import { initialControls, type BoardControls, type NodeConfig } from "./hld-board-model";
import type { EdgePart, ModelResult, TierLoad } from "@/lab/tiered-architecture";
import { runChallenge, runModel } from "./challenge";
import { RunPanel, PhaseStrip, type RunState } from "./RunPanel";
import { SettingsDrawer, cacheSentence } from "./SettingsDrawer";
import { CompareView, ConfirmBar, PartExplainer, PartList } from "./SolutionPanel";
import { compareDesigns, type CompareResult } from "./solution";
import { RED, ROLE_COLOR, ROLE_LABEL, chipStyle, colorOf, iconOf, paletteFor, utilBar, utilText } from "./board-style";

const DRAG_TYPE = "application/x-lab-kind";
const NODE_W = 158;
const NODE_H = 92;
/** How long the run stays on each scenario. */
const PHASE_MS = 2600;

type TierData = { kind: ComponentKind };
type Ctx = {
  tiers: Map<string, TierLoad>;
  cfg: Record<string, NodeConfig>;
  reachable: Set<string>;
  selected: string | null;
  drawerId: string | null;
  /** Components the current scenario took down or thinned out. */
  hit: Set<string>;
  locked: boolean;
  /** The reference solution: the icon explains a part instead of opening its settings. */
  readOnly: boolean;
  openSettings: (id: string) => void;
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
  const u = tier && linked && !down && !tier.managed ? tier.utilisation : null;
  const shownCount = tier && !tier.managed && linked ? tier.units : count;
  const lost = ctx.hit.has(id) && !down;
  const open = ctx.drawerId === id;

  const frame = down
    ? "border-red-500 bg-red-50 dark:bg-red-500/10"
    : !linked
      ? "border-dashed border-muted-foreground/40 bg-card"
      : ctx.selected === id
        ? "border-blue-500 bg-card ring-2 ring-blue-500/30"
        : "border-border bg-card";

  const color = colorOf(data.kind);
  const dimmed = ctx.focus != null && !ctx.focus.has(id);

  return (
    <div
      title={tier?.cacheStats && linked && !down ? cacheSentence(tier.cacheStats) : undefined}
      className={`group/node relative w-[158px] rounded-xl border px-3 py-2 text-card-foreground shadow-sm transition-[box-shadow,opacity] duration-200 ${frame} ${dimmed ? "opacity-30" : ""}`}
      style={down ? undefined : { borderTopColor: color, borderTopWidth: 3 }}
    >
      {/* The settings icon: only on hover or focus (always on touch screens), never the drawer itself. */}
      <button
        type="button"
        data-settings-for={id}
        aria-label={ctx.readOnly ? `Why ${def.label} is in the solution` : `Settings for ${def.label}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? "lab-settings-drawer" : undefined}
        disabled={ctx.locked}
        onClick={(e) => { e.stopPropagation(); ctx.openSettings(id); }}
        className={`nodrag nopan absolute -right-2.5 -top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-100 shadow transition-opacity hover:bg-slate-700 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:hidden group-focus-within/node:opacity-100 group-hover/node:opacity-100 [@media(hover:none)]:opacity-100 ${open || ctx.selected === id ? "opacity-100" : "opacity-0"}`}
      >
        {ctx.readOnly ? <Info className="h-3.5 w-3.5" aria-hidden /> : <Settings className="h-3.5 w-3.5" aria-hidden />}
      </button>
      {/* A dot on every side. The board runs in loose mode, so any dot can start or end a link. */}
      <Handle type="source" id="t" position={Position.Top} className={HANDLE} style={{ backgroundColor: color }} />
      <Handle type="source" id="r" position={Position.Right} className={HANDLE} style={{ backgroundColor: color }} />
      <Handle type="source" id="l" position={Position.Left} className={HANDLE} style={{ backgroundColor: color }} />
      <div className="flex items-center gap-2">
        <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[13px] ${down ? "opacity-50" : ""}`} style={chipStyle(data.kind)}>{iconOf(data.kind)}</span>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-[13px] font-medium leading-tight ${down ? "text-red-600 line-through dark:text-red-400" : ""}`}>{def.label}</div>
          <div className="truncate text-[10px] text-muted-foreground">
            {def.vendor}{size ? ` · ${size}` : ""}{shownCount != null && size ? ` x${shownCount}` : ""}
          </div>
        </div>
      </div>
      {down ? (
        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">DOWN</div>
      ) : lost ? (
        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">1 LOST</div>
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
      {!down && linked && tier?.note ? (
        <div className="mt-1 truncate text-[10px] text-muted-foreground" title={tier.note}>{tier.note}</div>
      ) : !down && linked && tier?.managed ? (
        <div className="mt-1 text-[10px] text-muted-foreground">managed, scales for you</div>
      ) : null}
      <Handle type="source" id="b" position={Position.Bottom} className={HANDLE} style={{ backgroundColor: color }} />
    </div>
  );
}
const nodeTypes = { tier: TierNode };

type FlowData = { color: string; state: "live" | "hot" | "dead"; flow: number; dim: boolean; parts: EdgePart[] };

/** How many traffic dots ride a link: one for a trickle, up to four for a flood. */
function dotsFor(flow: number): number {
  if (flow < 1) return 0;
  return Math.min(4, Math.max(1, Math.ceil(Math.log10(flow + 1)) - 1));
}

/**
 * A link drawn in the color of the component it leaves, in layers: a wide
 * invisible stroke that is easy to grab, a soft glow, the dashed line with its
 * arrowhead (marching while traffic flows), dots riding along it (more for more
 * traffic, red when the part it feeds is overloaded), and the request rate it carries.
 */
function FlowEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected, data }: EdgeProps<Edge<FlowData>>) {
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 14 });
  const state = data?.state ?? "live";
  const color = state === "live" ? data?.color ?? "#3b82f6" : RED;
  const fade = (data?.dim ? 0.15 : 1) * (state === "dead" ? 0.6 : 1);
  const dots = state === "dead" ? 0 : dotsFor(data?.flow ?? 0);
  const duration = state === "hot" ? 0.9 : 1.8;
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
      {Array.from({ length: dots }, (_, i) => (
        <circle key={i} r={3.5} fill={color} opacity={fade} className="lab-dot" aria-hidden>
          <animateMotion dur={`${duration}s`} begin={`${-(duration / dots) * i}s`} repeatCount="indefinite" path={path} />
        </circle>
      ))}
      {state !== "dead" && data && data.flow > 0 ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute flex flex-col items-center gap-0.5 transition-opacity"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, opacity: fade }}
          >
            {(data.parts.length > 0 ? data.parts : [{ label: "", rate: data.flow }]).map((part) => (
              <div
                key={part.label}
                className="whitespace-nowrap rounded-full border bg-card px-1.5 py-px text-[10px] font-semibold tabular-nums shadow-sm"
                style={{ color, borderColor: `${color}55` }}
              >
                {Math.round(part.rate).toLocaleString()}/s{part.label ? ` ${part.label}` : ""}
              </div>
            ))}
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
@media (prefers-reduced-motion: reduce) { .lab-edge-live { animation: none; } .lab-dot { display: none; } }
.dark .react-flow__controls { box-shadow: none; }
.dark .react-flow__controls-button { background: #1f2937; color: #e5e7eb; border-bottom-color: #374151; }
.dark .react-flow__controls-button:hover { background: #374151; }
.dark .react-flow__controls-button svg { fill: currentColor; }
`;

function defaultsFor(kind: ComponentKind): NodeConfig {
  const cfg: NodeConfig = {};
  for (const p of COMPONENT_CATALOG[kind].properties) cfg[p.id] = p.default;
  return cfg;
}

/**
 * Where a starting board's nodes go. A board authored as a grid (more than one
 * column and more than one row) keeps its shape; a single row or column is laid
 * out as a column, top to bottom, the way a request travels.
 */
function startPositions(nodes: Board["nodes"]): Map<string, { x: number; y: number }> {
  const columns = new Set(nodes.map((n) => n.x)).size;
  const rows = new Set(nodes.map((n) => n.y)).size;
  const grid = columns > 1 && rows > 1;
  return new Map(nodes.map((n, i) => [n.id, grid ? { x: n.x * 200 + 40, y: n.y * 135 + 20 } : { x: 80, y: i * 140 }]));
}

interface EditorProps {
  spec: HldLabSpec;
  onReset: () => void;
  /** The reference solution view: read-only, with an explanation per part. */
  solutionMode?: boolean;
  /** Called when the learner presses Run. */
  onRun?: () => void;
  /** Reports the learner's design as it changes, for the comparison. */
  onSnapshot?: (board: Board, load: number) => void;
  canOpenSolution?: boolean;
  onOpenSolution?: () => void;
  onBack?: () => void;
  onCopy?: () => void;
  onCompare?: () => void;
  compare?: CompareResult | null;
  onHideCompare?: () => void;
}

function Editor({ spec, onReset, solutionMode = false, onRun, onSnapshot, canOpenSolution = false, onOpenSolution, onBack, onCopy, onCompare, compare, onHideCompare }: EditorProps) {
  const readOnly = solutionMode;
  const [confirm, setConfirm] = useState<"solution" | "copy" | null>(null);
  const start: Board = spec.startingBoard ?? { nodes: [], edges: [] };
  const targets = useMemo(() => spec.levels[0]?.targets ?? {}, [spec]);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const seq = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const [initialNodes] = useState<Node<TierData>[]>(() => {
    const at = startPositions(start.nodes);
    return start.nodes.map((n) => ({ id: n.id, type: "tier", position: at.get(n.id)!, width: NODE_W, height: NODE_H, data: { kind: n.kind } }));
  });
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TierData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    start.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to, sourceHandle: e.via?.[0] ?? "b", targetHandle: e.via?.[1] ?? "t" })),
  );
  const [controls, setControls] = useState<BoardControls>(() => initialControls(start, spec.levels[0]?.load ?? 1000));
  const [selected, setSelected] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const load = spec.challenge ? spec.challenge.peakLoad : controls.load;

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
  const result: ModelResult = useMemo(() => runModel(spec, board, load, targets), [spec, board, load, targets]);
  const report = useMemo(() => runChallenge(spec, board, load), [spec, board, load]);
  const designKey = useMemo(() => JSON.stringify([board.nodes.map((n) => [n.id, n.kind, n.props]), board.edges, load]), [board, load]);

  // ---- running the challenge -----------------------------------------------------
  const [runPhase, setRunPhase] = useState<number | null>(null);
  const [ranKey, setRanKey] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  const runState: RunState = runPhase !== null ? "running" : ranKey === null ? "idle" : ranKey === designKey ? "done" : "stale";

  useEffect(() => { onSnapshot?.(board, load); }, [board, load, onSnapshot]);

  function startRun() {
    onRun?.();
    clearTimers();
    setDrawerId(null);
    setPreviewId(null);
    const key = designKey;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRanKey(key);
      return;
    }
    const total = report.phases.length;
    const step = (i: number) => {
      setRunPhase(i);
      timers.current.push(
        setTimeout(() => {
          if (i + 1 < total) step(i + 1);
          else { setRunPhase(null); setRanKey(key); }
        }, PHASE_MS),
      );
    };
    step(0);
  }
  function skipRun() {
    clearTimers();
    setRunPhase(null);
    setRanKey(designKey);
  }

  // What the board shows: the learner's design, or one scenario of the run.
  const view = runPhase !== null ? report.phases[runPhase] : previewId ? report.phases.find((p) => p.id === previewId) ?? null : null;
  const shownBoard = view ? view.board : board;
  const shownResult = view ? view.result : result;
  const shownCfg = useMemo<Record<string, NodeConfig>>(
    () => (view ? Object.fromEntries(view.board.nodes.map((n) => [n.id, (n.props ?? {}) as NodeConfig])) : controls.perNode),
    [view, controls.perNode],
  );
  const hit = useMemo(() => new Set(view?.hit ?? []), [view]);

  const reachable = useMemo(() => {
    const seen = new Set<string>();
    const next = new Map<string, string[]>();
    for (const e of shownBoard.edges) next.set(e.from, [...(next.get(e.from) ?? []), e.to]);
    const isDown = (id: string) => Boolean(shownCfg[id]?.down);
    const queue = shownBoard.nodes.filter((n) => n.kind === "client" && !isDown(n.id)).map((n) => n.id);
    queue.forEach((id) => seen.add(id));
    while (queue.length) {
      const id = queue.shift()!;
      for (const to of next.get(id) ?? []) if (!isDown(to) && !seen.has(to)) { seen.add(to); queue.push(to); }
    }
    return seen;
  }, [shownBoard, shownCfg]);

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

  function openSettings(id: string) {
    setSelected(id);
    setDrawerId((cur) => (cur === id ? null : id));
  }
  function closeDrawer() {
    const id = drawerId;
    setDrawerId(null);
    if (id) requestAnimationFrame(() => rootRef.current?.querySelector<HTMLButtonElement>(`[data-settings-for="${CSS.escape(id)}"]`)?.focus());
  }
  const ctx: Ctx = useMemo(
    () => ({
      tiers: new Map(shownResult.tiers.map((t) => [t.id, t])), cfg: shownCfg, reachable, selected, drawerId, hit,
      locked: runPhase !== null, readOnly, openSettings, focus,
    }),
    [shownResult, shownCfg, reachable, selected, drawerId, hit, runPhase, focus, readOnly],
  );

  const shownEdges: Edge<FlowData>[] = edges.map((e) => {
    const live = reachable.has(e.source) && reachable.has(e.target);
    const target = shownResult.tiers.find((t) => t.id === e.target);
    const state: FlowData["state"] = !live ? "dead" : target && target.utilisation >= 0.9 ? "hot" : "live";
    const sourceKind = nodes.find((n) => n.id === e.source)?.data.kind ?? "app-server";
    const color = state === "live" ? colorOf(sourceKind) : RED;
    const related = !hover || hover.edge === e.id || hover.node === e.source || hover.node === e.target;
    return {
      ...e,
      type: "flow",
      data: {
        color, state, flow: shownResult.edgeFlows[`${e.source}>${e.target}`] ?? 0, dim: !related,
        parts: shownResult.edgeParts[`${e.source}>${e.target}`] ?? [],
      },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 18, height: 18 },
    };
  });
  const rolesOnBoard = [...new Set(nodes.map((n) => roleOf(n.data.kind)))];
  const palette = useMemo(() => paletteFor(spec.allowedComponents), [spec]);
  const running = runPhase !== null;
  /** No editing while a run plays, and none at all in the reference solution. */
  const locked = running || readOnly;

  function addNode(kind: ComponentKind, position?: { x: number; y: number }) {
    if (locked) return;
    seq.current += 1;
    const n = seq.current;
    const id = `${kind}-added-${n}`;
    const at = position ?? { x: 300 + Math.floor((n - 1) / 4) * 190, y: 20 + ((n - 1) % 4) * 130 };
    setNodes((ns) => [...ns, { id, type: "tier", position: at, width: NODE_W, height: NODE_H, data: { kind } }]);
    setControls((c) => ({ ...c, perNode: { ...c.perNode, [id]: defaultsFor(kind) } }));
    setSelected(id);
  }
  function removeNode(id: string) {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    setSelected(null);
    setDrawerId(null);
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
  const reaches = (from: string, to: string) => {
    const seen = new Set([from]);
    const queue = [from];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (id === to) return true;
      for (const e of edges) if (e.source === id && !seen.has(e.target)) { seen.add(e.target); queue.push(e.target); }
    }
    return false;
  };
  const isValidConnection = (c: Connection | Edge) => {
    const o = orient(c.source, c.target);
    return o != null && !alreadyLinked(o.source, o.target) && !reaches(o.target, o.source);
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
    // Keep the sides the learner chose; if we flipped the link's direction, flip its sides too.
    const flipped = o.source !== c.source;
    const sourceHandle = (flipped ? c.targetHandle : c.sourceHandle) ?? "b";
    const targetHandle = (flipped ? c.sourceHandle : c.targetHandle) ?? "t";
    setEdges((es) => [...es, { id: `${o.source}-${o.target}`, source: o.source, target: o.target, sourceHandle, targetHandle }]);
  };
  const explainFailedLink = (from?: string | null, to?: string | null) => {
    const ka = kindOf(from);
    const kb = kindOf(to);
    if (!ka || !kb || from === to) return;
    const a = COMPONENT_CATALOG[ka].label;
    const b = COMPONENT_CATALOG[kb].label;
    const o = orient(from, to);
    flash(!o ? `${a} and ${b} can't be linked: requests never flow between them.` : alreadyLinked(o.source, o.target) ? `${a} and ${b} are already linked.` : `That link would make a loop.`);
  };

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.12, maxZoom: 1 }), 50);
    return () => clearTimeout(t);
  }, [fitView]);

  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && drawerId) { e.stopPropagation(); closeDrawer(); }
  };

  const hasCache = nodes.some((n) => roleOf(n.data.kind) === "cache");
  const drawerNode = drawerId ? nodes.find((n) => n.id === drawerId) : null;
  const ran = runState === "done";
  const challengeLabel = spec.challenge ? "Visual challenge" : "LVL 1";
  const solution = spec.solution;
  const checkLabels = useMemo(() => Object.fromEntries(report.checks.map((c) => [c.id, c.label])), [report]);

  return (
    <BoardCtx.Provider value={ctx}>
      <style>{EDGE_CSS}</style>
      <div ref={rootRef} onKeyDown={onRootKeyDown} className="not-prose @container my-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {readOnly ? (
              <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" data-testid="solution-badge">Reference solution</span>
            ) : (
              <span className="shrink-0 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{challengeLabel}</span>
            )}
            <span className="truncate text-[13px] font-medium">{spec.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {ran ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${report.allPass ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`} data-testid="score-chip">
                {report.passed}/{report.total} checks
              </span>
            ) : null}
            {readOnly ? (
              <>
                <button type="button" onClick={onBack} className="rounded-md px-2 py-1 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Back to my design</button>
                <button type="button" onClick={onCompare} className="rounded-md px-2 py-1 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground" data-testid="compare-button">Compare with mine</button>
                <button type="button" onClick={() => setConfirm("copy")} disabled={running} className="rounded-md border border-border px-2 py-1 text-[12px] font-medium hover:bg-muted disabled:opacity-40" data-testid="copy-button">Copy to my board</button>
              </>
            ) : (
              <>
                <button type="button" onClick={onReset} disabled={running} className="rounded-md px-2 py-1 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40">
                  Reset
                </button>
                {solution && onOpenSolution ? (
                  <button
                    type="button"
                    onClick={() => setConfirm("solution")}
                    disabled={!canOpenSolution || running}
                    title={canOpenSolution ? "See how this lab is solved" : "Press Run once first, then you can see a solution"}
                    className="rounded-md border border-border px-2.5 py-1 text-[12px] font-medium hover:bg-muted disabled:opacity-40"
                    data-testid="solution-button"
                  >
                    Solution
                  </button>
                ) : null}
              </>
            )}
            {running ? (
              <button type="button" onClick={skipRun} className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium hover:bg-muted">
                Skip to results
              </button>
            ) : null}
            <button
              type="button"
              onClick={startRun}
              disabled={running}
              data-testid="run-button"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-transform hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
            >
              <span aria-hidden>{"▶"}</span> {running ? "Running..." : runState === "idle" ? "Run" : "Run again"}
            </button>
          </div>
        </div>

        {confirm === "solution" ? (
          <ConfirmBar
            message="Try once more, or see how it is solved?"
            no="Try once more"
            yes="Show the solution"
            onNo={() => setConfirm(null)}
            onYes={() => { setConfirm(null); onOpenSolution?.(); }}
          />
        ) : null}
        {confirm === "copy" ? (
          <ConfirmBar
            message="Replace your own design with the solution? Your board will be lost."
            no="Keep mine"
            yes="Replace my design"
            onNo={() => setConfirm(null)}
            onYes={() => { setConfirm(null); onCopy?.(); }}
          />
        ) : null}

        {runState !== "idle" ? (
          <PhaseStrip report={report} running={runPhase} previewId={previewId} onPick={setPreviewId} onBack={() => setPreviewId(null)} />
        ) : null}

        <div className="grid grid-cols-1 @2xl:grid-cols-[190px_minmax(0,1fr)]">
          {/* Palette: a row you scroll on a phone, a column on a wider board. In the solution view, the list of parts. */}
          {readOnly && solution ? (
            <PartList solution={solution} nodes={nodes.map((n) => ({ id: n.id, kind: n.data.kind }))} openId={drawerId} onOpen={openSettings} />
          ) : (
          <div className="border-b border-border p-3 @2xl:border-b-0 @2xl:border-r" role="group" aria-label="Components">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Components</div>
            <div className="mb-2 text-[10px] text-muted-foreground">Drag onto the board, or tap to add.</div>
            <div className="flex gap-3 overflow-x-auto pb-1 @2xl:block @2xl:overflow-visible @2xl:pb-0">
              {palette.map((grp) => (
                <div key={grp.group} className="flex shrink-0 items-start gap-1.5 @2xl:mb-2.5 @2xl:block">
                  <div className="hidden text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70 @2xl:mb-1 @2xl:block">{grp.group}</div>
                  {grp.kinds.map((k) => {
                    const price = SIZE_CATALOG.find((s) => s.id === COMPONENT_CATALOG[k].properties.find((p) => p.type === "size")?.default);
                    return (
                      <button
                        key={k}
                        type="button"
                        draggable={!locked}
                        disabled={locked}
                        aria-label={`Add ${COMPONENT_CATALOG[k].label}`}
                        onDragStart={(e) => { e.dataTransfer.setData(DRAG_TYPE, k); e.dataTransfer.effectAllowed = "move"; }}
                        onClick={() => addNode(k)}
                        className="flex shrink-0 cursor-grab items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-left transition-colors hover:border-blue-400 hover:bg-muted/40 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 @2xl:mb-1 @2xl:w-full"
                      >
                        <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded text-[11px]" style={chipStyle(k)}>{iconOf(k)}</span>
                        <span className="flex-1 whitespace-nowrap text-[12px] font-medium @2xl:truncate">{COMPONENT_CATALOG[k].label}</span>
                        {price ? <span className="hidden text-[10px] tabular-nums text-muted-foreground @2xl:inline">${price.pricePerHour}</span> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Canvas, with the settings drawer laid over its right edge (or bottom, on a phone). */}
          <div className="flex min-w-0 flex-col">
            <div
              className="relative h-[440px] overflow-hidden bg-muted/20 @2xl:h-[500px]"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={onDrop}
            >
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
                nodesDraggable={!locked}
                nodesConnectable={!locked}
                onNodeClick={(_, n) => setSelected(n.id)}
                onNodeDoubleClick={(_, n) => { if (!locked) toggleDown(n.id); }}
                onEdgeDoubleClick={(_, e) => { if (!locked) setEdges((es) => es.filter((x) => x.id !== e.id)); }}
                onNodesDelete={(deleted) => {
                  if (deleted.some((n) => n.id === selected)) setSelected(null);
                  if (deleted.some((n) => n.id === drawerId)) setDrawerId(null);
                }}
                onPaneClick={() => { setSelected(null); setDrawerId(null); }}
                edgeTypes={edgeTypes}
                onNodeMouseEnter={(_, n) => setHover({ node: n.id })}
                onNodeMouseLeave={() => setHover(null)}
                onEdgeMouseEnter={(_, e) => setHover({ edge: e.id })}
                onEdgeMouseLeave={() => setHover(null)}
                deleteKeyCode={locked ? null : ["Backspace", "Delete"]}
                minZoom={0.35}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
              >
                <Background variant={BackgroundVariant.Dots} gap={18} size={1} className="!bg-transparent" />
                <Controls showInteractive={false} position="bottom-left" />
              </ReactFlow>
              {drawerNode && readOnly ? (
                <PartExplainer
                  id={drawerNode.id}
                  kind={drawerNode.data.kind}
                  part={solution?.parts[drawerNode.id]}
                  cfg={controls.perNode[drawerNode.id] ?? {}}
                  tier={result.tiers.find((t) => t.id === drawerNode.id)}
                  checkLabels={checkLabels}
                  onClose={closeDrawer}
                />
              ) : drawerNode ? (
                <SettingsDrawer
                  id={drawerNode.id}
                  kind={drawerNode.data.kind}
                  cfg={controls.perNode[drawerNode.id] ?? {}}
                  tier={result.tiers.find((t) => t.id === drawerNode.id)}
                  onChange={(key, value) => setProp(drawerNode.id, key, value)}
                  onToggleDown={() => toggleDown(drawerNode.id)}
                  onRemove={() => removeNode(drawerNode.id)}
                  onClose={closeDrawer}
                />
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              {notice ? <span className="font-medium text-red-600 dark:text-red-400">{notice}</span> : null}
              {readOnly ? (
                <span><span className="font-medium text-foreground">Read only</span> hover or tap a part, then its icon, to see why it is there</span>
              ) : (
                <>
                  <span><span className="font-medium text-foreground">Settings</span> hover or tap a component, then its icon</span>
                  <span><span className="font-medium text-foreground">Link</span> drag from any dot to another component</span>
                  <span><span className="font-medium text-foreground">Remove</span> select it, press Delete</span>
                </>
              )}
              {hasCache ? (
                <span>
                  <span className="font-medium text-foreground">Cache</span> the app server asks it first. A cache hit means the database is never asked; only misses go on. Linking the cache to the database too is optional: it then loads from it on a miss.
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              <span>Link color = the component it leaves:</span>
              {rolesOnBoard.map((r) => (
                <span key={r} className="inline-flex items-center gap-1">
                  <span aria-hidden className="inline-block h-[3px] w-4 rounded-full" style={{ backgroundColor: ROLE_COLOR[r] }} />
                  {ROLE_LABEL[r]}
                </span>
              ))}
              <span className="inline-flex items-center gap-1">
                <span aria-hidden className="inline-block h-[3px] w-4 rounded-full" style={{ backgroundColor: RED }} />
                down, unlinked or overloaded
              </span>
            </div>
          </div>
        </div>

        {readOnly && compare ? <CompareView compare={compare} onClose={() => onHideCompare?.()} /> : null}

        <RunPanel
          spec={spec}
          result={result}
          report={report}
          state={runState}
          running={runPhase}
          ran={ran}
          load={load}
          onLoad={(n) => setControls((c) => ({ ...c, load: n }))}
          onShow={setPreviewId}
        />
      </div>
    </BoardCtx.Provider>
  );
}

export function HldBoard({ spec }: { spec: HldLabSpec }) {
  const [generation, setGeneration] = useState(0);
  const [mode, setMode] = useState<"mine" | "solution">("mine");
  // The learner's own board, if they copied the solution onto it.
  const [seed, setSeed] = useState<Board | null>(null);
  const [everRan, setEverRan] = useState(false);
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const mine = useRef<{ board: Board; load: number } | null>(null);
  const onSnapshot = useCallback((board: Board, load: number) => { mine.current = { board, load }; }, []);

  const mineSpec = useMemo(() => (seed ? { ...spec, startingBoard: seed } : spec), [spec, seed]);
  const solutionSpec = useMemo(() => (spec.solution ? { ...spec, startingBoard: spec.solution.board } : spec), [spec]);

  return (
    <>
      {/* The learner's board stays mounted while the solution is open, so their work is never lost. */}
      <div hidden={mode === "solution"}>
        <ReactFlowProvider key={generation}>
          <Editor
            spec={mineSpec}
            onReset={() => { setSeed(null); setGeneration((g) => g + 1); }}
            onRun={() => setEverRan(true)}
            onSnapshot={onSnapshot}
            canOpenSolution={everRan}
            onOpenSolution={() => { setCompare(null); setMode("solution"); }}
          />
        </ReactFlowProvider>
      </div>
      {mode === "solution" && spec.solution ? (
        <ReactFlowProvider>
          <Editor
            spec={solutionSpec}
            solutionMode
            onReset={() => undefined}
            onBack={() => setMode("mine")}
            onCopy={() => { setSeed(spec.solution!.board); setGeneration((g) => g + 1); setMode("mine"); }}
            onCompare={() => {
              if (mine.current) setCompare(compareDesigns(spec, mine.current.board, runChallenge(spec, mine.current.board, mine.current.load)));
            }}
            compare={compare}
            onHideCompare={() => setCompare(null)}
          />
        </ReactFlowProvider>
      ) : null}
    </>
  );
}
