"use client";

// The build canvas: devices are positioned boxes, cables are lines under them.
// A device moves by dragging its body and is cabled by dragging from its port
// handle to another device. Every one of those has a tap or key path too:
// tap the handle, then tap the other device; arrow keys move; Delete removes.

import type { RefObject } from "react";
import { useRef, useState } from "react";
import type { BuildDevice, BuildState } from "./build-model";
import { CANVAS_H, CANVAS_W, NODE_H, NODE_W, deviceById, endpointDevice, endpointIface, nextSlot } from "./build-model";
import { cableLabels } from "./build-layout";
import { BUILD_TONE } from "./build-style";

export type Selection = { type: "device"; id: string } | { type: "cable"; id: string } | null;

interface Props {
  state: BuildState;
  selected: Selection;
  pending: string | null;
  armed: string | null;
  armedLabel?: string;
  // Run view: no editing, a tap opens that device's terminal.
  readOnly: boolean;
  focusId?: string;
  canvasRef: RefObject<HTMLDivElement | null>;
  onPlace: (x: number, y: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  onActivate: (id: string) => void;
  onSelectCable: (id: string) => void;
  onConnect: (from: string, to: string) => void;
  onStartCable: (id: string) => void;
  onRemoveDevice: (id: string) => void;
  onRemoveCable: (id: string) => void;
  onCancel: () => void;
  onNote: (message: string) => void;
}

const TAP_SLOP = 4;
const WIRE_SLOP = 8;
const KEY_STEP = 10;

function deviceAt(state: BuildState, x: number, y: number, except: string): BuildDevice | undefined {
  return state.devices.find((d) => d.id !== except && Math.abs(d.x - x) <= NODE_W / 2 + 6 && Math.abs(d.y - y) <= NODE_H / 2 + 6);
}

const kindWord = (d: BuildDevice) => (d.kind === "router" ? "router" : d.kind === "switch" ? "switch" : "host");

export function BuildCanvas(p: Props) {
  const { state, selected, pending, armed, readOnly, canvasRef } = p;
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const wireStart = useRef<{ from: string; sx: number; sy: number; moved: boolean } | null>(null);
  const [wire, setWire] = useState<{ from: string; x: number; y: number; over: string | null } | null>(null);

  function local(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  }

  // ---- moving a device ----------------------------------------------------

  function nodeDown(e: React.PointerEvent<HTMLDivElement>, d: BuildDevice) {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: d.id, sx: e.clientX, sy: e.clientY, ox: d.x, oy: d.y, moved: false };
  }

