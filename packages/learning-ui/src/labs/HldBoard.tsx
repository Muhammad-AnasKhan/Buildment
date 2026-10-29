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
import { createPortal } from "react-dom";
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
  useViewport,
  type Connection,
  type Edge,
  type EdgeProps,
  type FinalConnectionState,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ComponentKind } from "./catalog";
import { COMPONENT_CATALOG, SIZE_CATALOG, canConnect, isComponentKind, roleOf } from "./catalog";
import type { Board, HldLabSpec } from "./types";
import { initialControls, type BoardControls, type NodeConfig } from "./hld-board-model";
import type { EdgePart, ModelResult, TierLoad } from "./tiered-architecture";
import { runChallenge, runModel } from "./challenge";
import { RunPanel, PhaseStrip, PHASE_MS, type RunState } from "./RunPanel";
import { SettingsDrawer, anchorStyle, cacheSentence } from "./SettingsDrawer";
import { CompareView, ConfirmBar, PartExplainer, PartList } from "./SolutionPanel";
import { compareDesigns, type CompareResult } from "./solution";
import { BOARD_CSS, FAMILY_LABEL, RED, ROLE_LABEL, colorOf, familyColor, familyOf, paletteFor, tint } from "./board-style";
import { NamesProvider, useNames } from "./names-context";
import { KindGlyph } from "./Glyph";
import { NodeCard, WireTag } from "../lab-ui";
import type { GhostState } from "./solution";

const DRAG_TYPE = "application/x-lab-kind";
const HEAD_BTN = "lab-mono rounded-[4px] px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-slate-200 hover:bg-white/10 hover:text-white disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300";
const NODE_W = 176;
const NODE_H = 104;

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
  /** A run is playing. */
  running: boolean;
  /** The blueprint ghost: how each reference part stands against the learner's design. */
  ghost?: Record<string, GhostState>;
  nameOf: (kind: ComponentKind) => string;
  sizeLabel: (kind: ComponentKind, sizeId: string) => string;
  /** The reference solution: the icon explains a part instead of opening its settings. */
  readOnly: boolean;
  openSettings: (id: string) => void;
  /** While hovering, the components related to the hovered one; others dim. */
  focus: Set<string> | null;
};
const BoardCtx = createContext<Ctx | null>(null);

const PORT =
  "!h-2 !w-2 !rounded-[2px] !border !border-[color:var(--lab-ink2)] transition-transform hover:!scale-[1.6] after:absolute after:-inset-3 after:content-['']";

function TierNode({ id, data }: NodeProps<Node<TierData>>) {
  const ctx = useContext(BoardCtx)!;
  const cfg = ctx.cfg[id] ?? {};
  const tier = ctx.tiers.get(id);
  const down = Boolean(cfg.down);
  const linked = ctx.reachable.has(id);
  const size = typeof cfg.size === "string" ? cfg.size : null;
  const count = typeof cfg.count === "number" ? cfg.count : typeof cfg.replicas === "number" ? cfg.replicas + 1 : typeof cfg.zones === "number" ? cfg.zones : 1;
  const load = tier && linked && !down && !tier.managed ? tier.utilisation : null;
  const units = tier && !tier.managed && linked ? tier.units : count;
  const color = colorOf(data.kind);
  const subtitle = size ? `${ctx.sizeLabel(data.kind, size)}${units > 1 ? ` x${units}` : ""}` : ROLE_LABEL[roleOf(data.kind)];
  return (
    <NodeCard
      name={ctx.nameOf(data.kind)}
      subtitle={subtitle}
      role={roleOf(data.kind)}
      color={color}
      units={units}
      load={load}
      lost={ctx.hit.has(id) && !down}
      down={down}
      linked={linked}
      managed={Boolean(tier?.managed)}
      selected={ctx.selected === id}
      dimmed={ctx.focus != null && !ctx.focus.has(id)}
      open={ctx.drawerId === id}
      readOnly={ctx.readOnly}
      shaking={ctx.running && down}
      ghost={ctx.ghost?.[id]}
      note={tier?.note}
      caption={data.kind === "client" ? "where requests start" : undefined}
      title={tier?.cacheStats && linked && !down ? cacheSentence(tier.cacheStats) : undefined}
      tuneFor={id}
      tuneDisabled={ctx.locked}
      onTune={() => ctx.openSettings(id)}
    >
      <Handle type="source" id="t" position={Position.Top} className={PORT} style={{ backgroundColor: color }} />
      <Handle type="source" id="r" position={Position.Right} className={PORT} style={{ backgroundColor: color }} />
      <Handle type="source" id="l" position={Position.Left} className={PORT} style={{ backgroundColor: color }} />
      <Handle type="source" id="b" position={Position.Bottom} className={PORT} style={{ backgroundColor: color }} />
    </NodeCard>
  );
}
const nodeTypes = { tier: TierNode };

type FlowData = { color: string; state: "live" | "hot" | "dead"; flow: number; dim: boolean; parts: EdgePart[] };

/** How many signal packets ride a link: one for a trickle, up to four for a flood. */
function dotsFor(flow: number): number {
  if (flow < 1) return 0;
  return Math.min(4, Math.max(1, Math.ceil(Math.log10(flow + 1)) - 1));
}

/**
 * A link drawn as a cable: a wide casing, a core trace in the colour of the part it
 * leaves, small rectangular signal packets riding it (more for more traffic), and
 * one wire tag at the middle. A busy link is drawn with a double-dash pattern and a
 * dead one with sparse dots, so the state never depends on colour alone.
 */
function FlowEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected, data }: EdgeProps<Edge<FlowData>>) {
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 8 });
  const state = data?.state ?? "live";
  const color = state === "live" ? data?.color ?? "var(--lab-compute)" : RED;
  const fade = (data?.dim ? 0.2 : 1) * (state === "dead" ? 0.7 : 1);
  const dots = state === "dead" ? 0 : dotsFor(data?.flow ?? 0);
  const duration = state === "hot" ? 0.9 : 1.8;
  const dash = state === "dead" ? "2 5" : state === "hot" ? "10 3 2 3" : "8 5";
  return (
    <>
      <path d={path} fill="none" stroke="var(--lab-grid)" strokeWidth={selected ? 8 : 6} strokeLinecap="square" opacity={0.35 * fade} aria-hidden />
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        interactionWidth={22}
        className={state === "dead" ? undefined : "lab-edge-live"}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : state === "hot" ? 3 : 2,
          strokeDasharray: dash,
          opacity: fade,
          transition: "opacity 0.2s ease, stroke 0.3s ease",
        }}
      />
      {Array.from({ length: dots }, (_, i) => (
        <rect key={i} x={-3} y={-1.25} width={6} height={2.5} rx={1} fill={color} opacity={fade} className="lab-packet" aria-hidden>
          <animateMotion dur={`${duration}s`} begin={`${-(duration / dots) * i}s`} repeatCount="indefinite" path={path} rotate="auto" />
        </rect>
      ))}
      {state !== "dead" && data && data.flow > 0 ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute transition-opacity"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, opacity: fade }}
          >
            <WireTag color={color} flow={data.flow} parts={data.parts} />
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
const edgeTypes = { flow: FlowEdge };

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
  return new Map(nodes.map((n, i) => [n.id, grid ? { x: n.x * 250 + 30, y: n.y * 160 + 20 } : { x: 80, y: i * 140 }]));
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
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

function Editor({ spec, onReset, solutionMode = false, onRun, onSnapshot, canOpenSolution = false, onOpenSolution, onBack, onCopy, onCompare, compare, onHideCompare, isFullscreen = false, onToggleFullscreen }: EditorProps) {
  const readOnly = solutionMode;
  const [confirm, setConfirm] = useState<"solution" | "copy" | null>(null);
  const start: Board = spec.startingBoard ?? { nodes: [], edges: [] };
  const targets = useMemo(() => spec.levels[0]?.targets ?? {}, [spec]);
  const { screenToFlowPosition, fitView, setCenter, getZoom } = useReactFlow();
  const viewport = useViewport();
  const names = useNames();
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

  const openSettings = useCallback((id: string) => {
    setSelected(id);
    const opening = drawerId !== id;
    setDrawerId(opening ? id : null);
    // On a phone the cassette is a deck along the bottom: lift the part into the view above it.
    const node = nodes.find((n) => n.id === id);
    if (opening && node && (rootRef.current?.clientWidth ?? 1000) < 576) {
      const zoom = getZoom();
      setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2 + 110 / zoom, { zoom, duration: 250 });
    }
  }, [drawerId, nodes, getZoom, setCenter]);
  function closeDrawer() {
    const id = drawerId;
    setDrawerId(null);
    if (id) requestAnimationFrame(() => rootRef.current?.querySelector<HTMLButtonElement>(`[data-settings-for="${CSS.escape(id)}"]`)?.focus());
  }
  const ctx: Ctx = useMemo(
    () => ({
      tiers: new Map(shownResult.tiers.map((t) => [t.id, t])), cfg: shownCfg, reachable, selected, drawerId, hit,
      locked: runPhase !== null, running: runPhase !== null, ghost: readOnly ? compare?.nodes : undefined, readOnly, openSettings, focus,
      nameOf: names.nameOf, sizeLabel: names.sizeText,
    }),
    [shownResult, shownCfg, reachable, selected, drawerId, hit, runPhase, focus, readOnly, compare, names, openSettings],
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
  const familiesOnBoard = [...new Set(nodes.map((n) => familyOf(n.data.kind)))];
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
  const kindOf = (id?: string | null): ComponentKind | undefined => nodes.find((n) => n.id === id)?.data.kind;
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
    // On a phone a wide design would shrink to unreadable text, so keep it readable and let the learner pan.
    const narrow = (rootRef.current?.clientWidth ?? 1000) < 520;
    const t = setTimeout(() => fitView({ padding: isFullscreen ? 0.16 : 0.12, maxZoom: 1, minZoom: narrow ? 0.55 : 0.35 }), isFullscreen ? 120 : 50);
    return () => clearTimeout(t);
  }, [fitView, isFullscreen]);

  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      if (drawerId) {
        e.stopPropagation();
        closeDrawer();
      } else if (isFullscreen && onToggleFullscreen) {
        e.stopPropagation();
        onToggleFullscreen();
      }
    }
  };

  const hasCache = nodes.some((n) => roleOf(n.data.kind) === "cache");
  const drawerNode = drawerId ? nodes.find((n) => n.id === drawerId) : null;
  const ran = runState === "done";
  const challengeLabel = spec.challenge ? "Visual challenge" : "LVL 1";
  const solution = spec.solution;
  // The cassette grows out beside its component: its position follows the node through pan and zoom.
  const anchor = drawerNode
    ? anchorStyle(
        `min(${Math.round((drawerNode.position.x + NODE_W) * viewport.zoom + viewport.x + 14)}px, calc(100% - 284px))`,
        `max(8px, min(${Math.round(drawerNode.position.y * viewport.zoom + viewport.y)}px, calc(100% - 430px)))`,
      )
    : undefined;
  const checkLabels = useMemo(() => Object.fromEntries(report.checks.map((c) => [c.id, c.label])), [report]);

  return (
    <BoardCtx.Provider value={ctx}>
      <style>{BOARD_CSS}</style>
      <div ref={rootRef} onKeyDown={onRootKeyDown} className={`lab-board not-prose @container overflow-hidden rounded-[10px] border-[1.5px] border-border bg-card text-card-foreground ${isFullscreen ? "shadow-2xl ring-1 ring-white/10" : "my-6 shadow-[0_2px_0_0_var(--lab-edge-shadow)]"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[color:var(--lab-inspector)] px-4 py-2 text-slate-100">
          <div className="flex min-w-0 items-center gap-2">
            {readOnly ? (
              <span className="lab-mono shrink-0 rounded-[4px] bg-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-900" data-testid="solution-badge">Reference solution</span>
            ) : (
              <span className="lab-mono shrink-0 rounded-[4px] border border-sky-300/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200">{challengeLabel}</span>
            )}
            <span className="lab-display truncate text-[14px] font-semibold">{spec.title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Names" className="lab-mono flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-300">
              <span>Names</span>
              <span className="flex overflow-hidden rounded-[4px] border border-slate-500">
                {(["generic", "aws"] as const).map((m) => (
                  <button key={m} type="button" aria-pressed={names.mode === m} data-testid={`names-${m}`} onClick={() => names.setMode(m)}
                    className={`px-1.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${names.mode === m ? "bg-sky-300 text-slate-900" : "text-slate-200 hover:bg-white/10"}`}>
                    {m === "aws" ? "AWS" : "Generic"}
                  </button>
                ))}
              </span>
            </div>
            {ran ? (
              <span key={report.passed} className={`lab-stamp lab-mono rounded-[4px] border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${report.allPass ? "border-emerald-300 text-emerald-300" : "border-red-300 text-red-300"}`} data-testid="score-chip">
                {report.allPass ? `${report.total}/${report.total} passed` : `${report.passed}/${report.total} checks`}
              </span>
            ) : null}
            {readOnly ? (
              <>
                <button type="button" onClick={onBack} className={HEAD_BTN}>Back to my design</button>
                <button type="button" onClick={onCompare} className={HEAD_BTN} data-testid="compare-button">Compare with mine</button>
                <button type="button" onClick={() => setConfirm("copy")} disabled={running} className={`${HEAD_BTN} border border-slate-500`} data-testid="copy-button">Copy to my board</button>
              </>
            ) : (
              <>
                <button type="button" onClick={onReset} disabled={running} className={HEAD_BTN}>Reset</button>
                {solution && onOpenSolution ? (
                  <button
                    type="button"
                    onClick={() => setConfirm("solution")}
                    disabled={!canOpenSolution || running}
                    title={canOpenSolution ? "See how this lab is solved" : "Press Run once first, then you can see a solution"}
                    className={`${HEAD_BTN} border border-slate-500`}
                    data-testid="solution-button"
                  >
                    Solution
                  </button>
                ) : null}
              </>
            )}
            {running ? (
              <button type="button" onClick={skipRun} className={`${HEAD_BTN} border border-slate-500`}>Skip to results</button>
            ) : null}
            {onToggleFullscreen ? (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="lab-mono flex items-center gap-1.5 rounded-[4px] border border-sky-400/60 bg-sky-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-200 hover:bg-sky-500/35 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Full Screen"}
                data-testid="fullscreen-button"
              >
                {isFullscreen ? (
                  <>
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                    <span>Exit full screen</span>
                  </>
                ) : (
                  <>
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                    <span>Full screen</span>
                  </>
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={startRun}
              disabled={running}
              data-testid="run-button"
              className="lab-mono flex items-center gap-1.5 rounded-[5px] border-b-2 border-emerald-950 bg-emerald-700 px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider text-white hover:bg-emerald-600 active:translate-y-[2px] active:border-b-0 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
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

        <div className="grid grid-cols-1 @2xl:grid-cols-[224px_minmax(0,1fr)] overflow-hidden">
          {/* Palette: a row you scroll on a phone, a column on a wider board. In the solution view, the list of parts. */}
          {readOnly && solution ? (
            <PartList solution={solution} nodes={nodes.map((n) => ({ id: n.id, kind: n.data.kind }))} openId={drawerId} onOpen={openSettings} />
          ) : (
          <div className="flex flex-col border-b border-border p-3 @2xl:border-b-0 @2xl:border-r bg-card/40 overflow-hidden" role="group" aria-label="Components">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Components</div>
            <div className="mb-2 text-[10px] text-muted-foreground">Drag onto the board, or tap to add.</div>
            <div className={`flex gap-3 overflow-x-auto pb-1.5 diagram-scroll-container @2xl:block @2xl:overflow-y-auto @2xl:overflow-x-hidden @2xl:pr-1.5 @2xl:pb-1 custom-scrollbar ${isFullscreen ? "@2xl:max-h-[58vh]" : "@2xl:max-h-[540px]"}`}>
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
                        aria-label={`Add ${names.nameOf(k)}`}
                        onDragStart={(e) => { e.dataTransfer.setData(DRAG_TYPE, k); e.dataTransfer.effectAllowed = "move"; }}
                        onClick={() => addNode(k)}
                        className="flex shrink-0 cursor-grab items-center gap-2 rounded-[6px] border-[1.5px] border-border bg-card px-2 py-1.5 text-left shadow-[0_2px_0_0_var(--lab-edge-shadow)] transition-colors hover:bg-muted active:translate-y-px active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--lab-accent)] @2xl:mb-1 @2xl:w-full"
                      >
                        <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px]" style={{ backgroundColor: tint(colorOf(k), 14), color: colorOf(k) }}><KindGlyph kind={k} size={16} /></span>
                        <span className="flex-1 whitespace-nowrap text-[12px] font-medium leading-tight @2xl:whitespace-normal">{names.nameOf(k)}</span>
                        {price ? <span className="hidden shrink-0 text-[10px] tabular-nums text-muted-foreground @2xl:inline">${price.pricePerHour}</span> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Canvas, with the settings drawer laid over its right edge (or bottom, on a phone). */}
          <div className="flex min-w-0 flex-col overflow-hidden">
            <div
              className={`relative overflow-hidden bg-[color:var(--lab-canvas)] transition-all ${isFullscreen ? "h-[55vh] min-h-[440px] @2xl:h-[58vh]" : "h-[520px] @2xl:h-[580px]"}`}
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
                onConnectEnd={(_: MouseEvent | TouchEvent, state: FinalConnectionState) => {
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
                <Background variant={BackgroundVariant.Cross} gap={18} size={6} color="var(--lab-grid)" className="!bg-transparent" />
                <Controls showInteractive={false} position="bottom-left" />
              </ReactFlow>
              {drawerNode && readOnly ? (
                <PartExplainer
                  anchor={anchor}
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
                  anchor={anchor}
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
                  <span className="font-medium text-foreground">Cache</span> the server asks it first. If the answer is there (a cache hit), the database is never asked. Only misses go on. Linking the cache to the database too is optional: the cache then loads from it on a miss.
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
              <span>Link color = the component it leaves:</span>
              {familiesOnBoard.map((f) => (
                <span key={f} className="inline-flex items-center gap-1">
                  <span aria-hidden className="inline-block h-[3px] w-4" style={{ backgroundColor: familyColor(f) }} />
                  {FAMILY_LABEL[f]}
                </span>
              ))}
              <span className="inline-flex items-center gap-1">
                <span aria-hidden className="inline-block h-[3px] w-4" style={{ backgroundColor: RED }} />
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mine = useRef<{ board: Board; load: number } | null>(null);
  const onSnapshot = useCallback((board: Board, load: number) => { mine.current = { board, load }; }, []);

  const mineSpec = useMemo(() => (seed ? { ...spec, startingBoard: seed } : spec), [spec, seed]);
  const solutionSpec = useMemo(() => (spec.solution ? { ...spec, startingBoard: spec.solution.board } : spec), [spec]);

  // Lock body scroll and listen for Escape key in full-screen modal mode
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  const boardContent = (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] bg-slate-950/92 backdrop-blur-md p-2 sm:p-4 md:p-5 overflow-y-auto custom-scrollbar animate-in fade-in-0 duration-200"
          : ""
      }
    >
      <div className={isFullscreen ? "mx-auto w-full max-w-[1680px] pb-6" : ""}>
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
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </ReactFlowProvider>
        </div>
        {mode === "solution" && spec.solution ? (
          <div>
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
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            </ReactFlowProvider>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <NamesProvider>
      {isFullscreen && typeof document !== "undefined"
        ? createPortal(boardContent, document.body)
        : boardContent}
    </NamesProvider>
  );
}