  function nodeMove(e: React.PointerEvent<HTMLDivElement>) {
    const g = drag.current;
    if (!g || readOnly) return;
    if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < TAP_SLOP) return;
    g.moved = true;
    p.onMove(g.id, g.ox + e.clientX - g.sx, g.oy + e.clientY - g.sy);
  }

  function nodeUp() {
    const g = drag.current;
    drag.current = null;
    if (g && !g.moved) p.onActivate(g.id);
  }

  function nodeKey(e: React.KeyboardEvent<HTMLDivElement>, d: BuildDevice) {
    if (e.target !== e.currentTarget) return;
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      p.onActivate(d.id);
    } else if (arrows[e.key] && !readOnly) {
      e.preventDefault();
      p.onMove(d.id, d.x + arrows[e.key][0], d.y + arrows[e.key][1]);
    } else if ((e.key === "Delete" || e.key === "Backspace") && !readOnly) {
      e.preventDefault();
      p.onRemoveDevice(d.id);
    } else if (e.key === "Escape") {
      p.onCancel();
    }
  }

  // ---- drawing a cable ----------------------------------------------------

  function handleDown(e: React.PointerEvent<HTMLButtonElement>, d: BuildDevice) {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    wireStart.current = { from: d.id, sx: e.clientX, sy: e.clientY, moved: false };
  }

  function handleMove(e: React.PointerEvent<HTMLButtonElement>) {
    const w = wireStart.current;
    if (!w) return;
    if (!w.moved && Math.hypot(e.clientX - w.sx, e.clientY - w.sy) < WIRE_SLOP) return;
    w.moved = true;
    const at = local(e.clientX, e.clientY);
    setWire({ from: w.from, ...at, over: deviceAt(state, at.x, at.y, w.from)?.id ?? null });
  }

  function handleUp(e: React.PointerEvent<HTMLButtonElement>) {
    const w = wireStart.current;
    wireStart.current = null;
    setWire(null);
    if (!w) return;
    if (!w.moved) {
      p.onStartCable(w.from);
      return;
    }
    const at = local(e.clientX, e.clientY);
    const target = deviceAt(state, at.x, at.y, w.from);
    if (target) p.onConnect(w.from, target.id);
    else p.onNote("The cable was dropped on empty canvas, so nothing was joined.");
  }

  // ---- the canvas itself --------------------------------------------------

  function canvasKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if ((e.key === "Enter" || e.key === " ") && armed && !readOnly) {
      e.preventDefault();
      const slot = nextSlot(state);
      p.onPlace(slot.x, slot.y);
    } else if (e.key === "Escape") {
      p.onCancel();
    }
  }

  const cableEnd = (end: string) => deviceById(state, endpointDevice(end));
  const labels = cableLabels(state);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <div
        ref={p.canvasRef}
        role="group"
        tabIndex={readOnly ? -1 : 0}
        aria-label={
          readOnly
            ? "Network map. Select a device to open its terminal."
            : armed
              ? `Network canvas. ${p.armedLabel ?? "A part"} is picked up: press Enter or tap here to place it.`
              : "Network canvas. Drag a device by its body to move it, or use the arrow keys. Drag from a device's port handle to another device to cable them."
        }
        onClick={(e) => {
          if (e.target !== e.currentTarget || readOnly) return;
          if (armed) {
            const at = local(e.clientX, e.clientY);
            p.onPlace(at.x, at.y);
          } else p.onCancel();
        }}
        onKeyDown={canvasKey}
        className={`relative mx-auto select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${armed ? "cursor-copy" : ""}`}
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundImage: "radial-gradient(circle, color-mix(in oklab, currentColor 14%, transparent) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {state.devices.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-sm text-muted-foreground">
            {readOnly ? "Nothing was built." : "Drag a part here, or pick one up and tap here, to start building."}
          </p>
        )}
        <svg width={CANVAS_W} height={CANVAS_H} className="pointer-events-none absolute left-0 top-0">
          {state.cables.map((c) => {
            const a = cableEnd(c.a);
            const b = cableEnd(c.b);
            if (!a || !b) return null;
            const isSel = selected?.type === "cable" && selected.id === c.a;
            return (
              <g key={c.a}>
                <g
                  role="button"
                  tabIndex={readOnly ? -1 : 0}
                  aria-label={`Cable from ${a.label} ${endpointIface(c.a)} to ${b.label} ${endpointIface(c.b)}. Press Enter to select it, Delete to remove it.`}
                  aria-pressed={isSel}
                  onClick={() => !readOnly && p.onSelectCable(c.a)}
                  onKeyDown={(e) => {
                    if (readOnly) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      p.onSelectCable(c.a);
                    } else if (e.key === "Delete" || e.key === "Backspace") {
                      e.preventDefault();
                      p.onRemoveCable(c.a);
                    }
                  }}
                  className="group outline-none"
                  style={{ cursor: readOnly ? "default" : "pointer" }}
                >
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={20} style={{ pointerEvents: readOnly ? "none" : "stroke" }} />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    strokeWidth={isSel ? 5 : 3}
                    strokeLinecap="round"
                    className={`pointer-events-none group-focus-visible:stroke-violet-500 ${isSel ? "stroke-violet-500" : "stroke-slate-400 dark:stroke-slate-500"}`}
                  />
                </g>
              </g>
            );
          })}
          {labels.map((l) => (
            <g key={l.end} className="pointer-events-none">
              <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={4} className="fill-card" fillOpacity={0.9} />
              <text x={l.x + l.w / 2} y={l.y + 10} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                {l.iface}
              </text>
              {l.addr && (
                <text x={l.x + l.w / 2} y={l.y + 21} textAnchor="middle" className="fill-foreground font-mono text-[11px] font-medium">
                  {l.addr}
                </text>
              )}
            </g>
          ))}
          {wire &&
            (() => {
              const from = deviceById(state, wire.from);
              return from ? <line x1={from.x} y1={from.y} x2={wire.x} y2={wire.y} strokeWidth={3} strokeDasharray="6 6" className="stroke-violet-500" /> : null;
            })()}
        </svg>
        {state.devices.map((d) => {
          const tone = BUILD_TONE[d.kind];
          const isSel = selected?.type === "device" && selected.id === d.id;
          const isPending = pending === d.id;
          const isOver = wire?.over === d.id;
          const isFocus = p.focusId === d.id;
          const label = readOnly
            ? d.kind === "switch"
              ? `${d.label}, switch, no terminal`
              : `${d.label}, open its terminal`
            : pending && pending !== d.id
              ? `${d.label}, ${kindWord(d)}. Press Enter to cable it to ${deviceById(state, pending)?.label ?? "the other device"}.`
              : `${d.label}, ${kindWord(d)}. Press Enter to select it, arrow keys to move it, Delete to remove it.`;
          return (
            <div
              key={d.id}
              role="button"
              tabIndex={0}
              aria-label={label}
              aria-pressed={isSel || isFocus}
              onPointerDown={(e) => nodeDown(e, d)}
              onPointerMove={nodeMove}
              onPointerUp={nodeUp}
              onPointerCancel={() => (drag.current = null)}
              onKeyDown={(e) => nodeKey(e, d)}
              className={`absolute z-10 grid select-none place-items-center rounded-xl border-2 px-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${tone.box} ${
                isSel || isFocus ? "ring-2 ring-violet-500" : ""
              } ${isPending ? "ring-2 ring-amber-500" : ""} ${isOver ? "ring-4 ring-violet-500/60" : ""} ${readOnly ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}`}
              style={{ left: d.x - NODE_W / 2, top: d.y - NODE_H / 2, width: NODE_W, height: NODE_H, touchAction: "none" }}
            >
              <span className="pointer-events-none leading-tight">
                <span className="block text-sm font-semibold">{d.label}</span>
                <span className={`block text-[10px] uppercase tracking-wide ${tone.tag}`}>{d.kind}</span>
              </span>
              {!readOnly && (
                <button
                  type="button"
                  aria-label={pending === d.id ? `Cancel the cable from ${d.label}` : pending ? `Cable ${deviceById(state, pending)?.label ?? "the other device"} to ${d.label}` : `Start a cable from ${d.label}`}
                  title="Drag to another device to cable them"
                  onPointerDown={(e) => handleDown(e, d)}
                  onPointerMove={handleMove}
                  onPointerUp={handleUp}
                  onPointerCancel={() => {
                    wireStart.current = null;
                    setWire(null);
                  }}
                  onClick={(e) => {
                    if (e.detail !== 0) return;
                    if (pending && pending !== d.id) p.onConnect(pending, d.id);
                    else p.onStartCable(d.id);
                  }}
                  style={{ touchAction: "none" }}
                  className={`absolute -right-3.5 top-1/2 grid size-7 -translate-y-1/2 cursor-crosshair place-items-center rounded-full border-2 bg-background outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isPending ? "border-amber-500" : "border-slate-400 dark:border-slate-500"
                  }`}
                >
                  <span className={`size-2 rounded-full ${isPending ? "bg-amber-500" : "bg-slate-400 dark:bg-slate-500"}`} aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
